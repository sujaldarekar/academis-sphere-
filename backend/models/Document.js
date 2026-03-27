const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: {
      type: String,
      default: '',
    },
    documentType: {
      type: String,
      enum: ['resume', 'certificate', 'transcript', 'project-report', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'approverModel',
      default: null,
    },
    approverModel: {
      type: String,
      enum: ['Teacher', 'Hod', null],
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
documentSchema.index({ studentId: 1, status: 1 });
documentSchema.index({ studentId: 1, documentType: 1 });

module.exports = mongoose.model('Document', documentSchema);
