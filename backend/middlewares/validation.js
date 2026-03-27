const { validationResult } = require('express-validator');

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors for', req.method, req.path);
    console.error('Request body:', req.body);
    console.error('Errors:', errors.array());
    
    const errorMessages = errors.array().map(err => {
      if (err.msg.includes('Invalid value')) {
        return `${err.param}: Invalid value`;
      }
      return `${err.param}: ${err.msg}`;
    });
    return res.status(400).json({ 
      error: errorMessages.join(', '),
      errors: errors.array() 
    });
  }
  next();
};

module.exports = validationErrorHandler;
