const express = require('express');
const { body } = require('express-validator');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validationErrorHandler = require('../middlewares/validation');

const router = express.Router();

// Mark attendance (teacher only)
router.post(
  '/mark',
  authMiddleware,
  authorize('teacher'),
  attendanceController.markAttendance
);

// Get student's attendance (student only)
router.get(
  '/my-attendance',
  authMiddleware,
  authorize('student'),
  attendanceController.getStudentAttendance
);

// Get attendance summary (student)
router.get(
  '/summary',
  authMiddleware,
  authorize('student'),
  attendanceController.getAttendanceSummary
);

// Get teacher's students attendance (teacher)
router.get(
  '/students',
  authMiddleware,
  authorize('teacher'),
  attendanceController.getTeacherStudentsAttendance
);

module.exports = router;
