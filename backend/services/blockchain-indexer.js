const { ethers } = require('ethers');
const cron = require('node-cron');
const database = require('./database');

class BlockchainIndexer {
  constructor() {
    this.provider = null;
    this.stakingContract = null;
    this.ozoneContract = null;
    this.isRunning = false;
    this.lastProcessedBlock = 0;
    
    this.init();
  }

  async init() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      
      // Contract ABIs (simplified for key events)
      this.stakingABI = [
        "event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 timestamp)",
        "event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 timestamp)",
        "event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp)"
      ];
      
      this.ozoneABI = [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
      ];

      // Initialize contracts
      this.stakingContract = new ethers.Contract(
        process.env.STAKING_CONTRACT_ADDRESS,
        this.stakingABI,
        this.provider
      );

      this.ozoneContract = new ethers.Contract(
        process.env.OZONE_CONTRACT_ADDRESS,
        this.ozoneABI,
        this.provider
      );

      console.log('✅ Blockchain indexer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize blockchain indexer:', error);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Blockchain indexer is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting blockchain indexer...');

    // Get last processed block from database
    try {
      const lastBlock = await database.execute(
        'SELECT MAX(block_number) as last_block FROM blockchain_events WHERE processed = TRUE'
      );
      this.lastProcessedBlock = lastBlock[0]?.last_block || 0;
      console.log(`📊 Last processed block: ${this.lastProcessedBlock}`);
    } catch (error) {
      console.error('Error getting last processed block:', error);
      this.lastProcessedBlock = 0;
    }

    // Start periodic sync
    this.scheduleSync();
    
