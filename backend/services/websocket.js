const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const database = require('./database');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Store authenticated clients
  }

  start(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 WebSocket service started');
  }

  verifyClient(info) {
    // Extract token from query string or headers
    const token = new URL(info.req.url, 'ws://localhost').searchParams.get('token') ||
                 info.req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  async handleConnection(ws, req) {
    try {
      // Extract and verify token
      const token = new URL(req.url, 'ws://localhost').searchParams.get('token') ||
                   req.headers.authorization?.replace('Bearer ', '');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await database.getUserByWallet(decoded.walletAddress);

      if (!user) {
        ws.close(4001, 'User not found');
        return;
      }

      // Store client info
      const clientInfo = {
        ws,
        userId: user.id,
        walletAddress: user.wallet_address,
        isAdmin: user.is_admin,
        lastPing: Date.now()
      };

      this.clients.set(ws, clientInfo);
      
      console.log(`👤 WebSocket client connected: ${user.wallet_address}`);

      // Send welcome message
      this.sendMessage(ws, {
        type: 'connection',
        data: {
          status: 'connected',
          message: 'Welcome to Ozone Staking Platform',
          user: {
            walletAddress: user.wallet_address,
            isAdmin: user.is_admin
          }
        }
      });

      // Set up message handlers
      ws.on('message', (message) => this.handleMessage(ws, message));
      ws.on('close', () => this.handleDisconnection(ws));
      ws.on('pong', () => {
        if (this.clients.has(ws)) {
          this.clients.get(ws).lastPing = Date.now();
        }
      });

      // Send initial data
      await this.sendInitialData(ws, clientInfo);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(4002, 'Authentication failed');
    }
  }

  async sendInitialData(ws, clientInfo) {
    try {
      // Send user stats
      const userStats = await database.getUserStats(clientInfo.walletAddress);
      this.sendMessage(ws, {
        type: 'user_stats',
        data: userStats
      });

      // Send recent stakes
      const recentStakes = await database.getUserStakes(clientInfo.walletAddress, true);
      this.sendMessage(ws, {
        type: 'user_stakes',
        data: recentStakes.slice(0, 10) // Send last 10 stakes
      });

      // Send platform stats (public data)
      const platformStats = await database.getPlatformStats();
      this.sendMessage(ws, {
        type: 'platform_stats',
        data: platformStats
      });

    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      const clientInfo = this.clients.get(ws);

      if (!clientInfo) {
        return;
      }

      switch (data.type) {
        case 'ping':
          this.sendMessage(ws, { type: 'pong', timestamp: Date.now() });
          break;

        case 'subscribe':
          this.handleSubscription(ws, data.channels);
          break;

        case 'unsubscribe':
          this.handleUnsubscription(ws, data.channels);
          break;

        case 'get_user_data':
          this.sendUserData(ws, clientInfo);
          break;

        default:
          this.sendMessage(ws, {
            type: 'error',
            message: 'Unknown message type',
            data: { type: data.type }
          });
      }

    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.sendMessage(ws, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  }

  handleSubscription(ws, channels) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    if (!clientInfo.subscriptions) {
      clientInfo.subscriptions = new Set();
    }

    channels.forEach(channel => {
      clientInfo.subscriptions.add(channel);
    });

    this.sendMessage(ws, {
      type: 'subscription_confirmed',
      data: { channels: Array.from(clientInfo.subscriptions) }
    });
  }

  handleUnsubscription(ws, channels) {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo || !clientInfo.subscriptions) return;

    channels.forEach(channel => {
      clientInfo.subscriptions.delete(channel);
    });

    this.sendMessage(ws, {
      type: 'unsubscription_confirmed',
      data: { channels: Array.from(clientInfo.subscriptions) }
    });
  }

  async sendUserData(ws, clientInfo) {
    try {
      const userStats = await database.getUserStats(clientInfo.walletAddress);
      const userStakes = await database.getUserStakes(clientInfo.walletAddress);
      const userTransactions = await database.getUserTransactions(clientInfo.walletAddress, 20);

      this.sendMessage(ws, {
        type: 'user_data',
        data: {
          stats: userStats,
          stakes: userStakes,
          transactions: userTransactions
        }
      });

    } catch (error) {
      console.error('Error sending user data:', error);
      this.sendMessage(ws, {
        type: 'error',
        message: 'Failed to fetch user data'
      });
    }
  }

  handleDisconnection(ws) {
    const clientInfo = this.clients.get(ws);
    if (clientInfo) {
      console.log(`👋 WebSocket client disconnected: ${clientInfo.walletAddress}`);
      this.clients.delete(ws);
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  }

  // Broadcast to all clients
  broadcast(message, filter = null) {
    this.clients.forEach((clientInfo, ws) => {
      if (!filter || filter(clientInfo)) {
        this.sendMessage(ws, message);
      }
    });
  }

  // Broadcast to specific user
  sendToUser(walletAddress, message) {
    this.clients.forEach((clientInfo, ws) => {
      if (clientInfo.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        this.sendMessage(ws, message);
      }
    });
  }

  // Broadcast to admin users
  broadcastToAdmins(message) {
    this.broadcast(message, (clientInfo) => clientInfo.isAdmin);
  }

  // Broadcast to subscribed users
  broadcastToSubscribers(channel, message) {
    this.clients.forEach((clientInfo, ws) => {
      if (clientInfo.subscriptions && clientInfo.subscriptions.has(channel)) {
        this.sendMessage(ws, message);
      }
    });
  }

  // Notify about new stake
  notifyNewStake(stakeData) {
    // Notify the user
    this.sendToUser(stakeData.walletAddress, {
      type: 'stake_created',
      data: stakeData
    });

    // Notify admins
    this.broadcastToAdmins({
      type: 'new_stake',
      data: stakeData
    });

    // Broadcast to platform stats subscribers
    this.broadcastToSubscribers('platform_stats', {
      type: 'stats_update',
      data: { type: 'new_stake', stake: stakeData }
    });
  }

  // Notify about unstake
  notifyUnstake(unstakeData) {
    // Notify the user
    this.sendToUser(unstakeData.walletAddress, {
      type: 'stake_unstaked',
      data: unstakeData
    });

    // Notify admins
    this.broadcastToAdmins({
      type: 'stake_unstaked',
      data: unstakeData
    });
  }

  // Heartbeat to keep connections alive
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((clientInfo, ws) => {
        if (now - clientInfo.lastPing > 60000) { // 1 minute timeout
          ws.terminate();
          this.clients.delete(ws);
        } else {
          ws.ping();
        }
      });
    }, 30000); // Check every 30 seconds
  }

  getStats() {
    return {
      totalConnections: this.clients.size,
      connections: Array.from(this.clients.values()).map(client => ({
        walletAddress: client.walletAddress,
        isAdmin: client.isAdmin,
        subscriptions: client.subscriptions ? Array.from(client.subscriptions) : []
      }))
    };
  }
}

module.exports = new WebSocketService();
