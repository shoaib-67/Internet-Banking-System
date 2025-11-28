const jwt = require('jsonwebtoken');

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      status: 'error', 
      message: 'Invalid or expired token' 
    });
  }
};

// Verify employee/admin access
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      status: 'error', 
      message: 'Invalid or expired token' 
    });
  }
};

// Verify manager access
const authenticateManager = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (!decoded.isManager && !decoded.isAdmin) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied. Manager privileges required.' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      status: 'error', 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = { authenticateToken, authenticateAdmin, authenticateManager };
