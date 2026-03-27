const Document = require('../models/Document');
const Resume = require('../models/Resume');

/**
 * Calculate student progress
 * Returns: {
 *   profileCompletion: 0-100,
 *   documentProgress: 0-100,
 *   approvedDocuments: count,
 *   resumeCompletion: 0-100,
 *   overallProgress: 0-100
 * }
 */
const calculateStudentProgress = async (studentId, userData) => {
  try {
    // 1. Profile Completion (30 points)
    const profileFields = {
      name: userData.name ? 1 : 0,
      phone: userData.phone ? 1 : 0,
      profileImage: userData.profileImage ? 1 : 0,
      bio: userData.bio && userData.bio.length > 10 ? 1 : 0,
      cgpa: userData.studentDetails?.cgpa > 0 ? 1 : 0,
    };
    const profileCompletionFields = Object.values(profileFields).reduce((a, b) => a + b, 0);
    const profileCompletion = (profileCompletionFields / Object.keys(profileFields).length) * 30;

    // 2. Document Upload Progress (40 points)
    const documents = await Document.find({
      studentId,
      isActive: true,
    });

    const totalDocuments = documents.length || 0;
    const approvedDocuments = documents.filter((d) => d.status === 'approved').length;
    const pendingDocuments = documents.filter((d) => d.status === 'pending').length;

    // Progress: 10% for each document uploaded, 20% bonus if all approved
    const documentProgress = Math.min((totalDocuments / 5) * 30 + (approvedDocuments / Math.max(totalDocuments, 1)) * 10, 40);

    // 3. Resume Completion (30 points)
    const resume = await Resume.findOne({ studentId, isActive: true });

    let resumeCompletion = 0;
    if (resume) {
      const sections = {
        personalInfo: resume.sections.personalInfo?.fullName ? 1 : 0,
        summary: resume.sections.summary?.content ? 1 : 0,
        experience: resume.sections.experience?.length > 0 ? 1 : 0,
        education: resume.sections.education?.length > 0 ? 1 : 0,
        skills: resume.sections.skills?.content?.length > 0 ? 1 : 0,
        projects: resume.sections.projects?.length > 0 ? 1 : 0,
      };

      const completedSections = Object.values(sections).reduce((a, b) => a + b, 0);
      const sectionPercentage = (completedSections / Object.keys(sections).length) * 100;

      // Bonus if sections are approved
      const approvedSections = Object.keys(sections).filter((key) => {
        return resume.sections[key]?.isApproved === true;
      }).length;
      const approvalBonus = (approvedSections / Object.keys(sections).length) * 10;

      resumeCompletion = (sectionPercentage * 0.3 + approvalBonus) / 10;
    }

    // 4. Overall Progress
    const overallProgress = Math.round((profileCompletion + documentProgress + resumeCompletion) / 100 * 100);

    return {
      profileCompletion: Math.round(profileCompletion),
      documentProgress: Math.round(documentProgress),
      approvedDocuments,
      totalDocuments,
      resumeCompletion: Math.round(resumeCompletion),
      overallProgress: Math.min(overallProgress, 100),
    };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return {
      profileCompletion: 0,
      documentProgress: 0,
      approvedDocuments: 0,
      totalDocuments: 0,
      resumeCompletion: 0,
      overallProgress: 0,
    };
  }
};

/**
 * Calculate teacher performance score (rule-based)
 * Returns: 0-100
 * Rules:
 * - Documents approved (weight: 40%)
 * - Average response time (weight: 30%)
 * - Student feedback (weight: 30%)
 */
const calculateTeacherPerformance = async (teacherId) => {
  try {
    // Count approved documents by this teacher
    const Document = require('../models/Document');
    const AuditLog = require('../models/AuditLog');

    const approvedCount = await Document.countDocuments({
      approvedBy: teacherId,
      status: 'approved',
      isActive: true,
    });

    // Calculate average approval time
    const approvalLogs = await AuditLog.find({
      userId: teacherId,
      action: 'document-approve',
    })
      .limit(20)
      .sort({ createdAt: -1 });

    let avgResponseTime = 24; // hours, default
    if (approvalLogs.length > 1) {
      let totalTime = 0;
      for (let i = 0; i < approvalLogs.length - 1; i++) {
        totalTime += (approvalLogs[i].createdAt - approvalLogs[i + 1].createdAt) / (1000 * 3600);
      }
      avgResponseTime = totalTime / (approvalLogs.length - 1);
    }

    // Score calculation
    let performanceScore = 0;

    // Approvals score (40%)
    const approvalsScore = Math.min(approvedCount * 5, 40); // 1 point per approval, max 40

    // Response time score (30%)
    const responseTimeScore = Math.max(30 - (avgResponseTime - 1) * 0.5, 0); // Penalize slow responses

    // Default student feedback score (30%) - can be expanded with actual feedback
    const feedbackScore = 30;

    performanceScore = approvalsScore + responseTimeScore + feedbackScore;

    return Math.round(Math.min(performanceScore, 100));
  } catch (error) {
    console.error('Error calculating teacher performance:', error);
    return 0;
  }
};

/**
 * Calculate department placement readiness score
 * Factors:
 * - % of students with profiles > 80% complete
 * - % of students with approved documents
 * - Average CGPA
 */
const calculateDepartmentPlacementReadiness = async (department) => {
  try {
    const Student = require('../models/Student');

    const students = await Student.find({
      department,
      isActive: true,
    });

    if (students.length === 0) return 0;

    let profileCompleteCount = 0;
    let approvedDocCount = 0;
    let totalCGPA = 0;

    for (const student of students) {
      const progress = await calculateStudentProgress(student._id, student);
      if (progress.profileCompletion >= 80) {
        profileCompleteCount++;
      }
      if (progress.approvedDocuments > 0) {
        approvedDocCount++;
      }
      totalCGPA += student.studentDetails?.cgpa || 0;
    }

    const profileScore = (profileCompleteCount / students.length) * 40;
    const documentScore = (approvedDocCount / students.length) * 40;
    const cgpaScore = Math.min((totalCGPA / students.length / 10) * 20, 20);

    const placementReadiness = Math.round(profileScore + documentScore + cgpaScore);

    return Math.min(placementReadiness, 100);
  } catch (error) {
    console.error('Error calculating placement readiness:', error);
    return 0;
  }
};

module.exports = {
  calculateStudentProgress,
  calculateTeacherPerformance,
  calculateDepartmentPlacementReadiness,
};
