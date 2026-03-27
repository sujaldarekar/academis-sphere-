const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hodSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: 'hod',
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
    hodDetails: {
      departmentHead: Boolean,
      assignedDepartments: [String],
    },
  },
  {
    timestamps: true,
  }
);

hodSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

hodSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

hodSchema.methods.toJSON = function () {
  const hod = this.toObject();
  delete hod.password;
  return hod;
};

module.exports = mongoose.model('Hod', hodSchema);
