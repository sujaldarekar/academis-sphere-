const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    template: {
      type: String,
      enum: ['template-1', 'template-2', 'template-3'],
      default: 'template-1',
    },
    sections: {
      personalInfo: {
        fullName: String,
        email: String,
        phone: String,
        location: String,
        linkedIn: String,
        portfolio: String,
        isApproved: { type: Boolean, default: false },
        approvedBy: mongoose.Schema.Types.ObjectId,
      },
      summary: {
        content: String,
        isApproved: { type: Boolean, default: false },
        approvedBy: mongoose.Schema.Types.ObjectId,
      },
      experience: [
        {
          jobTitle: String,
          company: String,
          startDate: Date,
          endDate: Date,
          description: String,
          isApproved: { type: Boolean, default: false },
          approvedBy: mongoose.Schema.Types.ObjectId,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          graduationDate: Date,
          cgpa: Number,
          isApproved: { type: Boolean, default: false },
          approvedBy: mongoose.Schema.Types.ObjectId,
        },
      ],
      skills: {
        content: [String],
        isApproved: { type: Boolean, default: false },
        approvedBy: mongoose.Schema.Types.ObjectId,
      },
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
          link: String,
          isApproved: { type: Boolean, default: false },
          approvedBy: mongoose.Schema.Types.ObjectId,
        },
      ],
      certifications: [
        {
          title: String,
          issuer: String,
          issueDate: Date,
          credentialUrl: String,
          isApproved: { type: Boolean, default: false },
          approvedBy: mongoose.Schema.Types.ObjectId,
        },
      ],
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'lastEditedByModel',
    },
    lastEditedByModel: {
      type: String,
      enum: ['Student', 'Teacher', 'Hod', null],
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

module.exports = mongoose.model('Resume', resumeSchema);
