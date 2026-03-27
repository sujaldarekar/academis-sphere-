const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientModel',
      required: true,
    },
    recipientModel: {
      type: String,
      enum: ['Student', 'Teacher', 'Hod'],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderModel',
      default: null, // null for system notifications
    },
    senderModel: {
      type: String,
      enum: ['Teacher', 'Hod', null],
      default: null,
    },
    type: {
      type: String,
      enum: ['approval', 'announcement', 'reminder', 'message', 'document-reviewed'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // Reference to document, resume, etc.
    },
    relatedModel: {
      type: String,
      enum: ['Document', 'Resume', 'User', null],
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
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
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
