const Resume = require('../models/Resume');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Document = require('../models/Document');

// Create/Get student resume
const getOrCreateResume = async (req, res, next) => {
  try {
    const studentId = req.user.userId;

    let resume = await Resume.findOne({ studentId, isActive: true });

    if (!resume) {
      resume = new Resume({
        studentId,
        sections: {
          personalInfo: {},
          summary: {},
          experience: [],
          education: [],
          skills: {},
          projects: [],
          certifications: [],
        },
      });

      await resume.save();
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

// Update resume section
const updateResumeSection = async (req, res, next) => {
  try {
    const studentId = req.user.userId;
    const { section, data } = req.body;

    const resume = await Resume.findOne({ studentId, isActive: true });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Update specific section
    if (section === 'personalInfo' || section === 'summary' || section === 'skills') {
      resume.sections[section] = data;
    } else if (section === 'experience' || section === 'education' || section === 'projects' || section === 'certifications') {
      resume.sections[section] = data; // Array of items
    }

    resume.lastEditedBy = studentId;
    resume.lastEditedByModel = 'Student';
    await resume.save();

    // Log action
    await AuditLog.create({
      userId: studentId,
      userModel: 'Student',
      action: 'resume-edit',
      resourceType: 'Resume',
      resourceId: resume._id,
      description: `Resume section "${section}" updated`,
      targetUserId: studentId,
      targetUserModel: 'Student',
    });

    res.json({
      message: 'Resume updated',
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// Approve resume section (teacher only)
const approveResumeSection = async (req, res, next) => {
  try {
    const { resumeId, section } = req.params;
    const teacherId = req.user.userId;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Mark section as approved
    if (resume.sections[section]) {
      resume.sections[section].isApproved = true;
      resume.sections[section].approvedBy = teacherId;
    }

    await resume.save();

    // Log action
    await AuditLog.create({
      userId: teacherId,
      userModel: req.user.role === 'hod' ? 'Hod' : 'Teacher',
      action: 'resume-approve',
      resourceType: 'Resume',
      resourceId: resumeId,
      targetUserId: resume.studentId,
      targetUserModel: 'Student',
      description: `Resume section "${section}" approved`,
    });

    // Send notification
    await Notification.create({
      recipientId: resume.studentId,
      recipientModel: 'Student',
      senderId: teacherId,
      senderModel: req.user.role === 'hod' ? 'Hod' : 'Teacher',
      type: 'approval',
      title: 'Resume Section Approved',
      message: `Your resume ${section} has been approved`,
      relatedId: resumeId,
      relatedModel: 'Resume',
    });

    res.json({
      message: 'Resume section approved',
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// Change resume template
const changeTemplate = async (req, res, next) => {
  try {
    const studentId = req.user.userId;
    const { template } = req.body;

    const resume = await Resume.findOne({ studentId, isActive: true });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    resume.template = template;
    await resume.save();

    res.json({
      message: 'Template changed',
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// Get student resume (for teacher/student)
const getStudentResume = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const resume = await Resume.findOne({ studentId, isActive: true }).populate('lastEditedBy', 'name email');

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

// Auto-generate resume from certifications (student only)
const autoGenerateResume = async (req, res, next) => {
  try {
    const studentId = req.user.userId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const certificates = await Document.find({
      studentId,
      documentType: 'certificate',
      isActive: true,
    }).sort({ createdAt: -1 });

    let resume = await Resume.findOne({ studentId, isActive: true });

    const baseSections = resume?.sections || {
      personalInfo: {},
      summary: {},
      experience: [],
      education: [],
      skills: {},
      projects: [],
      certifications: [],
    };

    const personalInfo = {
      ...baseSections.personalInfo,
      fullName: student.name,
      email: student.email,
      phone: student.phone || baseSections.personalInfo?.phone || '',
      location:
        baseSections.personalInfo?.location ||
        (student.department ? `${student.department} Department` : ''),
    };

    const certificationEntries = certificates.map((doc) => ({
      title: doc.title,
      issuer: doc.description || 'Issued Certificate',
      issueDate: doc.createdAt,
      credentialUrl: doc.fileUrl,
      isApproved: false,
    }));

    const summaryContent = certificates.length
      ? `Student of ${student.department} with ${certificates.length} certifications including ${certificates
          .slice(0, 3)
          .map((c) => c.title)
          .join(', ')}.`
      : `Student of ${student.department} focused on academics and practical learning.`;

    const skillsContent = baseSections.skills?.content?.length
      ? baseSections.skills.content
      : certificates.map((c) => c.title).slice(0, 10);

    const nextSections = {
      ...baseSections,
      personalInfo,
      summary: { ...baseSections.summary, content: summaryContent },
      certifications: certificationEntries.length ? certificationEntries : baseSections.certifications,
      skills: { ...baseSections.skills, content: skillsContent },
    };

    if (!resume) {
      resume = new Resume({
        studentId,
        sections: nextSections,
      });
    } else {
      resume.sections = nextSections;
      resume.version = (resume.version || 1) + 1;
    }

    resume.lastEditedBy = studentId;
    resume.lastEditedByModel = 'Student';
    await resume.save();

    await AuditLog.create({
      userId: studentId,
      userModel: 'Student',
      action: 'resume-edit',
      resourceType: 'Resume',
      resourceId: resume._id,
      description: 'Resume auto-generated from certifications',
      targetUserId: studentId,
      targetUserModel: 'Student',
    });

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateResume,
  updateResumeSection,
  approveResumeSection,
  changeTemplate,
  getStudentResume,
  autoGenerateResume,
};
