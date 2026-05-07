const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} = require('../validators/projectValidator');

// Import task routes for nesting
const taskRoutes = require('./taskRoutes');

// All routes require authentication
router.use(auth);

// Nest task routes under /projects/:projectId/tasks
router.use('/:projectId/tasks', taskRoutes);

// Project CRUD
router.get('/', getProjects);
router.post('/', authorize('admin'), validate(createProjectSchema), createProject);
router.get('/:id', getProject);
router.put('/:id', authorize('admin'), validate(updateProjectSchema), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

// Member management
router.post('/:id/members', authorize('admin'), validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
