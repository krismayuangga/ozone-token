/**
 * Blockchain Service for direct contract interactions
 * Handles token balance, allowances, and other read operations
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { OZONE_ABI } from '../contracts/ozoneABI';
import { OZONE_STAKING_ABI } from '../contracts/stakingABI';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.ozoneContract = null;
    this.stakingContract = null;
    this.network = null;
  }

  // Initialize provider and contracts
  async init(provider, signer = null) {
    try {
      this.provider = provider;
      this.signer = signer;
      
      // Detect network
      const network = await provider.getNetwork();
      this.network = network;
      
      // Get contract addresses based on network
      let contractAddresses;
      console.log('🔍 Detected network chainId:', network.chainId.toString());
      
      if (network.chainId === 97n) { // BSC Testnet
        contractAddresses = CONTRACT_ADDRESSES.BSC_TESTNET;
        console.log('🔍 Using BSC Testnet addresses:', contractAddresses);
      } else if (network.chainId === 1337n) { // Localhost
        contractAddresses = {
          OZONE: CONTRACT_ADDRESSES.OZONE,
          OZONE_STAKING: CONTRACT_ADDRESSES.OZONE_STAKING
        };
        console.log('🔍 Using Localhost addresses:', contractAddresses);
      } else {
        throw new Error(`Unsupported network: ${network.chainId}`);
      }

      // Initialize contracts
      this.ozoneContract = new ethers.Contract(
        contractAddresses.OZONE,
        OZONE_ABI,
        provider
      );

      this.stakingContract = new ethers.Contract(
        contractAddresses.OZONE_STAKING,
        OZONE_STAKING_ABI,
        provider
      );

      console.log('✅ Blockchain service initialized for network:', network.chainId.toString());
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      return false;
    }
  }

  // Get OZONE token balance for address
  async getOzoneBalance(address) {
    try {
      if (!this.ozoneContract) {
        throw new Error('Blockchain service not initialized');
      }

      if (!ethers.isAddress(address)) {
        throw new Error('Invalid address');
      }

      console.log('🔍 Getting balance for address:', address);
      console.log('🔍 Using OZONE contract at:', await this.ozoneContract.getAddress());
      
      const balance = await this.ozoneContract.balanceOf(address);
      const decimals = await this.ozoneContract.decimals();
      
      console.log('🔍 Raw balance:', balance.toString());
      console.log('🔍 Decimals:', decimals.toString());
      
      const formatted = ethers.formatUnits(balance, decimals);
      console.log('🔍 Formatted balance:', formatted);
      
      return {
        raw: balance,
        formatted: formatted,
        decimals: Number(decimals)
      };
    } catch (error) {
      console.error('Error getting OZONE balance:', error);
      throw error;
    }
  }

  // Get OZONE allowance for staking contract
  async getOzoneAllowance(ownerAddress) {
    try {
      if (!this.ozoneContract || !this.stakingContract) {
        throw new Error('Blockchain service not initialized');
      }

      const allowance = await this.ozoneContract.allowance(
        ownerAddress,
        await this.stakingContract.getAddress()
      );
      
      const decimals = await this.ozoneContract.decimals();
      
      return {
        raw: allowance,
        formatted: ethers.formatUnits(allowance, decimals),
        decimals: Number(decimals)
      };
    } catch (error) {
      console.error('Error getting OZONE allowance:', error);
      throw error;
    }
  }

  // Get token info
  async getTokenInfo() {
    try {
      if (!this.ozoneContract) {
        throw new Error('Blockchain service not initialized');
      }

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.ozoneContract.name(),
        this.ozoneContract.symbol(),
        this.ozoneContract.decimals(),
        this.ozoneContract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: {
          raw: totalSupply,
          formatted: ethers.formatUnits(totalSupply, decimals)
        }
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  // Get staking contract info
  async getStakingInfo() {
    try {
      if (!this.stakingContract) {
        throw new Error('Blockchain service not initialized');
      }

      // This depends on your staking contract ABI
      // Add the functions you have in your staking contract
      const contractAddress = await this.stakingContract.getAddress();
      
      return {
        address: contractAddress,
        network: this.network?.chainId
      };
    } catch (error) {
      console.error('Error getting staking info:', error);
      throw error;
    }
  }

  // Get user staking info
  async getUserStakingInfo(userAddress) {
    try {
      if (!this.stakingContract) {
        throw new Error('Blockchain service not initialized');
      }

      // This depends on your staking contract ABI
      // Example functions - adjust based on your contract
      // const userStakes = await this.stakingContract.getUserStakes(userAddress);
      // const totalStaked = await this.stakingContract.totalStakedByUser(userAddress);
      
      return {
        address: userAddress,
        // totalStaked,
        // stakes: userStakes
      };
    } catch (error) {
      console.error('Error getting user staking info:', error);
      throw error;
    }
  }

  // Check if user needs to approve tokens for staking
  async checkNeedsApproval(userAddress, amount) {
    try {
      const allowance = await this.getOzoneAllowance(userAddress);
      const amountBigInt = ethers.parseUnits(amount.toString(), allowance.decimals);
      
      return allowance.raw < amountBigInt;
    } catch (error) {
      console.error('Error checking approval:', error);
      throw error;
    }
  }

  // Get current network info
  getCurrentNetwork() {
    return this.network;
  }

  // Check if connected to correct network
  isCorrectNetwork() {
    if (!this.network) return false;
    
    // Check if we're on BSC Testnet or localhost
    return this.network.chainId === 97n || this.network.chainId === 1337n;
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;

// Named exports
export const {
  init,
  getOzoneBalance,
  getOzoneAllowance,
  getTokenInfo,
  getStakingInfo,
  getUserStakingInfo,
  checkNeedsApproval,
  getCurrentNetwork,
  isCorrectNetwork
} = blockchainService;
