const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validationErrorHandler = require('../middlewares/validation');

const router = express.Router();

// Get all students (teacher/hod only)
router.get('/students', authMiddleware, authorize('teacher', 'hod'), userController.getStudents);

// Get single student detail
router.get('/students/:studentId', authMiddleware, authorize('student', 'teacher', 'hod'), userController.getStudentDetail);

// Get students assigned to teacher
router.get('/teacher/assigned', authMiddleware, authorize('teacher'), userController.getAssignedStudents);

// Get teacher performance
router.get('/teacher/:teacherId/performance', authMiddleware, authorize('teacher', 'hod'), userController.getTeacherPerformance);

// Get all teachers (hod only)
router.get('/teachers', authMiddleware, authorize('hod'), userController.getTeachers);

// Get department analytics (hod only)
router.get('/analytics/department', authMiddleware, authorize('hod'), userController.getDepartmentAnalytics);

module.exports = router;
