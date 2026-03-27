const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const { calculateStudentProgress } = require('../utils/progressCalculator');

// Upload document
const uploadDocument = async (req, res, next) => {
  try {
    const { documentType, title, description } = req.body;
    const studentId = req.user.userId;

    const student = await Student.findById(studentId).select('name');
    const studentName = student?.name || '';

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = new Document({
      studentId,
      studentName,
      documentType,
      title,
      description,
      fileUrl: req.file.path, // Cloudinary URL
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      cloudinaryId: req.file.filename,
    });

    await document.save();

    // Log action
    await AuditLog.create({
      userId: studentId,
      userModel: 'Student',
      action: 'document-upload',
      resourceType: 'Document',
      resourceId: document._id,
      description: `Document ${title} uploaded`,
      targetUserModel: 'Student',
      targetUserId: studentId,
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Get student documents
const getStudentDocuments = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const studentId = req.user.userId;

    const filter = { studentId, isActive: true };
    if (status) filter.status = status;
    if (type) filter.documentType = type;

    const documents = await Document.find(filter)
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// Approve document (teacher only)
const approveDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { remarks } = req.body;
    const teacherId = req.user.userId;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = 'approved';
    document.approvedBy = teacherId;
    document.approverModel = req.user.role === 'hod' ? 'Hod' : 'Teacher';
    document.remarks = remarks || '';
    document.approvalDate = new Date();

    await document.save();

    // Log action
    await AuditLog.create({
      userId: teacherId,
      userModel: req.user.role === 'hod' ? 'Hod' : 'Teacher',
      action: 'document-approve',
      resourceType: 'Document',
      resourceId: documentId,
      targetUserId: document.studentId,
      targetUserModel: 'Student',
      description: `Document "${document.title}" approved`,
    });

    // Send notification to student
    await Notification.create({
      recipientId: document.studentId,
      recipientModel: 'Student',
      senderId: teacherId,
      senderModel: req.user.role === 'hod' ? 'Hod' : 'Teacher',
      type: 'approval',
      title: 'Document Approved',
      message: `Your ${document.documentType} has been approved`,
      relatedId: documentId,
      relatedModel: 'Document',
    });

    res.json({
      message: 'Document approved',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Reject document (teacher only)
const rejectDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { remarks } = req.body;
    const teacherId = req.user.userId;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = 'rejected';
    document.remarks = remarks || 'No feedback provided';
    document.approverModel = req.user.role === 'hod' ? 'Hod' : 'Teacher';
    document.approvalDate = new Date();

    await document.save();

    // Log action
    await AuditLog.create({
      userId: teacherId,
      userModel: req.user.role === 'hod' ? 'Hod' : 'Teacher',
      action: 'document-reject',
      resourceType: 'Document',
      resourceId: documentId,
      targetUserId: document.studentId,
      targetUserModel: 'Student',
      description: `Document "${document.title}" rejected`,
    });

    // Send notification to student
    await Notification.create({
      recipientId: document.studentId,
      recipientModel: 'Student',
      senderId: teacherId,
      senderModel: req.user.role === 'hod' ? 'Hod' : 'Teacher',
      type: 'document-reviewed',
      title: 'Document Rejected',
      message: `Your ${document.documentType} requires revision. Remarks: ${remarks}`,
      relatedId: documentId,
      relatedModel: 'Document',
    });

    res.json({
      message: 'Document rejected',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Get documents for teacher approval
const getPendingDocuments = async (req, res, next) => {
  try {
    const { studentId, documentType } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const filter = { status: 'pending', isActive: true };
    if (studentId) filter.studentId = studentId;
    if (documentType) filter.documentType = documentType;

    const documents = await Document.find(filter)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(filter);

    res.json({
      documents,
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

// Delete document
const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Only student who uploaded or admins can delete
    if (document.studentId.toString() !== userId && req.user.role !== 'hod') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    document.isActive = false;
    await document.save();

    res.json({ message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getStudentDocuments,
  approveDocument,
  rejectDocument,
  getPendingDocuments,
  deleteDocument,
};
