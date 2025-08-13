const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../services/database');
const { adminAuth } = require('../middleware/auth');

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

// @route   GET /api/v1/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const dashboardData = await database.getAdminDashboardData();
    
    // Additional analytics
    const dailyStats = await database.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COALESCE(SUM(CASE WHEN total_staked > 0 THEN 1 END), 0) as new_stakers
      FROM users 
      WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    const stakingTrends = await database.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as stakes_count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM stakes 
      WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    res.json({
      success: true,
      data: {
        ...dashboardData,
        analytics: {
          dailyStats,
          stakingTrends
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.*,
        COUNT(s.id) as total_stakes,
        COUNT(CASE WHEN s.is_active = TRUE THEN 1 END) as active_stakes,
        COALESCE(SUM(CASE WHEN s.is_active = TRUE THEN s.amount END), 0) as active_staked_amount
      FROM users u
      LEFT JOIN stakes s ON u.id = s.user_id
    `;

    const params = [];
    
    if (search) {
      query += ' WHERE (u.wallet_address LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await database.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM users u';
    const countParams = [];
    
    if (search) {
      countQuery += ' WHERE (u.wallet_address LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const totalCount = await database.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].count,
          pages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/admin/user/:id
// @desc    Get user details by ID
// @access  Private (Admin)
router.get('/user/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const userStats = await database.execute(`
      SELECT 
        u.*,
        COUNT(s.id) as total_stakes,
        COUNT(CASE WHEN s.is_active = TRUE THEN 1 END) as active_stakes,
        COALESCE(SUM(CASE WHEN s.is_active = TRUE THEN s.amount END), 0) as active_staked_amount,
        COALESCE(SUM(s.amount), 0) as lifetime_staked
      FROM users u
      LEFT JOIN stakes s ON u.id = s.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);

    if (userStats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userStats[0];
    
    // Get user's stakes
    const stakes = await database.execute(
      'SELECT * FROM stakes WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [id]
    );

    // Get user's transactions
    const transactions = await database.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [id]
    );

    res.json({
      success: true,
      data: {
        user,
        stakes,
        transactions
      }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/v1/admin/user/:id
// @desc    Update user (admin privileges)
// @access  Private (Admin)
router.put('/user/:id', adminAuth, [
  body('isAdmin').optional().isBoolean().withMessage('isAdmin must be boolean'),
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin, username, email } = req.body;

    // Check if user exists
    const existingUser = await database.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (isAdmin !== undefined) {
      updateFields.push('is_admin = ?');
      updateValues.push(isAdmin);
    }

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
    updateValues.push(id);

    await database.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const updatedUser = await database.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser[0]
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/admin/stakes
// @desc    Get all stakes with filters
// @access  Private (Admin)
router.get('/stakes', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, active, walletAddress } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.wallet_address, u.username
      FROM stakes s
      JOIN users u ON s.user_id = u.id
    `;

    const params = [];
    const conditions = [];

    if (active !== undefined) {
      conditions.push('s.is_active = ?');
      params.push(active === 'true');
    }

    if (walletAddress) {
      conditions.push('u.wallet_address LIKE ?');
      params.push(`%${walletAddress}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const stakes = await database.execute(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as count
      FROM stakes s
      JOIN users u ON s.user_id = u.id
    `;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const totalCount = await database.execute(countQuery, params.slice(0, -2)); // Remove limit and offset

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
    console.error('Get admin stakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/admin/transactions
// @desc    Get all transactions with filters
// @access  Private (Admin)
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, walletAddress } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.username
      FROM transactions t
      JOIN users u ON t.user_id = u.id
    `;

    const params = [];
    const conditions = [];

    if (type) {
      conditions.push('t.type = ?');
      params.push(type);
    }

    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (walletAddress) {
      conditions.push('t.wallet_address LIKE ?');
      params.push(`%${walletAddress}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = await database.execute(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as count
      FROM transactions t
      JOIN users u ON t.user_id = u.id
    `;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const totalCount = await database.execute(countQuery, params.slice(0, -2)); // Remove limit and offset

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
    console.error('Get admin transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin)
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    // User growth
    const userGrowth = await database.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        (SELECT COUNT(*) FROM users WHERE created_at <= DATE_ADD(DATE(u.created_at), INTERVAL 1 DAY)) as total_users
      FROM users u
      WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [parseInt(period)]);

    // Staking trends
    const stakingTrends = await database.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_stakes,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(DISTINCT user_id) as unique_stakers
      FROM stakes
      WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [parseInt(period)]);

    // Top stakers
    const topStakers = await database.execute(`
      SELECT 
        u.wallet_address,
        u.username,
        COUNT(s.id) as total_stakes,
        COALESCE(SUM(s.amount), 0) as total_staked,
        COUNT(CASE WHEN s.is_active = TRUE THEN 1 END) as active_stakes
      FROM users u
      JOIN stakes s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY total_staked DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        userGrowth,
        stakingTrends,
        topStakers
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
