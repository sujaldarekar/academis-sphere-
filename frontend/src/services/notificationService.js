import api from './api';

const notificationService = {
  // Get all notifications for the current user
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data?.notifications || response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Send announcement/message to students
  sendAnnouncement: async (data) => {
    try {
      const response = await api.post('/notifications/announcement', data);
      return response.data;
    } catch (error) {
      console.error('Error sending announcement:', error);
      throw error;
    }
  },

  // Send broadcast (teacher or hod to all students)
  sendBroadcast: async (data) => {
    try {
      const response = await api.post('/notifications/broadcast', data);
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw error;
    }
  },

  // Send direct notification (teacher/hod)
  sendNotification: async (data) => {
    try {
      const response = await api.post('/notifications/send', data);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },
};

export default notificationService;
