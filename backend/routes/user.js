const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../services/database');
const { auth } = require('../middleware/auth');

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

// @route   GET /api/v1/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const userStats = await database.getUserStats(req.user.walletAddress);
    
    if (!userStats) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: userStats.id,
          walletAddress: userStats.wallet_address,
          username: userStats.username,
          email: userStats.email,
          isAdmin: userStats.is_admin,
          totalStaked: parseFloat(userStats.total_staked || 0),
          totalRewards: parseFloat(userStats.total_rewards || 0),
          totalStakes: parseInt(userStats.total_stakes || 0),
          activeStakes: parseInt(userStats.active_stakes || 0),
          activeStakedAmount: parseFloat(userStats.active_staked_amount || 0),
          createdAt: userStats.created_at,
          lastLogin: userStats.last_login
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/v1/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], validateRequest, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.userId;

    // Check if username is already taken
    if (username) {
      const existingUser = await database.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      
      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update user profile
    const updateFields = [];
    const updateValues = [];
    
    if (username !== undefined) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    await database.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated profile
    const updatedProfile = await database.getUserStats(req.user.walletAddress);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          id: updatedProfile.id,
          walletAddress: updatedProfile.wallet_address,
          username: updatedProfile.username,
          email: updatedProfile.email,
          isAdmin: updatedProfile.is_admin,
          totalStaked: parseFloat(updatedProfile.total_staked || 0),
          totalRewards: parseFloat(updatedProfile.total_rewards || 0),
          updatedAt: updatedProfile.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userStats = await database.getUserStats(req.user.walletAddress);
    
    if (!userStats) {
      // Return default stats for new users
      return res.json({
        success: true,
        data: {
          totalStaked: 0,
          totalRewards: 0,
          totalStakes: 0,
          activeStakes: 0,
          activeStakedAmount: 0,
          pendingRewards: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalStaked: parseFloat(userStats.total_staked || 0),
        totalRewards: parseFloat(userStats.total_rewards || 0),
        totalStakes: parseInt(userStats.total_stakes || 0),
        activeStakes: parseInt(userStats.active_stakes || 0),
        activeStakedAmount: parseFloat(userStats.active_staked_amount || 0),
        pendingRewards: parseFloat(userStats.pending_rewards || 0)
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/user/stakes
// @desc    Get user's stakes
// @access  Private
router.get('/stakes', auth, async (req, res) => {
  try {
    const { active, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM stakes WHERE wallet_address = ?';
    const params = [req.user.walletAddress];

    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const stakes = await database.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM stakes WHERE wallet_address = ?';
    const countParams = [req.user.walletAddress];
    
    if (active !== undefined) {
      countQuery += ' AND is_active = ?';
      countParams.push(active === 'true');
    }

    const totalCount = await database.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        stakes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].count,
          pages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user stakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/user/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM transactions WHERE wallet_address = ?';
    const params = [req.user.walletAddress];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = await database.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE wallet_address = ?';
    const countParams = [req.user.walletAddress];
    
    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const totalCount = await database.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].count,
          pages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userStats = await database.getUserStats(req.user.walletAddress);
    const recentStakes = await database.execute(
      'SELECT * FROM stakes WHERE wallet_address = ? ORDER BY created_at DESC LIMIT 5',
      [req.user.walletAddress]
    );
    const recentTransactions = await database.execute(
      'SELECT * FROM transactions WHERE wallet_address = ? ORDER BY created_at DESC LIMIT 5',
      [req.user.walletAddress]
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalStaked: parseFloat(userStats?.total_staked || 0),
          totalRewards: parseFloat(userStats?.total_rewards || 0),
          totalStakes: parseInt(userStats?.total_stakes || 0),
          activeStakes: parseInt(userStats?.active_stakes || 0),
          activeStakedAmount: parseFloat(userStats?.active_staked_amount || 0)
        },
        recentStakes,
        recentTransactions
      }
    });

  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
