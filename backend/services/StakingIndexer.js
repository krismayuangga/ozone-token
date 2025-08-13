// Backend API untuk Data Indexing
// File: backend/services/StakingIndexer.js

const { ethers } = require('ethers');
const mongoose = require('mongoose');

// Database Models
const StakeSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  poolId: { type: Number, required: true, index: true },
  amount: { type: String, required: true },
  stakeTime: { type: Date, required: true },
  unstakeTime: { type: Date, default: null },
  active: { type: Boolean, default: true, index: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  reward: { type: String, default: '0' },
  earlyUnstake: { type: Boolean, default: false }
});

const PoolStatsSchema = new mongoose.Schema({
  poolId: { type: Number, required: true, unique: true },
  totalStaked: { type: String, default: '0' },
  activeStakers: { type: Number, default: 0 },
  totalRewardsDistributed: { type: String, default: '0' },
  lastUpdated: { type: Date, default: Date.now }
});

const UserStatsSchema = new mongoose.Schema({
  userAddress: { type: String, required: true, unique: true, index: true },
  totalStaked: { type: String, default: '0' },
  activePools: [{ type: Number }],
  totalRewardsEarned: { type: String, default: '0' },
  stakingHistory: [{
    poolId: Number,
    amount: String,
    stakeTime: Date,
    unstakeTime: Date,
    reward: String,
    earlyUnstake: Boolean
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const Stake = mongoose.model('Stake', StakeSchema);
const PoolStats = mongoose.model('PoolStats', PoolStatsSchema);
const UserStats = mongoose.model('UserStats', UserStatsSchema);

class StakingIndexer {
  constructor(contractAddress, provider) {
    this.contractAddress = contractAddress;
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress,
      require('../contracts/OzoneStaking.json').abi,
      provider
    );
  }

  // Initialize event listeners
  async startIndexing() {
    console.log('🚀 Starting Staking Indexer...');
    
    // Listen to real-time events
    this.contract.on('Staked', this.handleStakeEvent.bind(this));
    this.contract.on('Unstaked', this.handleUnstakeEvent.bind(this));
    this.contract.on('PoolCreated', this.handlePoolCreatedEvent.bind(this));
    
    // Sync historical data on startup
    await this.syncHistoricalData();
    
    console.log('✅ Staking Indexer started successfully');
  }

  // Handle stake events
  async handleStakeEvent(user, poolId, amount, event) {
    try {
      console.log(`📊 Processing Stake Event: ${user} staked ${ethers.utils.formatEther(amount)} in pool ${poolId}`);
      
      // Save stake record
      const stake = new Stake({
        user: user.toLowerCase(),
        poolId: poolId.toNumber(),
        amount: amount.toString(),
        stakeTime: new Date(),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        active: true
      });
      await stake.save();
      
      // Update user stats
      await this.updateUserStats(user, poolId, amount, 'stake');
      
      // Update pool stats
      await this.updatePoolStats(poolId, amount, 1, 'stake');
      
      console.log('✅ Stake event processed successfully');
    } catch (error) {
      console.error('❌ Error processing stake event:', error);
    }
  }

  // Handle unstake events
  async handleUnstakeEvent(user, poolId, amount, reward, event) {
    try {
      console.log(`📊 Processing Unstake Event: ${user} unstaked ${ethers.utils.formatEther(amount)} from pool ${poolId}`);
      
      // Update stake record
      await Stake.findOneAndUpdate(
        { user: user.toLowerCase(), poolId: poolId.toNumber(), active: true },
        { 
          active: false, 
          unstakeTime: new Date(),
          reward: reward.toString(),
          earlyUnstake: reward.toString() === '0'
        }
      );
      
      // Update user stats
      await this.updateUserStats(user, poolId, amount, 'unstake', reward);
      
      // Update pool stats
      await this.updatePoolStats(poolId, amount, -1, 'unstake');
      
      console.log('✅ Unstake event processed successfully');
    } catch (error) {
      console.error('❌ Error processing unstake event:', error);
    }
  }

  // Handle pool created events
  async handlePoolCreatedEvent(poolId, minAmount, maxAmount, apy, lockPeriod, event) {
    try {
      console.log(`📊 Processing Pool Created Event: Pool ${poolId} created`);
      
      // Initialize pool stats
      const poolStats = new PoolStats({
        poolId: poolId.toNumber(),
        totalStaked: '0',
        activeStakers: 0,
        totalRewardsDistributed: '0'
      });
      await poolStats.save();
      
      console.log('✅ Pool created event processed successfully');
    } catch (error) {
      console.error('❌ Error processing pool created event:', error);
    }
  }

  // Update user statistics
  async updateUserStats(userAddress, poolId, amount, action, reward = ethers.BigNumber.from(0)) {
    try {
      const user = userAddress.toLowerCase();
      let userStats = await UserStats.findOne({ userAddress: user });
      
      if (!userStats) {
        userStats = new UserStats({
          userAddress: user,
          totalStaked: '0',
          activePools: [],
          totalRewardsEarned: '0',
          stakingHistory: []
        });
      }
      
      if (action === 'stake') {
        // Add to total staked
        const currentStaked = ethers.BigNumber.from(userStats.totalStaked);
        userStats.totalStaked = currentStaked.add(amount).toString();
        
        // Add to active pools
        if (!userStats.activePools.includes(poolId.toNumber())) {
          userStats.activePools.push(poolId.toNumber());
        }
        
        // Add to history
        userStats.stakingHistory.push({
          poolId: poolId.toNumber(),
          amount: amount.toString(),
          stakeTime: new Date(),
          reward: '0',
          earlyUnstake: false
        });
        
      } else if (action === 'unstake') {
        // Subtract from total staked
        const currentStaked = ethers.BigNumber.from(userStats.totalStaked);
        userStats.totalStaked = currentStaked.sub(amount).toString();
        
        // Remove from active pools
        userStats.activePools = userStats.activePools.filter(id => id !== poolId.toNumber());
        
        // Add to total rewards
        const currentRewards = ethers.BigNumber.from(userStats.totalRewardsEarned);
        userStats.totalRewardsEarned = currentRewards.add(reward).toString();
        
        // Update history
        const historyIndex = userStats.stakingHistory.findIndex(
          h => h.poolId === poolId.toNumber() && !h.unstakeTime
        );
        if (historyIndex !== -1) {
          userStats.stakingHistory[historyIndex].unstakeTime = new Date();
          userStats.stakingHistory[historyIndex].reward = reward.toString();
          userStats.stakingHistory[historyIndex].earlyUnstake = reward.toString() === '0';
        }
      }
      
      userStats.lastUpdated = new Date();
      await userStats.save();
      
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
    }
  }

  // Update pool statistics
  async updatePoolStats(poolId, amount, stakerDelta, action) {
    try {
      let poolStats = await PoolStats.findOne({ poolId: poolId.toNumber() });
      
      if (!poolStats) {
        poolStats = new PoolStats({
          poolId: poolId.toNumber(),
          totalStaked: '0',
          activeStakers: 0,
          totalRewardsDistributed: '0'
        });
      }
      
      if (action === 'stake') {
        const currentStaked = ethers.BigNumber.from(poolStats.totalStaked);
        poolStats.totalStaked = currentStaked.add(amount).toString();
        poolStats.activeStakers += stakerDelta;
        
      } else if (action === 'unstake') {
        const currentStaked = ethers.BigNumber.from(poolStats.totalStaked);
        poolStats.totalStaked = currentStaked.sub(amount).toString();
        poolStats.activeStakers += stakerDelta; // stakerDelta is -1 for unstake
      }
      
      poolStats.lastUpdated = new Date();
      await poolStats.save();
      
    } catch (error) {
      console.error('❌ Error updating pool stats:', error);
    }
  }

  // Sync historical data from blockchain
  async syncHistoricalData() {
    try {
      console.log('🔄 Syncing historical data...');
      
      // Get all historical events
      const stakeFilter = this.contract.filters.Staked();
      const unstakeFilter = this.contract.filters.Unstaked();
      const poolCreatedFilter = this.contract.filters.PoolCreated();
      
      const stakeEvents = await this.contract.queryFilter(stakeFilter);
      const unstakeEvents = await this.contract.queryFilter(unstakeFilter);
      const poolCreatedEvents = await this.contract.queryFilter(poolCreatedFilter);
      
      // Process events in chronological order
      const allEvents = [...stakeEvents, ...unstakeEvents, ...poolCreatedEvents]
        .sort((a, b) => a.blockNumber - b.blockNumber);
      
      for (const event of allEvents) {
        if (event.event === 'Staked') {
          await this.handleStakeEvent(event.args.user, event.args.poolId, event.args.amount, event);
        } else if (event.event === 'Unstaked') {
          await this.handleUnstakeEvent(event.args.user, event.args.poolId, event.args.amount, event.args.reward, event);
        } else if (event.event === 'PoolCreated') {
          await this.handlePoolCreatedEvent(event.args.poolId, event.args.minAmount, event.args.maxAmount, event.args.apy, event.args.lockPeriod, event);
        }
      }
      
      console.log('✅ Historical data sync completed');
    } catch (error) {
      console.error('❌ Error syncing historical data:', error);
    }
  }

  // API Methods for Dashboard
  
  // Get all active stakes
  async getAllActiveStakes(limit = 100, offset = 0) {
    return await Stake.find({ active: true })
      .sort({ stakeTime: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
  }

  // Get user active stakes
  async getUserActiveStakes(userAddress) {
    return await Stake.find({ 
      user: userAddress.toLowerCase(), 
      active: true 
    })
    .sort({ stakeTime: -1 })
    .lean();
  }

  // Get top stakers
  async getTopStakers(limit = 10) {
    return await UserStats.find({ totalStaked: { $ne: '0' } })
      .sort({ totalStaked: -1 })
      .limit(limit)
      .select('userAddress totalStaked totalRewardsEarned activePools')
      .lean();
  }

  // Get pool statistics
  async getPoolStatistics(poolId = null) {
    const query = poolId ? { poolId } : {};
    return await PoolStats.find(query).lean();
  }

  // Get leaderboard with pagination
  async getLeaderboard(limit = 50, offset = 0) {
    const topStakers = await UserStats.find({ totalStaked: { $ne: '0' } })
      .sort({ totalStaked: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const totalStakers = await UserStats.countDocuments({ totalStaked: { $ne: '0' } });

    return {
      stakers: topStakers,
      totalStakers,
      hasMore: (offset + limit) < totalStakers
    };
  }

  // Get dashboard analytics
  async getDashboardAnalytics() {
    const [totalStakes, activeStakes, totalStakers, poolStats] = await Promise.all([
      Stake.countDocuments(),
      Stake.countDocuments({ active: true }),
      UserStats.countDocuments({ totalStaked: { $ne: '0' } }),
      PoolStats.find().lean()
    ]);

    const totalValueLocked = poolStats.reduce((sum, pool) => {
      return sum + parseFloat(ethers.utils.formatEther(pool.totalStaked || '0'));
    }, 0);

    return {
      totalStakes,
      activeStakes,
      totalStakers,
      totalPools: poolStats.length,
      totalValueLocked: totalValueLocked.toFixed(2),
      poolStatistics: poolStats
    };
  }
}

module.exports = { StakingIndexer, Stake, PoolStats, UserStats };
