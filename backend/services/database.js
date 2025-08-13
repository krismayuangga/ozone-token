const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async execute(query, params = []) {
    try {
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }

  async query(query, params = []) {
    try {
      const [rows] = await this.pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // User operations
  async createUser(walletAddress, email = null, username = null) {
    const query = `
      INSERT INTO users (wallet_address, email, username) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        email = COALESCE(VALUES(email), email),
        username = COALESCE(VALUES(username), username),
        updated_at = CURRENT_TIMESTAMP
    `;
    return await this.execute(query, [walletAddress, email, username]);
  }

  async getUserByWallet(walletAddress) {
    const query = 'SELECT * FROM users WHERE wallet_address = ?';
    const users = await this.execute(query, [walletAddress]);
    return users[0] || null;
  }

  async updateUserStats(userId, totalStaked, totalRewards) {
    const query = `
      UPDATE users 
      SET total_staked = ?, total_rewards = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return await this.execute(query, [totalStaked, totalRewards, userId]);
  }

  // Stake operations
  async createStake(userId, walletAddress, stakeId, amount, txHash, blockNumber, stakedAt) {
    const query = `
      INSERT INTO stakes (user_id, wallet_address, stake_id, amount, tx_hash, block_number, staked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return await this.execute(query, [userId, walletAddress, stakeId, amount, txHash, blockNumber, stakedAt]);
  }

  async updateStakeUnstaked(stakeId, unstakedAt, txHash) {
    const query = `
      UPDATE stakes 
      SET is_active = FALSE, unstaked_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE stake_id = ? AND is_active = TRUE
    `;
    return await this.execute(query, [unstakedAt, stakeId]);
  }

  async getUserStakes(walletAddress, isActive = null) {
    let query = 'SELECT * FROM stakes WHERE wallet_address = ?';
    const params = [walletAddress];
    
    if (isActive !== null) {
      query += ' AND is_active = ?';
      params.push(isActive);
    }
    
    query += ' ORDER BY created_at DESC';
    return await this.execute(query, params);
  }

  async getAllActiveStakes() {
    const query = `
      SELECT s.*, u.username 
      FROM stakes s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.is_active = TRUE 
      ORDER BY s.created_at DESC
    `;
    return await this.execute(query);
  }

  // Transaction operations
  async createTransaction(userId, walletAddress, txHash, type, amount, blockNumber, status = 'pending') {
    const query = `
      INSERT INTO transactions (user_id, wallet_address, tx_hash, type, amount, block_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        block_number = VALUES(block_number),
        updated_at = CURRENT_TIMESTAMP
    `;
    return await this.execute(query, [userId, walletAddress, txHash, type, amount, blockNumber, status]);
  }

  async updateTransactionStatus(txHash, status, blockNumber = null, gasUsed = null, gasPrice = null) {
    const query = `
      UPDATE transactions 
      SET status = ?, block_number = ?, gas_used = ?, gas_price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE tx_hash = ?
    `;
    return await this.execute(query, [status, blockNumber, gasUsed, gasPrice, txHash]);
  }

  async getUserTransactions(walletAddress, limit = 50) {
    const query = `
      SELECT * FROM transactions 
      WHERE wallet_address = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    return await this.execute(query, [walletAddress, limit]);
  }

  // Blockchain events
  async saveBlockchainEvent(eventName, contractAddress, txHash, blockNumber, blockHash, logIndex, eventData) {
    const query = `
      INSERT INTO blockchain_events (event_name, contract_address, tx_hash, block_number, block_hash, log_index, event_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        event_data = VALUES(event_data),
        processed = FALSE
    `;
    return await this.execute(query, [eventName, contractAddress, txHash, blockNumber, blockHash, logIndex, JSON.stringify(eventData)]);
  }

  async getUnprocessedEvents(limit = 100) {
    const query = `
      SELECT * FROM blockchain_events 
      WHERE processed = FALSE 
      ORDER BY block_number ASC, log_index ASC 
      LIMIT ?
    `;
    return await this.execute(query, [limit]);
  }

  async markEventProcessed(eventId) {
    const query = 'UPDATE blockchain_events SET processed = TRUE WHERE id = ?';
    return await this.execute(query, [eventId]);
  }

  // Analytics and stats
  async getPlatformStats() {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users',
      totalStakers: 'SELECT COUNT(DISTINCT user_id) as count FROM stakes WHERE is_active = TRUE',
      totalStaked: 'SELECT COALESCE(SUM(amount), 0) as total FROM stakes WHERE is_active = TRUE',
      totalTransactions: 'SELECT COUNT(*) as count FROM transactions WHERE status = "confirmed"'
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.execute(query);
      results[key] = result[0]?.count || result[0]?.total || 0;
    }

    return results;
  }

  async getUserStats(walletAddress) {
    const query = `
      SELECT 
        u.*,
        COUNT(s.id) as total_stakes,
        COUNT(CASE WHEN s.is_active = TRUE THEN 1 END) as active_stakes,
        COALESCE(SUM(CASE WHEN s.is_active = TRUE THEN s.amount END), 0) as active_staked_amount
      FROM users u
      LEFT JOIN stakes s ON u.id = s.user_id
      WHERE u.wallet_address = ?
      GROUP BY u.id
    `;
    const results = await this.execute(query, [walletAddress]);
    return results[0] || null;
  }

  // Admin operations
  async getAdminDashboardData() {
    const stats = await this.getPlatformStats();
    
    const recentStakes = await this.execute(`
      SELECT s.*, u.wallet_address, u.username
      FROM stakes s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    const recentTransactions = await this.execute(`
      SELECT t.*, u.username
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    return {
      stats,
      recentStakes,
      recentTransactions
    };
  }

  // Health check
  async healthCheck() {
    try {
      await this.execute('SELECT 1');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new Database();
