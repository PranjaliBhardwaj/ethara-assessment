const express = require('express');
const router = express.Router();
const { signup, login, getMe, getUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validators/authValidator');

// Public routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', auth, getMe);
router.get('/users', auth, getUsers);

module.exports = router;
