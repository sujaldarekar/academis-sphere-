const AuditLog = require('../models/AuditLog');

// Get audit logs (hod only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, userId, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (userId) filter.userId = userId;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email')
      .populate('targetUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get audit logs for specific resource
const getResourceAuditLogs = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    const logs = await AuditLog.find({ resourceId, isActive: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getResourceAuditLogs,
};
