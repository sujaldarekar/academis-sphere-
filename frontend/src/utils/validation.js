// Email validation utilities
export const validateEmailForRole = (email, role) => {
  const emailDomains = {
    student: '@student.mes.ac.in',
    teacher: ['@mes.ac.in', '@teacher.mes.ac.in'],
    hod: ['@mes.ac.in', '@hod.mes.ac.in'],
  };

  const allowedDomains = emailDomains[role];
  if (Array.isArray(allowedDomains)) {
    return allowedDomains.some((domain) => email.endsWith(domain));
  }
  return email.endsWith(allowedDomains);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