    // Run initial sync
    await this.syncEvents();
  }

  scheduleSync() {
    // Run every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      if (this.isRunning) {
        await this.syncEvents();
      }
    });

    // Process unprocessed events every minute
    cron.schedule('0 * * * * *', async () => {
      if (this.isRunning) {
        await this.processUnprocessedEvents();
      }
    });
  }

  async syncEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = this.lastProcessedBlock + 1;
      const toBlock = Math.min(fromBlock + 1000, currentBlock); // Process in chunks

      if (fromBlock > currentBlock) {
        return; // No new blocks to process
      }

      console.log(`🔍 Syncing blocks ${fromBlock} to ${toBlock}`);

      // Sync staking events
      await this.syncStakingEvents(fromBlock, toBlock);
      
      // Sync token events (if needed)
      // await this.syncTokenEvents(fromBlock, toBlock);

      this.lastProcessedBlock = toBlock;
      console.log(`✅ Synced up to block ${toBlock}`);

    } catch (error) {
      console.error('❌ Error syncing events:', error);
    }
  }

  async syncStakingEvents(fromBlock, toBlock) {
    try {
      // Get Staked events
      const stakedFilter = this.stakingContract.filters.Staked();
      const stakedEvents = await this.stakingContract.queryFilter(stakedFilter, fromBlock, toBlock);

      for (const event of stakedEvents) {
        await this.saveEvent('Staked', event);
      }

      // Get Unstaked events
      const unstakedFilter = this.stakingContract.filters.Unstaked();
      const unstakedEvents = await this.stakingContract.queryFilter(unstakedFilter, fromBlock, toBlock);

      for (const event of unstakedEvents) {
        await this.saveEvent('Unstaked', event);
      }

      // Get RewardClaimed events
      const rewardFilter = this.stakingContract.filters.RewardClaimed();
      const rewardEvents = await this.stakingContract.queryFilter(rewardFilter, fromBlock, toBlock);

      for (const event of rewardEvents) {
        await this.saveEvent('RewardClaimed', event);
      }

    } catch (error) {
      console.error('Error syncing staking events:', error);
    }
  }

  async saveEvent(eventName, event) {
    try {
      const eventData = {
        user: event.args.user,
        stakeId: event.args.stakeId?.toString(),
        amount: event.args.amount?.toString(),
        timestamp: event.args.timestamp?.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      };

      await database.saveBlockchainEvent(
        eventName,
        event.address,
        event.transactionHash,
        event.blockNumber,
        event.blockHash,
        event.index,
        eventData
      );

    } catch (error) {
      if (!error.message.includes('Duplicate entry')) {
        console.error(`Error saving ${eventName} event:`, error);
      }
    }
  }

  async processUnprocessedEvents() {
    try {
      const unprocessedEvents = await database.getUnprocessedEvents(50);
      
      if (unprocessedEvents.length === 0) {
        return;
      }

      console.log(`📝 Processing ${unprocessedEvents.length} unprocessed events`);

      for (const event of unprocessedEvents) {
        try {
          await this.processEvent(event);
          await database.markEventProcessed(event.id);
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error);
        }
      }

    } catch (error) {
      console.error('Error processing unprocessed events:', error);
    }
  }

  async processEvent(event) {
    const eventData = JSON.parse(event.event_data);
    
    switch (event.event_name) {
      case 'Staked':
        await this.processStakedEvent(eventData, event);
        break;
      case 'Unstaked':
        await this.processUnstakedEvent(eventData, event);
        break;
      case 'RewardClaimed':
        await this.processRewardEvent(eventData, event);
        break;
      default:
        console.log(`Unknown event type: ${event.event_name}`);
    }
  }

  async processStakedEvent(eventData, event) {
    try {
      // Get or create user
      let user = await database.getUserByWallet(eventData.user);
      if (!user) {
        await database.createUser(eventData.user);
        user = await database.getUserByWallet(eventData.user);
      }

      // Check if stake already exists
      const existingStake = await database.execute(
        'SELECT id FROM stakes WHERE stake_id = ? AND wallet_address = ?',
        [eventData.stakeId, eventData.user]
      );

      if (existingStake.length === 0) {
        // Create stake record
        const stakedAt = new Date(parseInt(eventData.timestamp) * 1000);
        await database.createStake(
          user.id,
          eventData.user,
          parseInt(eventData.stakeId),
          eventData.amount,
          eventData.transactionHash,
          event.block_number,
          stakedAt
        );

        // Create transaction record
        await database.createTransaction(
          user.id,
          eventData.user,
          eventData.transactionHash,
          'stake',
          eventData.amount,
          event.block_number,
          'confirmed'
        );

        // Update user stats
        const userStats = await database.getUserStats(eventData.user);
        await database.updateUserStats(
          user.id,
          userStats.active_staked_amount,
          userStats.total_rewards || 0
        );

        console.log(`✅ Processed Staked event: User ${eventData.user}, Stake ID ${eventData.stakeId}`);
      }

    } catch (error) {
      console.error('Error processing Staked event:', error);
    }
  }

  async processUnstakedEvent(eventData, event) {
    try {
      // Update stake as unstaked
      const unstakedAt = new Date(parseInt(eventData.timestamp) * 1000);
      await database.updateStakeUnstaked(parseInt(eventData.stakeId), unstakedAt);

      // Get user
      const user = await database.getUserByWallet(eventData.user);
      if (user) {
        // Create transaction record
        await database.createTransaction(
          user.id,
          eventData.user,
          eventData.transactionHash,
          'unstake',
          eventData.amount,
          event.block_number,
          'confirmed'
        );

        // Update user stats
        const userStats = await database.getUserStats(eventData.user);
        await database.updateUserStats(
          user.id,
          userStats.active_staked_amount,
          userStats.total_rewards || 0
        );
      }

      console.log(`✅ Processed Unstaked event: User ${eventData.user}, Stake ID ${eventData.stakeId}`);

    } catch (error) {
      console.error('Error processing Unstaked event:', error);
    }
  }

  async processRewardEvent(eventData, event) {
    try {
      // Get user
      const user = await database.getUserByWallet(eventData.user);
      if (user) {
        // Create transaction record
        await database.createTransaction(
          user.id,
          eventData.user,
          eventData.transactionHash,
          'reward',
          eventData.amount,
          event.block_number,
          'confirmed'
        );

        // Update user rewards
        const currentRewards = parseFloat(user.total_rewards || 0);
        const newRewards = currentRewards + parseFloat(eventData.amount);
        
        await database.execute(
          'UPDATE users SET total_rewards = ? WHERE id = ?',
          [newRewards, user.id]
        );
      }

      console.log(`✅ Processed Reward event: User ${eventData.user}, Amount ${eventData.amount}`);

    } catch (error) {
      console.error('Error processing Reward event:', error);
    }
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Blockchain indexer stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastProcessedBlock: this.lastProcessedBlock,
      provider: !!this.provider,
      contracts: {
        staking: !!this.stakingContract,
        ozone: !!this.ozoneContract
      }
    };
  }
}

module.exports = new BlockchainIndexer();
