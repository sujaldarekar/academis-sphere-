const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validationErrorHandler = require('../middlewares/validation');

const router = express.Router();

// Get notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark as read
router.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);

// Mark all as read
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// Send announcement (hod only)
router.post(
  '/announcement',
  authMiddleware,
  authorize('hod'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('recipientRole').isIn(['student', 'teacher', 'hod']).withMessage('Invalid recipient role')
  ],
  validationErrorHandler,
  notificationController.sendAnnouncement
);

// Send broadcast (teacher/hod to all students)
router.post(
  '/broadcast',
  authMiddleware,
  authorize('teacher', 'hod'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('recipientRole').isIn(['student', 'teacher', 'hod']).withMessage('Invalid recipient role')
  ],
  validationErrorHandler,
  notificationController.sendBroadcast
);

// Send direct notification (teacher/hod)
router.post(
  '/send',
  authMiddleware,
  authorize('teacher', 'hod'),
  [
    body('recipientId').notEmpty().withMessage('Recipient is required'),
    body('recipientRole').isIn(['student', 'teacher', 'hod']).withMessage('Invalid recipient role'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['approval', 'announcement', 'reminder', 'message', 'document-reviewed']).withMessage('Invalid notification type'),
  ],
  validationErrorHandler,
  notificationController.sendNotification
);

// Delete notification
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

module.exports = router;
