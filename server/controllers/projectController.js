const Project = require('../models/Project');
const Task = require('../models/Task');
const { asyncHandler } = require('../utils/helpers');

/**
 * @desc    Get all projects (admin: all, member: only assigned)
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
  let query;

  if (req.user.role === 'admin') {
    query = Project.find();
  } else {
    query = Project.find({ members: req.user.id });
  }

  const projects = await query
    .populate('members', 'name email role')
    .populate('createdBy', 'name email')
    .sort('-createdAt');

  // Get task counts for each project
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const taskCounts = await Task.aggregate([
        { $match: { projectId: project._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const counts = {
        total: 0,
        todo: 0,
        'in-progress': 0,
        done: 0,
      };

      taskCounts.forEach((tc) => {
        counts[tc._id] = tc.count;
        counts.total += tc.count;
      });

      return {
        ...project.toJSON(),
        taskCounts: counts,
      };
    })
  );

  res.json({
    success: true,
    count: projectsWithCounts.length,
    data: projectsWithCounts,
  });
});

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check if member has access
  if (
    req.user.role !== 'admin' &&
    !project.members.some((m) => m._id.toString() === req.user.id)
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this project',
    });
  }

  // Get task counts
  const taskCounts = await Task.aggregate([
    { $match: { projectId: project._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = { total: 0, todo: 0, 'in-progress': 0, done: 0 };
  taskCounts.forEach((tc) => {
    counts[tc._id] = tc.count;
    counts.total += tc.count;
  });

  res.json({
    success: true,
    data: {
      ...project.toJSON(),
      taskCounts: counts,
    },
  });
});

/**
 * @desc    Create project
 * @route   POST /api/projects
 * @access  Private/Admin
 */
const createProject = asyncHandler(async (req, res) => {
  const { title, description, color } = req.body;

  const project = await Project.create({
    title,
    description,
    color,
    createdBy: req.user.id,
    members: [req.user.id], // Creator is auto-added as member
  });

  const populated = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: { ...populated.toJSON(), taskCounts: { total: 0, todo: 0, 'in-progress': 0, done: 0 } },
  });
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private/Admin
 */
const updateProject = asyncHandler(async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

/**
 * @desc    Delete project and its tasks
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Delete all tasks in the project
  await Task.deleteMany({ projectId: project._id });

  // Delete the project
  await Project.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Project and associated tasks deleted successfully',
  });
});

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private/Admin
 */
const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Check if user is already a member
  if (project.members.some((m) => m.toString() === userId)) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member of this project',
    });
  }

  project.members.push(userId);
  await project.save();

  const populated = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Member added successfully',
    data: populated,
  });
});

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private/Admin
 */
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found',
    });
  }

  // Prevent removing the creator
  if (project.createdBy.toString() === req.params.userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove the project creator',
    });
  }

  project.members = project.members.filter(
    (m) => m.toString() !== req.params.userId
  );
  await project.save();

  const populated = await Project.findById(project._id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: populated,
  });
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
