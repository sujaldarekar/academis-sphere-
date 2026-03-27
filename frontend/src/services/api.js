import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const inferredApiUrl = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api` : null;
const API_BASE_URL = process.env.REACT_APP_API_URL || inferredApiUrl || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, {
        hasToken: !!token,
        tokenLength: token.length
      });
    } else {
      console.warn('[API Request] No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('[API Error - 403]', {
        endpoint: `${error.response.config.method.toUpperCase()} ${error.response.config.url}`,
        userRole: error.response.data?.userRole,
        allowedRoles: error.response.data?.allowedRoles,
        message: error.response.data?.error
      });
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  registerStudent: (userData) => api.post('/auth/student/register', userData),
  registerTeacher: (userData) => api.post('/auth/teacher/register', userData),
  registerHod: (userData) => api.post('/auth/hod/register', userData),
  loginStudent: (credentials) => api.post('/auth/student/login', credentials),
  loginTeacher: (credentials) => api.post('/auth/teacher/login', credentials),
  loginHod: (credentials) => api.post('/auth/hod/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadProfilePhoto: (formData) => api.post('/auth/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  logout: () => api.post('/auth/logout'),
};

// Document services
export const documentService = {
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyDocuments: (filters) => api.get('/documents/my-documents', { params: filters }),
  getPendingDocuments: (filters) => api.get('/documents/pending', { params: filters }),
  approveDocument: (documentId, remarks) =>
    api.put(`/documents/${documentId}/approve`, { remarks }),
  rejectDocument: (documentId, remarks) =>
    api.put(`/documents/${documentId}/reject`, { remarks }),
  deleteDocument: (documentId) => api.delete(`/documents/${documentId}`),
};

// Resume services
export const resumeService = {
  getMyResume: () => api.get('/resume/my-resume'),
  updateSection: (section, data) =>
    api.put('/resume/update-section', { section, data }),
  changeTemplate: (template) => api.put('/resume/change-template', { template }),
  getStudentResume: (studentId) => api.get(`/resume/${studentId}`),
  approveSection: (resumeId, section) =>
    api.put(`/resume/${resumeId}/approve/${section}`),
  autoGenerate: () => api.post('/resume/auto-generate'),
};

// User services
export const userService = {
  getStudents: (filters) => api.get('/users/students', { params: filters }),
  getStudentDetail: (studentId) => api.get(`/users/students/${studentId}`),
  getAssignedStudents: () => api.get('/users/teacher/assigned'),
  getTeacherPerformance: (teacherId) =>
    api.get(`/users/teacher/${teacherId}/performance`),
  getTeachers: (filters) => api.get('/users/teachers', { params: filters }),
  getDepartmentAnalytics: () => api.get('/users/analytics/department'),
};

// Notification services
export const notificationService = {
  getNotifications: (filters) => api.get('/notifications', { params: filters }),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  sendAnnouncement: (data) => api.post('/notifications/announcement', data),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};

// Audit services
export const auditService = {
  getAuditLogs: (filters) => api.get('/audit-logs', { params: filters }),
  getResourceAuditLogs: (resourceId) =>
    api.get(`/audit-logs/${resourceId}`),
};

// Attendance services
export const attendanceService = {
  markAttendance: (attendanceData) => api.post('/attendance/mark', attendanceData),
  getStudentAttendance: () => api.get('/attendance/my-attendance'),
  getAttendanceSummary: (month) => api.get('/attendance/summary', { params: { month } }),
  getTeacherStudentsAttendance: (date) => api.get('/attendance/students', { params: { date } }),
};

export default api;
