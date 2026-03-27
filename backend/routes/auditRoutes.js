const express = require('express');
const { param } = require('express-validator');
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validationErrorHandler = require('../middlewares/validation');

const router = express.Router();

// Get audit logs (hod only)
router.get('/', authMiddleware, authorize('hod'), auditController.getAuditLogs);

// Get audit logs for specific resource
router.get('/:resourceId', authMiddleware, authorize('hod'), auditController.getResourceAuditLogs);

module.exports = router;
