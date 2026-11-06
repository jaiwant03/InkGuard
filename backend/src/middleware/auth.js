import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({
        success: false,
        message: 'Account not found or session expired.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Session expired. Please sign in again.' : 'Invalid session.',
    });
  }
}
