const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Document = require('../models/Document');
const Resume = require('../models/Resume');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { calculateStudentProgress, calculateTeacherPerformance, calculateDepartmentPlacementReadiness } = require('../utils/progressCalculator');

// Get all students (for teacher/hod)
const getStudents = async (req, res, next) => {
  try {
    const { department, batch, search, page = 1, limit = 10 } = req.query;
    const userDepartment = req.user.department;

    const filter = {
      isActive: true,
      department: userDepartment,
    };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }

    const students = await Student.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    // Enrich with progress data
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const progress = await calculateStudentProgress(student._id, student);
        return {
          ...student.toJSON(),
          progress,
        };
      })
    );

    res.json({
      students: enrichedStudents,
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

// Get single student detail
const getStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const documents = await Document.find({ studentId, isActive: true }).sort({ createdAt: -1 });

    const resume = await Resume.findOne({ studentId, isActive: true });

    const progress = await calculateStudentProgress(studentId, student);

    res.json({
      student: student.toJSON(),
      documents,
      resume,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// Get students assigned to teacher
const getAssignedStudents = async (req, res, next) => {
  try {
    // For now, return all students in teacher's department
    // In a real app, you'd have a separate assignment collection
    const teacherId = req.user.userId;
    const teacher = await Teacher.findById(teacherId);

    const students = await Student.find({
      department: teacher.department,
      isActive: true,
    })
      .select('-password')
      .sort({ name: 1 });

    res.json(students);
  } catch (error) {
    next(error);
  }
};

// Get teacher performance score
const getTeacherPerformance = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const performanceScore = await calculateTeacherPerformance(teacherId);

    const approvedCount = await Document.countDocuments({
      approvedBy: teacherId,
      status: 'approved',
      isActive: true,
    });

    const rejectedCount = await Document.countDocuments({
      approvedBy: teacherId,
      status: 'rejected',
      isActive: true,
    });

    res.json({
      teacher: teacher.toJSON(),
      performanceScore,
      stats: {
        documentsApproved: approvedCount,
        documentsRejected: rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all teachers (for hod)
const getTeachers = async (req, res, next) => {
  try {
    const { department, search, page = 1, limit = 10 } = req.query;
    const userDepartment = req.user.department;

    const filter = {
      isActive: true,
      department: userDepartment,
    };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }

    const teachers = await Teacher.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Teacher.countDocuments(filter);

    // Enrich with performance data
    const enrichedTeachers = await Promise.all(
      teachers.map(async (teacher) => {
        const performanceScore = await calculateTeacherPerformance(teacher._id);
        return {
          ...teacher.toJSON(),
          performanceScore,
        };
      })
    );

    res.json({
      teachers: enrichedTeachers,
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

// Get department analytics (for hod)
const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const department = req.user.department;

    // Get all students and teachers
    const studentCount = await Student.countDocuments({
      department,
      isActive: true,
    });

    const teacherCount = await Teacher.countDocuments({
      department,
      isActive: true,
    });

    // Calculate placement readiness
    const placementReadiness = await calculateDepartmentPlacementReadiness(department);

    // Get pending approvals
    const pendingApprovals = await Document.countDocuments({
      status: 'pending',
      isActive: true,
    });

    // Get students by status
    const students = await Student.find({
      department,
      isActive: true,
    });

    const placementStats = {
      placed: 0,
      notPlaced: 0,
      pursuingHigherStudies: 0,
    };

    students.forEach((student) => {
      const status = student.studentDetails?.placementStatus || 'not-placed';
      if (status === 'placed') placementStats.placed++;
      else if (status === 'pursuing-higher-studies') placementStats.pursuingHigherStudies++;
      else placementStats.notPlaced++;
    });

    res.json({
      department,
      studentCount,
      teacherCount,
      placementReadiness,
      pendingApprovals,
      placementStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentDetail,
  getAssignedStudents,
  getTeacherPerformance,
  getTeachers,
  getDepartmentAnalytics,
};
