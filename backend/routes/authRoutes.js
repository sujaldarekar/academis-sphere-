const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const validationErrorHandler = require('../middlewares/validation');
const { validateEmailForRole } = require('../utils/validation');
const { upload } = require('../utils/cloudinaryConfig');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['student', 'teacher', 'hod']),
    body('department').notEmpty(),
  ],
  validationErrorHandler,
  (req, res, next) => {
    // Custom email validation for role
    if (!validateEmailForRole(req.body.email, req.body.role)) {
      return res.status(400).json({ error: `Invalid email domain for ${req.body.role}` });
    }
    next();
  },
  authController.register
);

// Student register/login
router.post(
  '/student/register',
  [body('name').notEmpty().trim(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('department').notEmpty()],
  validationErrorHandler,
  (req, res, next) => {
    if (!validateEmailForRole(req.body.email, 'student')) {
      return res.status(400).json({ error: 'Invalid email domain for student role' });
    }
    next();
  },
  authController.registerStudent
);

router.post(
  '/student/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validationErrorHandler,
  authController.loginStudent
);

// Teacher register/login
router.post(
  '/teacher/register',
  [body('name').notEmpty().trim(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('department').notEmpty()],
  validationErrorHandler,
  (req, res, next) => {
    if (!validateEmailForRole(req.body.email, 'teacher')) {
      return res.status(400).json({ error: 'Invalid email domain for teacher role' });
    }
    next();
  },
  authController.registerTeacher
);

router.post(
  '/teacher/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validationErrorHandler,
  authController.loginTeacher
);

// HOD register/login
router.post(
  '/hod/register',
  [body('name').notEmpty().trim(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('department').notEmpty()],
  validationErrorHandler,
  (req, res, next) => {
    if (!validateEmailForRole(req.body.email, 'hod')) {
      return res.status(400).json({ error: 'Invalid email domain for hod role' });
    }
    next();
  },
  authController.registerHod
);

router.post(
  '/hod/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validationErrorHandler,
  authController.loginHod
);

// Login
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validationErrorHandler,
  authController.login
);

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Update profile
router.put('/profile', authMiddleware, [body('name').optional().trim(), body('phone').optional()], validationErrorHandler, authController.updateProfile);

// Upload profile photo
router.post('/upload-photo', authMiddleware, upload.single('file'), authController.uploadProfilePhoto);

// Logout
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
