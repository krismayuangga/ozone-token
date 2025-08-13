/**
 * API Service for Ozone Staking Frontend
 * Handles all backend API communications
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  // Make HTTP request with authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ============ AUTH ENDPOINTS ============
  
  async connectWallet(walletAddress, signature, message) {
    const response = await this.post('/auth/connect', {
      walletAddress,
      signature,
      message,
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    try {
      return await this.get('/auth/me');
    } catch (error) {
      // If unauthorized, clear token
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        this.setToken(null);
      }
      throw error;
    }
  }

  async getNonce(walletAddress) {
    return await this.get(`/auth/nonce/${walletAddress}`);
  }

  async verifyToken() {
    return await this.post('/auth/verify', {});
  }

  async logout() {
    const response = await this.post('/auth/logout', {});
    this.setToken(null);
    return response;
  }

  // ============ USER ENDPOINTS ============
  
  async getUserStats() {
    return await this.get('/user/stats');
  }

  async updateUserProfile(profileData) {
    return await this.put('/user/profile', profileData);
  }

  async getUserStakes() {
    return await this.get('/user/stakes');
  }

  async getUserTransactions() {
    return await this.get('/user/transactions');
  }

  // ============ POOLS ENDPOINTS ============
  
  async getPools() {
    return await this.get('/pools');
  }

  async getPool(poolId) {
    return await this.get(`/pools/${poolId}`);
  }

  async getPoolStats(poolId) {
    return await this.get(`/pools/${poolId}/stats`);
  }

  async stakeToPool(poolId, amount, txHash) {
    return await this.post(`/pools/${poolId}/stake`, {
      amount,
      txHash,
    });
  }

  // ============ STAKES ENDPOINTS ============
  
  async getActiveStakes() {
    return await this.get('/stakes/active');
  }

  async unstake(stakeId) {
    return await this.put(`/stakes/${stakeId}/unstake`, {});
  }

  // ============ BLOCKCHAIN ENDPOINTS ============
  
  async syncBlockchain() {
    return await this.post('/blockchain/sync', {});
  }

  async getBlockchainEvents() {
    return await this.get('/blockchain/events');
  }

  async getBlockchainStatus() {
    return await this.get('/blockchain/status');
  }

  // ============ ADMIN ENDPOINTS ============
  
  async getAdminDashboard() {
    return await this.get('/admin/dashboard');
  }

  async getAllUsers() {
    return await this.get('/admin/users');
  }

  async getPlatformStats() {
    return await this.get('/admin/stats');
  }

  async updateSettings(settings) {
    return await this.post('/admin/settings', settings);
  }

  // ============ HEALTH CHECK ============
  
  async healthCheck() {
    const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
    return response.json();
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Named exports for convenience
export const {
  connectWallet,
  getCurrentUser,
  getNonce,
  verifyToken,
  logout,
  getUserStats,
  updateUserProfile,
  getUserStakes,
  getUserTransactions,
  getPools,
  getPool,
  getPoolStats,
  stakeToPool,
  getActiveStakes,
  unstake,
  syncBlockchain,
  getBlockchainEvents,
  getBlockchainStatus,
  getAdminDashboard,
  getAllUsers,
  getPlatformStats,
  updateSettings,
  healthCheck,
} = apiService;
