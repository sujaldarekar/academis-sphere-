// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('[AUTHORIZE] Authorization failed: No user in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role;
    console.log(`[AUTHORIZE] Checking authorization:`, {
      endpoint: `${req.method} ${req.path}`,
      userRole: userRole,
      userEmail: req.user.email,
      allowedRoles: allowedRoles,
      isAuthorized: userRole && allowedRoles.includes(userRole)
    });
    
    // Check if user has one of the allowed roles
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.error(`[AUTHORIZE] DENIED: User role '${userRole}' not in allowed roles [${allowedRoles.join(', ')}]`);
      return res.status(403).json({ 
        error: 'Forbidden - insufficient permissions',
        userRole: userRole,
        allowedRoles: allowedRoles
      });
    }

    console.log(`[AUTHORIZE] ALLOWED: User with role '${userRole}' accessing ${req.method} ${req.path}`);
    console.log('[AUTHORIZE] Calling next() to proceed to controller...');
    next();
    console.log('[AUTHORIZE] next() called successfully');
  };
};

module.exports = authorize;
