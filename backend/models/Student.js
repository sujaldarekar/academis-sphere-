const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: 'student',
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    department: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    studentDetails: {
      batch: String,
      enrollmentNumber: String,
      cgpa: { type: Number, default: 0 },
      placementStatus: { type: String, enum: ['placed', 'not-placed', 'pursuing-higher-studies'], default: 'not-placed' },
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

studentSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.toJSON = function () {
  const student = this.toObject();
  delete student.password;
  return student;
};

module.exports = mongoose.model('Student', studentSchema);
