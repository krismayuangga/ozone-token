const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const database = require('../services/database');
const { auth } = require('../middleware/auth');
const { ethers } = require('ethers');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Generate JWT token
const generateToken = (userId, walletAddress, isAdmin = false) => {
  return jwt.sign(
    { userId, walletAddress, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Verify wallet signature (for Web3 auth)
const verifySignature = (message, signature, walletAddress) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// @route   POST /api/v1/auth/connect
// @desc    Connect wallet and authenticate user
// @access  Public
router.post('/connect', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('signature').notEmpty().withMessage('Signature is required'),
  body('message').notEmpty().withMessage('Message is required')
], validateRequest, async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Verify signature
    const isValidSignature = verifySignature(message, signature, walletAddress);
    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Get or create user
    let user = await database.getUserByWallet(walletAddress);
    if (!user) {
      await database.createUser(walletAddress);
      user = await database.getUserByWallet(walletAddress);
    }

    // Update last login
    await database.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user.id, user.wallet_address, user.is_admin);

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        token,
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          isAdmin: user.is_admin,
          totalStaked: user.total_staked,
          totalRewards: user.total_rewards
        }
      }
    });

  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/v1/auth/verify
// @desc    Verify JWT token
// @access  Private
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await database.getUserByWallet(decoded.walletAddress);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          isAdmin: user.is_admin,
          totalStaked: user.total_staked,
          totalRewards: user.total_rewards
        }
      }
    });

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

    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/auth/nonce
// @desc    Get nonce for signature
// @access  Public
router.get('/nonce/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const nonce = Math.floor(Math.random() * 1000000);
    const timestamp = Date.now();
    
    const message = `Sign this message to authenticate with Ozone Staking Platform.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    res.json({
      success: true,
      data: {
        message,
        nonce,
        timestamp
      }
    });

  } catch (error) {
    console.error('Nonce generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const walletAddress = req.user.walletAddress || req.user.wallet_address;
    const user = await database.getUserByWallet(walletAddress);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user stats
    const userStats = await database.getUserStats(user.wallet_address);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          email: user.email,
          username: user.username,
          isAdmin: user.is_admin,
          totalStaked: user.total_staked || '0',
          totalRewards: user.total_rewards || '0',
          createdAt: user.created_at,
          lastLogin: user.last_login,
          stats: userStats
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a production app, you might want to invalidate the token
    // For now, we'll just return success (client should remove token)
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
