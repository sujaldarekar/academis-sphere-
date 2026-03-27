const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Hod = require('../models/Hod');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/tokenUtils');
const { validateEmailForRole } = require('../utils/validation');
const { body, validationResult } = require('express-validator');

const roleModelMap = {
  student: Student,
  teacher: Teacher,
  hod: Hod,
};

const getRoleModel = (role) => roleModelMap[role] || null;

const registerWithRole = async (req, res, next, role) => {
  try {
    const { name, email, password, department } = req.body;

    // Validate email for role
    if (!validateEmailForRole(email, role)) {
      return res.status(400).json({
        error: `Invalid email domain for ${role} role`,
      });
    }

    // Check if user exists across all collections
    const [existingStudent, existingTeacher, existingHod] = await Promise.all([
      Student.findOne({ email }),
      Teacher.findOne({ email }),
      Hod.findOne({ email }),
    ]);
    if (existingStudent || existingTeacher || existingHod) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const RoleModel = getRoleModel(role);
    if (!RoleModel) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Create user
    const user = new RoleModel({
      name,
      email,
      password,
      department,
    });

    await user.save();

    // Log action
    await AuditLog.create({
      userId: user._id,
      action: 'user-created',
      resourceType: 'User',
      resourceId: user._id,
      description: `User ${email} registered as ${role}`,
      userModel: role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Hod',
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Register user (generic)
const register = async (req, res, next) => {
  const { role } = req.body;
  return registerWithRole(req, res, next, role);
};

const registerStudent = (req, res, next) => registerWithRole(req, res, next, 'student');
const registerTeacher = (req, res, next) => registerWithRole(req, res, next, 'teacher');
const registerHod = (req, res, next) => registerWithRole(req, res, next, 'hod');

const loginWithRole = async (req, res, next, role) => {
  try {
    const { email, password } = req.body;

    // Find user across collections
    const RoleModel = getRoleModel(role);
    if (!RoleModel) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await RoleModel.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Login user (generic)
const login = async (req, res, next) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    const teacher = !student ? await Teacher.findOne({ email }) : null;
    const hod = !student && !teacher ? await Hod.findOne({ email }) : null;

    const user = student || teacher || hod;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    req.body.role = user.role;
    return loginWithRole(req, res, next, user.role);
  } catch (error) {
    next(error);
  }
};

const loginStudent = (req, res, next) => loginWithRole(req, res, next, 'student');
const loginTeacher = (req, res, next) => loginWithRole(req, res, next, 'teacher');
const loginHod = (req, res, next) => loginWithRole(req, res, next, 'hod');

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const role = req.user.role;
    const RoleModel = role === 'student' ? Student : role === 'teacher' ? Teacher : Hod;
    const user = await RoleModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    console.log('[UPDATE PROFILE] Request received:', {
      userId: req.user.userId,
      role: req.user.role,
      body: req.body
    });

    const { name, phone, profileImage, bio, studentDetails, teacherDetails, hodDetails } = req.body;
    const userId = req.user.userId;

    const role = req.user.role;
    const RoleModel = role === 'student' ? Student : role === 'teacher' ? Teacher : Hod;
    
    // Build update object based on role
    const updateData = {
      name,
      phone,
      profileImage,
      bio,
    };

    // Add role-specific details
    if (role === 'student' && studentDetails) {
      updateData.studentDetails = studentDetails;
    } else if (role === 'teacher' && teacherDetails) {
      updateData.teacherDetails = teacherDetails;
    } else if (role === 'hod' && hodDetails) {
      updateData.hodDetails = hodDetails;
    }

    console.log('[UPDATE PROFILE] Update data:', updateData);

    const user = await RoleModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('[UPDATE PROFILE] User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[UPDATE PROFILE] Update successful');

    // Log action
    await AuditLog.create({
      userId,
      action: 'user-updated',
      resourceType: 'User',
      resourceId: userId,
      description: 'User profile updated',
      userModel: role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Hod',
    });

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.log('[UPDATE PROFILE] Error:', error.message);
    next(error);
  }
};

// Logout (token expiry handled on client)
const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { role } = req.user;
    const RoleModel = getRoleModel(role);

    if (!RoleModel) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await RoleModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile photo
    user.profileImage = req.file.path;
    await user.save();

    res.json({
      message: 'Profile photo uploaded successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        profileImage: user.profileImage,
        profilePhoto: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
};

module.exports = {
  register,
  registerStudent,
  registerTeacher,
  registerHod,
  login,
  loginStudent,
  loginTeacher,
  loginHod,
  getCurrentUser,
  updateProfile,
  uploadProfilePhoto,
  logout,
};
