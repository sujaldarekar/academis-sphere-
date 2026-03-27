const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent',
    },
    remarks: {
      type: String,
      default: '',
    },
    classType: {
      type: String,
      enum: ['lecture', 'practical', 'seminar', 'lab'],
      default: 'lecture',
    },
  },
  { timestamps: true }
);

// Index for faster queries
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });
attendanceSchema.index({ rollNumber: 1 });
attendanceSchema.index({ department: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
