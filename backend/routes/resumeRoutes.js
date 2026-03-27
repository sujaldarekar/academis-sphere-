const express = require('express');
const { body, param } = require('express-validator');
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validationErrorHandler = require('../middlewares/validation');

const router = express.Router();

// Get or create student resume
router.get('/my-resume', authMiddleware, authorize('student'), resumeController.getOrCreateResume);

// Auto-generate resume (student only)
router.post('/auto-generate', authMiddleware, authorize('student'), resumeController.autoGenerateResume);

// Update resume section (student only)
router.put(
  '/update-section',
  authMiddleware,
  authorize('student'),
  [body('section').notEmpty(), body('data').notEmpty()],
  validationErrorHandler,
  resumeController.updateResumeSection
);

// Change template (student only)
router.put(
  '/change-template',
  authMiddleware,
  authorize('student'),
  [body('template').isIn(['template-1', 'template-2', 'template-3'])],
  validationErrorHandler,
  resumeController.changeTemplate
);

// Get student resume (teacher/student)
router.get('/:studentId', authMiddleware, authorize('student', 'teacher', 'hod'), resumeController.getStudentResume);

// Approve resume section (teacher only)
router.put('/:resumeId/approve/:section', authMiddleware, authorize('teacher', 'hod'), resumeController.approveResumeSection);

module.exports = router;
