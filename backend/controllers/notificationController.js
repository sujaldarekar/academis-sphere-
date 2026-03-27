const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Hod = require('../models/Hod');

// Get user notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recipientModel = req.user.role === 'student' ? 'Student' : req.user.role === 'teacher' ? 'Teacher' : 'Hod';
    const { unreadOnly = false, page = 1, limit = 10 } = req.query;

    const filter = { recipientId: userId, recipientModel, isActive: true };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      recipientModel,
      isRead: false,
      isActive: true,
    });

    res.json({
      notifications,
      unreadCount,
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

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recipientModel = req.user.role === 'student' ? 'Student' : req.user.role === 'teacher' ? 'Teacher' : 'Hod';

    await Notification.updateMany(
      { recipientId: userId, recipientModel, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Send announcement (hod only)
const sendAnnouncement = async (req, res, next) => {
  try {
    const hodId = req.user.userId;
    const { title, message, recipientRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    // Create notifications for all users with given role
    const roleModelMap = {
      student: Student,
      teacher: Teacher,
      hod: Hod,
    };
    const RoleModel = roleModelMap[recipientRole];
    
    // Build filter - only filter by department if it exists on user
    const filter = {
      isActive: true,
    };
    if (req.user.department) {
      filter.department = req.user.department;
    }
    
    const recipients = await RoleModel.find(filter);

    const recipientModel = recipientRole === 'student' ? 'Student' : recipientRole === 'teacher' ? 'Teacher' : 'Hod';
    const notifications = recipients.map((recipient) => ({
      recipientId: recipient._id,
      recipientModel,
      senderId: hodId,
      senderModel: 'Hod',
      type: 'announcement',
      title,
      message,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Log action
    await AuditLog.create({
      userId: hodId,
      userModel: 'Hod',
      action: 'announcement-broadcast',
      resourceType: 'Notification',
      resourceId: null,
      description: `Announcement sent to ${recipientRole}s: ${title}`,
    });

    res.json({
      message: 'Announcement sent',
      recipientCount: recipients.length,
    });
  } catch (error) {
    next(error);
  }
};

// Send broadcast (teacher/hod to all students)
const sendBroadcast = async (req, res, next) => {
  try {
    console.log('sendBroadcast called with body:', req.body);
    console.log('User:', req.user);
    
    const senderId = req.user.userId;
    const senderRole = req.user.role;
    const { title, message, recipientRole } = req.body;

    console.log('Processing broadcast - senderId:', senderId, 'senderRole:', senderRole);

    if (!['teacher', 'hod'].includes(senderRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    // Create notifications for all users with given role
    const roleModelMap = {
      student: Student,
      teacher: Teacher,
      hod: Hod,
    };
    const RoleModel = roleModelMap[recipientRole];
    
    // Build filter - only filter by department if it exists on user
    const filter = {
      isActive: true,
    };
    if (req.user.department) {
      filter.department = req.user.department;
    }
    
    const recipients = await RoleModel.find(filter);

    if (recipients.length === 0) {
      return res.json({
        message: 'No recipients found',
        recipientCount: 0,
      });
    }

    const recipientModel = recipientRole === 'student' ? 'Student' : recipientRole === 'teacher' ? 'Teacher' : 'Hod';
    const notifications = recipients.map((recipient) => ({
      recipientId: recipient._id,
      recipientModel,
      senderId,
      senderModel: senderRole === 'hod' ? 'Hod' : 'Teacher',
      type: 'message',
      title,
      message,
    }));

    await Notification.insertMany(notifications);

    // Log action
    await AuditLog.create({
      userId: senderId,
      userModel: senderRole === 'hod' ? 'Hod' : 'Teacher',
      action: 'notification-broadcast',
      resourceType: 'Notification',
      resourceId: null,
      description: `Broadcast sent to all ${recipientRole}s: ${title}`,
    });

    res.json({
      message: 'Broadcast sent',
      recipientCount: recipients.length,
    });
  } catch (error) {
    next(error);
  }
};

// Send direct notification (teacher/hod to student)
const sendNotification = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const senderRole = req.user.role;
    const { recipientId, recipientRole, title, message, type = 'message' } = req.body;

    if (!['teacher', 'hod'].includes(senderRole)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const notification = await Notification.create({
      recipientId,
      recipientModel: recipientRole === 'student' ? 'Student' : recipientRole === 'teacher' ? 'Teacher' : 'Hod',
      senderId,
      senderModel: senderRole === 'hod' ? 'Hod' : 'Teacher',
      type,
      title,
      message,
    });

    await AuditLog.create({
      userId: senderId,
      userModel: senderRole === 'hod' ? 'Hod' : 'Teacher',
      action: 'notification-send',
      resourceType: 'Notification',
      resourceId: notification._id,
      description: `Notification sent: ${title}`,
      targetUserId: recipientId,
      targetUserModel: recipientRole === 'student' ? 'Student' : recipientRole === 'teacher' ? 'Teacher' : 'Hod',
    });

    res.status(201).json({
      message: 'Notification sent',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isActive: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendAnnouncement,
  sendBroadcast,
  sendNotification,
  deleteNotification,
};
