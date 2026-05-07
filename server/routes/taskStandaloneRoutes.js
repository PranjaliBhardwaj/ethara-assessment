const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  getTaskStats,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  updateTaskSchema,
  updateStatusSchema,
} = require('../validators/taskValidator');

// All routes require authentication
router.use(auth);

// Standalone task routes
router.get('/my-tasks', getMyTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.patch('/:id/status', validate(updateStatusSchema), updateTaskStatus);
router.delete('/:id', authorize('admin'), deleteTask);

module.exports = router;
