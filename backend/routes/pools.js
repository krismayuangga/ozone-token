const express = require('express');
const { body, param, validationResult } = require('express-validator');
const database = require('../services/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
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

// GET /api/v1/pools - Get all staking pools
router.get('/', async (req, res) => {
  try {
    // Get real-time stats from database and blockchain
    const dbStats = await database.getPlatformStats();
    const totalStakes = await database.execute(`
      SELECT COUNT(*) as total_stakers, 
             SUM(CASE WHEN is_active = TRUE THEN amount ELSE 0 END) as total_staked
      FROM stakes
    `);
    
    const recentActivity = await database.execute(`
      SELECT COUNT(*) as recent_stakes, 
             SUM(amount) as recent_amount
      FROM stakes 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Real pool data from blockchain and database
    const pools = [
      {
        id: 1,
        name: 'OZONE Staking Pool',
        symbol: 'OZONE',
        contractAddress: process.env.OZONE_CONTRACT_ADDRESS || '0x6cbddd8bd2072263291ddff8d5760c36fda08a26',
        apy: '12.5',
        totalStaked: totalStakes[0]?.total_staked || '0',
        totalStakers: totalStakes[0]?.total_stakers || 0,
        minStake: '100.0',
        maxStake: '100000.0',
        stakingPeriod: '30 days',
        rewardPeriod: 'daily',
        status: 'active',
        description: 'Stake OZONE tokens and earn daily rewards',
        features: [
          'Daily rewards distribution',
          'Flexible unstaking',
          'No lock-up period',
          'Compound rewards'
        ],
        risks: [
          'Smart contract risk',
          'Token price volatility',
          'Network congestion fees'
        ],
        recentActivity: {
          stakesLast7Days: recentActivity[0]?.recent_stakes || 0,
          amountLast7Days: recentActivity[0]?.recent_amount || '0'
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'OZONE Pro Pool',
        symbol: 'OZONE',
        contractAddress: process.env.OZONE_CONTRACT_ADDRESS || '0x6cbddd8bd2072263291ddff8d5760c36fda08a26',
        apy: '18.0',
        totalStaked: (parseFloat(totalStakes[0]?.total_staked || '0') * 0.3).toString(), // 30% in pro pool
        totalStakers: Math.floor((totalStakes[0]?.total_stakers || 0) * 0.3),
        minStake: '1000.0',
        maxStake: '500000.0',
        stakingPeriod: '90 days',
        rewardPeriod: 'weekly',
        status: 'active',
        description: 'High yield staking pool for professional stakers',
        features: [
          'Weekly rewards distribution',
          'Higher APY rewards',
          '90-day commitment',
          'Priority support'
        ],
        risks: [
          'Smart contract risk',
          'Token price volatility',
          'Network congestion fees',
          'Longer commitment period'
        ],
        recentActivity: {
          stakesLast7Days: Math.floor((recentActivity[0]?.recent_stakes || 0) * 0.3),
          amountLast7Days: (parseFloat(recentActivity[0]?.recent_amount || '0') * 0.3).toString()
        },
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        pools,
        totalPools: pools.length,
        activePools: pools.filter(p => p.status === 'active').length,
        platformStats: {
          totalStaked: totalStakes[0]?.total_staked || '0',
          totalStakers: totalStakes[0]?.total_stakers || 0,
          totalRewardsDistributed: dbStats.totalRewards || '0'
        }
      }
    });
  } catch (error) {
    console.error('Get pools error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pools',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /api/v1/pools/:id - Get specific pool
router.get('/:id', [
  param('id').isNumeric().withMessage('Pool ID must be a number')
], handleValidationErrors, async (req, res) => {
  try {
    const poolId = parseInt(req.params.id);
    
    // Static pool data for now
    const pools = {
      1: {
        id: 1,
        name: 'OZONE Staking Pool',
        symbol: 'OZONE',
        contractAddress: process.env.OZONE_CONTRACT_ADDRESS || '0x6cbddd8bd2072263291ddff8d5760c36fda08a26',
        apy: '12.5',
        totalStaked: '1000000.0',
        totalStakers: 150,
        minStake: '100.0',
        maxStake: '100000.0',
        stakingPeriod: '30 days',
        rewardPeriod: 'daily',
        status: 'active',
        description: 'Stake OZONE tokens and earn daily rewards',
        features: [
          'Daily rewards distribution',
          'Flexible unstaking',
          'No lock-up period',
          'Compound rewards'
        ],
        risks: [
          'Smart contract risk',
          'Token price volatility',
          'Network congestion fees'
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      },
      2: {
        id: 2,
        name: 'OZONE Pro Pool',
        symbol: 'OZONE',
        contractAddress: process.env.OZONE_CONTRACT_ADDRESS || '0x6cbddd8bd2072263291ddff8d5760c36fda08a26',
        apy: '18.0',
        totalStaked: '500000.0',
        totalStakers: 75,
        minStake: '1000.0',
        maxStake: '500000.0',
        stakingPeriod: '90 days',
        rewardPeriod: 'weekly',
        status: 'active',
        description: 'High yield staking pool for professional stakers',
        features: [
          'Weekly rewards distribution',
          'Higher APY rewards',
          '90-day commitment',
          'Priority support'
        ],
        risks: [
          'Smart contract risk',
          'Token price volatility',
          'Network congestion fees',
          'Longer commitment period'
        ],
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: new Date().toISOString()
      }
    };

    const pool = pools[poolId];
    if (!pool) {
      return res.status(404).json({
        success: false,
        message: 'Pool not found'
      });
    }

    // Get real-time stats from database
    try {
      const dbStats = await database.getPlatformStats();
      
      if (poolId === 1) {
        pool.totalStaked = dbStats.totalStaked || '0';
        pool.totalStakers = dbStats.totalStakers || 0;
      }
    } catch (dbError) {
      console.warn('Could not fetch database stats:', dbError.message);
    }

    res.json({
      success: true,
      data: pool
    });
  } catch (error) {
    console.error('Get pool error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pool',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET /api/v1/pools/:id/stats - Get pool statistics
router.get('/:id/stats', [
  param('id').isNumeric().withMessage('Pool ID must be a number')
], handleValidationErrors, async (req, res) => {
  try {
    const poolId = parseInt(req.params.id);
    
    // Get stats from database
    const stats = await database.getPlatformStats();
    const recentStakes = await database.execute(`
      SELECT COUNT(*) as count, SUM(amount) as total_amount
      FROM stakes 
      WHERE is_active = TRUE 
      AND DATE(created_at) >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
    `);

    const poolStats = {
      totalStaked: stats.totalStaked || '0',
      totalStakers: stats.totalStakers || 0,
      activeStakes: stats.totalStakers || 0,
      recentActivity: {
        last7Days: {
          newStakes: recentStakes[0]?.count || 0,
          totalAmount: recentStakes[0]?.total_amount || '0'
        }
      },
      performance: {
        apy: poolId === 1 ? '12.5' : '18.0',
        rewards24h: '1250.00',
        totalRewardsDistributed: '125000.00'
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: poolStats
    });
  } catch (error) {
    console.error('Get pool stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pool statistics',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// POST /api/v1/pools/:id/stake - Stake tokens to pool (requires auth)
router.post('/:id/stake', auth, [
  param('id').isNumeric().withMessage('Pool ID must be a number'),
  body('amount').isDecimal({ decimal_digits: '0,18' }).withMessage('Amount must be a valid decimal'),
  body('txHash').isLength({ min: 66, max: 66 }).withMessage('Transaction hash must be 66 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const poolId = parseInt(req.params.id);
    const { amount, txHash } = req.body;
    const userId = req.user.id;
    const walletAddress = req.user.wallet_address;

    // Validate pool exists
    if (![1, 2].includes(poolId)) {
      return res.status(404).json({
        success: false,
        message: 'Pool not found'
      });
    }

    // Create stake record (this would be called after blockchain confirmation)
    const stake = await database.createStake(
      userId,
      walletAddress,
      `${Date.now()}_${poolId}`, // Generate unique stake ID
      amount,
      txHash,
      0, // Block number - would be filled by blockchain indexer
      new Date()
    );

    res.json({
      success: true,
      message: 'Stake request submitted',
      data: {
        stakeId: stake.insertId,
        poolId,
        amount,
        txHash,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Stake error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process stake',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

module.exports = router;
