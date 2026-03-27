const express = require('express');
const { body, param } = require('express-validator');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validationErrorHandler = require('../middlewares/validation');
const { upload } = require('../utils/cloudinaryConfig');

const router = express.Router();

// Upload document (student only)
router.post(
  '/upload',
  authMiddleware,
  authorize('student'),
  upload.single('file'),
  [
    body('documentType').isIn(['resume', 'certificate', 'transcript', 'project-report', 'other']),
    body('title').notEmpty().trim(),
  ],
  validationErrorHandler,
  documentController.uploadDocument
);

// Get student's documents
router.get('/my-documents', authMiddleware, authorize('student'), documentController.getStudentDocuments);

// Get pending documents (teacher only)
router.get('/pending', authMiddleware, authorize('teacher', 'hod'), documentController.getPendingDocuments);

// Approve document (teacher only)
router.put('/:documentId/approve', authMiddleware, authorize('teacher', 'hod'), [body('remarks').optional()], validationErrorHandler, documentController.approveDocument);

// Reject document (teacher only)
router.put('/:documentId/reject', authMiddleware, authorize('teacher', 'hod'), [body('remarks').notEmpty()], validationErrorHandler, documentController.rejectDocument);

// Delete document (student only)
router.delete('/:documentId', authMiddleware, authorize('student', 'hod'), documentController.deleteDocument);

module.exports = router;
