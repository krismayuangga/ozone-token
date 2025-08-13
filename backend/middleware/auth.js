const jwt = require('jsonwebtoken');
const database = require('../services/database');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if decoded token has walletAddress
    const walletAddress = decoded.walletAddress || decoded.wallet_address;
    if (!walletAddress) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - missing wallet address'
      });
    }
    
    // Get user from database
    const user = await database.getUserByWallet(walletAddress);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      walletAddress: user.wallet_address,
      isAdmin: user.is_admin,
      // Add alias for consistency
      wallet_address: user.wallet_address
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin only middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { auth, adminAuth };
