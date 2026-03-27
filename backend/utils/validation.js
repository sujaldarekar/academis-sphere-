// Validation rules for email domains
const EMAIL_DOMAINS = {
  student: '@student.mes.ac.in',
  teacher: ['@mes.ac.in', '@teacher.mes.ac.in'],
  hod: ['@mes.ac.in', '@hod.mes.ac.in'],
};

// Check if email is valid for role
const validateEmailForRole = (email, role) => {
  const allowedDomains = EMAIL_DOMAINS[role];
  if (Array.isArray(allowedDomains)) {
    return allowedDomains.some((domain) => email.endsWith(domain));
  }
  return email.endsWith(allowedDomains);
};

module.exports = {
  EMAIL_DOMAINS,
  validateEmailForRole,
};
