const Task = require('../models/Task');
const Project = require('../models/Project');
const { asyncHandler } = require('../utils/helpers');

/**
 * @desc    Get all tasks for a project (with filters)
 * @route   GET /api/projects/:projectId/tasks
 * @access  Private
 */
const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, assignedTo } = req.query;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check member access
  if (
    req.user.role !== 'admin' &&
    !project.members.some((m) => m.toString() === req.user.id)
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this project',
    });
  }

  // Build filter
  const filter = { projectId };
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title color')
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * @desc    Get current user's tasks across all projects
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id })
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title color')
    .sort({ dueDate: 1, createdAt: -1 });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = asyncHandler(async (req, res) => {
  let matchStage = {};

  if (req.user.role !== 'admin') {
    // Members only see stats for their projects
    const memberProjects = await Project.find({ members: req.user.id }).select('_id');
    const projectIds = memberProjects.map((p) => p._id);
    matchStage = { projectId: { $in: projectIds } };
  }

  // Overall stats
  const statusCounts = await Task.aggregate([
    { $match: matchStage },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Overdue count
  const overdueCount = await Task.countDocuments({
    ...matchStage,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' },
  });

  // Tasks by project
  const tasksByProject = await Task.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project',
      },
    },
    { $unwind: '$project' },
    {
      $group: {
        _id: '$projectId',
        projectTitle: { $first: '$project.title' },
        projectColor: { $first: '$project.color' },
        count: { $sum: 1 },
      },
    },
  ]);

  // User's assigned tasks
  const myTaskCount = await Task.countDocuments({ assignedTo: req.user.id });

  const stats = {
    total: 0,
    todo: 0,
    'in-progress': 0,
    done: 0,
    overdue: overdueCount,
    myTasks: myTaskCount,
  };

  statusCounts.forEach((sc) => {
    stats[sc._id] = sc.count;
    stats.total += sc.count;
  });

  // Recent tasks
  const recentTasks = await Task.find(matchStage)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'title color')
    .sort('-updatedAt')
    .limit(10);

  res.json({
    success: true,
    data: {
      stats,
      tasksByProject,
      recentTasks,
    },
  });
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title color');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  res.json({
    success: true,
    data: task,
  });
});

/**
 * @desc    Create task in a project
 * @route   POST /api/projects/:projectId/tasks
 * @access  Private/Admin
 */
const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Get current max order for the status column
  const maxOrderTask = await Task.findOne({
    projectId,
    status: req.body.status || 'todo',
  }).sort('-order');

  const task = await Task.create({
    ...req.body,
    projectId,
    order: maxOrderTask ? maxOrderTask.order + 1 : 0,
  });

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title color');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: populated,
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private (Admin: all fields, Member: status only)
 */
const updateTask = asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Members can only update status
  if (req.user.role === 'member') {
    const allowedFields = ['status'];
    const updateKeys = Object.keys(req.body);
    const isValidOperation = updateKeys.every((key) =>
      allowedFields.includes(key)
    );

    if (!isValidOperation) {
      return res.status(403).json({
        success: false,
        message: 'Members can only update task status',
      });
    }
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title color');

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

/**
 * @desc    Update task status (for Kanban drag-and-drop)
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, order } = req.body;

  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check member access to the project
  if (req.user.role !== 'admin') {
    const project = await Project.findById(task.projectId);
    if (!project.members.some((m) => m.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }
  }

  task.status = status;
  if (order !== undefined) task.order = order;
  await task.save();

  task = await Task.findById(task._id)
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title color');

  res.json({
    success: true,
    message: 'Task status updated',
    data: task,
  });
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = {
  getProjectTasks,
  getMyTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
