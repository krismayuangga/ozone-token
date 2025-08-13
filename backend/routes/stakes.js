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

// @route   GET /api/v1/stakes/user/:walletAddress
// @desc    Get user stakes
// @access  Private
router.get('/user/:walletAddress', auth, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { active } = req.query;

    // Check if user can access this data
    if (req.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const isActive = active !== undefined ? active === 'true' : null;
    const stakes = await database.getUserStakes(walletAddress, isActive);

    res.json({
      success: true,
      data: {
        stakes,
        count: stakes.length
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

// @route   POST /api/v1/stakes/create
// @desc    Create new stake record
// @access  Private
router.post('/create', auth, [
  body('stakeId').isInt({ min: 0 }).withMessage('Invalid stake ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Invalid amount'),
  body('txHash').matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Invalid transaction hash'),
  body('blockNumber').isInt({ min: 0 }).withMessage('Invalid block number')
], validateRequest, async (req, res) => {
  try {
    const { stakeId, amount, txHash, blockNumber } = req.body;
    const walletAddress = req.user.walletAddress;
    const userId = req.user.userId;

    // Check if stake already exists
    const existingStake = await database.execute(
      'SELECT id FROM stakes WHERE stake_id = ? AND wallet_address = ?',
      [stakeId, walletAddress]
    );

    if (existingStake.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Stake already exists'
      });
    }

    // Create stake record
    const stakedAt = new Date();
    await database.createStake(
      userId,
      walletAddress,
      stakeId,
      amount,
      txHash,
      blockNumber,
      stakedAt
    );

    // Create transaction record
    await database.createTransaction(
      userId,
      walletAddress,
      txHash,
      'stake',
      amount,
      blockNumber,
      'confirmed'
    );

    // Update user stats
    const userStats = await database.getUserStats(walletAddress);
    await database.updateUserStats(
      userId,
      userStats.active_staked_amount,
      userStats.total_rewards || 0
    );

    res.json({
      success: true,
      message: 'Stake created successfully',
      data: {
        stakeId,
        amount,
        txHash,
        blockNumber
      }
    });

  } catch (error) {
    console.error('Create stake error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/v1/stakes/unstake
// @desc    Update stake as unstaked
// @access  Private
router.put('/unstake', auth, [
  body('stakeId').isInt({ min: 0 }).withMessage('Invalid stake ID'),
  body('txHash').matches(/^0x[a-fA-F0-9]{64}$/).withMessage('Invalid transaction hash')
], validateRequest, async (req, res) => {
  try {
    const { stakeId, txHash } = req.body;
    const walletAddress = req.user.walletAddress;
    const userId = req.user.userId;

    // Check if stake exists and belongs to user
    const stakes = await database.execute(
      'SELECT * FROM stakes WHERE stake_id = ? AND wallet_address = ? AND is_active = TRUE',
      [stakeId, walletAddress]
    );

    if (stakes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active stake not found'
      });
    }

    const stake = stakes[0];
    const unstakedAt = new Date();

    // Update stake as unstaked
    await database.updateStakeUnstaked(stakeId, unstakedAt, txHash);

    // Create transaction record
    await database.createTransaction(
      userId,
      walletAddress,
      txHash,
      'unstake',
      stake.amount,
      null, // Will be updated by blockchain indexer
      'confirmed'
    );

    // Update user stats
    const userStats = await database.getUserStats(walletAddress);
    await database.updateUserStats(
      userId,
      userStats.active_staked_amount,
      userStats.total_rewards || 0
    );

    res.json({
      success: true,
      message: 'Stake unstaked successfully',
      data: {
        stakeId,
        amount: stake.amount,
        txHash,
        unstakedAt
      }
    });

  } catch (error) {
    console.error('Unstake error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/stakes/stats
// @desc    Get staking statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await database.getPlatformStats();
    
    // Additional calculations
    const averageStake = stats.totalStakers > 0 ? stats.totalStaked / stats.totalStakers : 0;
    
    res.json({
      success: true,
      data: {
        totalUsers: parseInt(stats.totalUsers),
        totalStakers: parseInt(stats.totalStakers),
        totalStaked: parseFloat(stats.totalStaked),
        totalTransactions: parseInt(stats.totalTransactions),
        averageStake: parseFloat(averageStake.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/stakes/all
// @desc    Get all active stakes (Admin only)
// @access  Private (Admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const stakes = await database.execute(`
      SELECT s.*, u.wallet_address, u.username
      FROM stakes s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const totalCount = await database.execute(
      'SELECT COUNT(*) as count FROM stakes WHERE is_active = TRUE'
    );

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
    console.error('Get all stakes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
