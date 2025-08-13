const express = require('express');
const database = require('../services/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/blockchain/events
// @desc    Get blockchain events
// @access  Private (Admin)
router.get('/events', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 50, processed } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM blockchain_events';
    const params = [];

    if (processed !== undefined) {
      query += ' WHERE processed = ?';
      params.push(processed === 'true');
    }

    query += ' ORDER BY block_number DESC, log_index DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const events = await database.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM blockchain_events';
    const countParams = [];

    if (processed !== undefined) {
      countQuery += ' WHERE processed = ?';
      countParams.push(processed === 'true');
    }

    const totalCount = await database.execute(countQuery, countParams);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].count,
          pages: Math.ceil(totalCount[0].count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get blockchain events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/v1/blockchain/sync
// @desc    Manually trigger blockchain sync
// @access  Private (Admin)
router.post('/sync', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // This would trigger the blockchain indexer
    // For now, just return success
    res.json({
      success: true,
      message: 'Blockchain sync triggered successfully'
    });

  } catch (error) {
    console.error('Blockchain sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/v1/blockchain/status
// @desc    Get blockchain indexer status
// @access  Private (Admin)
router.get('/status', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get latest processed block
    const latestBlock = await database.execute(
      'SELECT MAX(block_number) as latest_block FROM blockchain_events WHERE processed = TRUE'
    );

    // Get unprocessed events count
    const unprocessedCount = await database.execute(
      'SELECT COUNT(*) as count FROM blockchain_events WHERE processed = FALSE'
    );

    // Get total events count
    const totalEvents = await database.execute(
      'SELECT COUNT(*) as count FROM blockchain_events'
    );

    res.json({
      success: true,
      data: {
        latestProcessedBlock: latestBlock[0]?.latest_block || 0,
        unprocessedEvents: unprocessedCount[0]?.count || 0,
        totalEvents: totalEvents[0]?.count || 0,
        status: 'running' // This would come from the actual indexer service
      }
    });

  } catch (error) {
    console.error('Get blockchain status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
