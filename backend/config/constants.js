// Application Constants
module.exports = {
  ROLES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    HOD: 'hod',
  },

  NOTIFICATION_TYPES: {
    ANNOUNCEMENT: 'announcement',
    BROADCAST: 'broadcast',
    GRADE_NOTIFICATION: 'grade-notification',
    ASSIGNMENT: 'assignment',
    DOCUMENT_APPROVAL: 'document-approval',
  },

  AUDIT_ACTIONS: {
    STUDENT_LOGIN: 'student-login',
    TEACHER_LOGIN: 'teacher-login',
    HOD_LOGIN: 'hod-login',
    STUDENT_LOGOUT: 'student-logout',
    TEACHER_LOGOUT: 'teacher-logout',
    HOD_LOGOUT: 'hod-logout',
    ASSIGNMENT_CREATED: 'assignment-created',
    ASSIGNMENT_SUBMITTED: 'assignment-submitted',
    ASSIGNMENT_GRADED: 'assignment-graded',
    NOTIFICATION_SENT: 'notification-sent',
    NOTIFICATION_BROADCAST: 'notification-broadcast',
    DOCUMENT_UPLOADED: 'document-uploaded',
    DOCUMENT_APPROVED: 'document-approved',
    DOCUMENT_REJECTED: 'document-rejected',
    ATTENDANCE_MARKED: 'attendance-marked',
    RESUME_UPLOADED: 'resume-uploaded',
  },

  DOCUMENT_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  ASSIGNMENT_STATUS: {
    ACTIVE: 'active',
    CLOSED: 'closed',
  },

  SUBMISSION_STATUS: {
    SUBMITTED: 'submitted',
    GRADED: 'graded',
    PENDING: 'pending',
  },

  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10 MB
    ALLOWED_FORMATS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'txt'],
  },

  TOKEN_EXPIRY: {
    ACCESS: '7d',
    REFRESH: '30d',
  },

  EMAIL_DOMAIN: {
    STUDENT: '@student.mes.ac.in',
    TEACHER: '@teacher.mes.ac.in',
    HOD: '@hod.mes.ac.in',
  },
};
