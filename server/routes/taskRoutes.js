const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams for nested routes
const {
  getProjectTasks,
  getMyTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} = require('../validators/taskValidator');

// These routes are used both nested (/projects/:projectId/tasks) and standalone (/tasks)
// When nested, mergeParams gives access to :projectId

// GET tasks for a project (nested route)
router.get('/', getProjectTasks);

// Create task in a project (nested route, admin only)
router.post('/', authorize('admin'), validate(createTaskSchema), createTask);

module.exports = router;
