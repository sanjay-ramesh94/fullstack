// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = { userId: decoded.userId, type: decoded.type };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};