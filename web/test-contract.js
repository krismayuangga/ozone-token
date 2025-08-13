// Test contract calls directly
const { ethers } = require('ethers');

// Use a more stable RPC endpoint for BSC Testnet
const provider = new ethers.JsonRpcProvider('https://bsc-testnet.publicnode.com');

// Contract address and minimal ABI for testing
const stakingAddress = '0x6CbDdD8BD2072263291ddfF8d5760c36fDA08A26';
const minimalABI = [
  "function poolCount() view returns (uint256)",
  "function pools(uint256) view returns (uint256 id, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod, address rewardToken, uint256 totalStaked, uint256 activeStakers, bool active)",
  "function getPoolInfo(uint256 _poolId) view returns (tuple(uint256 id, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod, address rewardToken, uint256 totalStaked, uint256 activeStakers, bool active))"
];

async function testContract() {
  try {
    console.log('Testing contract calls...');
    
    const contract = new ethers.Contract(stakingAddress, minimalABI, provider);
    
    // Test 1: Get pool count
    console.log('1. Testing poolCount()...');
    const poolCount = await contract.poolCount();
    console.log('Pool count:', poolCount.toString());
    
    if (poolCount > 0) {
      // Test 2: Get pool data via pools mapping
      console.log('2. Testing pools(0) mapping...');
      try {
        const poolData = await contract.pools(0);
        console.log('Pool data via mapping:', {
          id: poolData.id.toString(),
          minAmount: poolData.minAmount.toString(),
          maxAmount: poolData.maxAmount.toString(),
          apy: poolData.apy.toString(),
          lockPeriod: poolData.lockPeriod.toString(),
          rewardToken: poolData.rewardToken,
          totalStaked: poolData.totalStaked.toString(),
          activeStakers: poolData.activeStakers.toString(),
          active: poolData.active
        });
      } catch (err) {
        console.error('Error with pools(0) mapping:', err.message);
      }
      
      // Test 3: Get pool data via getPoolInfo
      console.log('3. Testing getPoolInfo(0)...');
      try {
        const poolInfo = await contract.getPoolInfo(0);
        console.log('Pool info via getPoolInfo:', {
          id: poolInfo.id.toString(),
          minAmount: poolInfo.minAmount.toString(),
          maxAmount: poolInfo.maxAmount.toString(),
          apy: poolInfo.apy.toString(),
          lockPeriod: poolInfo.lockPeriod.toString(),
          rewardToken: poolInfo.rewardToken,
          totalStaked: poolInfo.totalStaked.toString(),
          activeStakers: poolInfo.activeStakers.toString(),
          active: poolInfo.active
        });
      } catch (err) {
        console.error('Error with getPoolInfo(0):', err.message);
      }
    }
    
  } catch (error) {
    console.error('Contract test failed:', error);
  }
}

testContract();
