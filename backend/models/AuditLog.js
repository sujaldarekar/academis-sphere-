const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel',
      required: true,
    },
    userModel: {
      type: String,
      enum: ['Student', 'Teacher', 'Hod'],
      required: true,
    },
    action: {
      type: String,
      enum: [
        'document-upload',
        'document-approve',
        'document-reject',
        'resume-edit',
        'resume-approve',
        'notification-send',
        'notification-broadcast',
        'announcement-broadcast',
        'user-created',
        'user-updated',
        'user-deleted',
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['Document', 'Resume', 'User', 'Notification'],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetUserModel',
      default: null, // affected user
    },
    targetUserModel: {
      type: String,
      enum: ['Student', 'Teacher', 'Hod', null],
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    changeDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // what changed (before/after)
    },
    ipAddress: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
