// OzoneStaking Contract ABI - Updated to match deployed contract
export const OZONE_STAKING_ABI = [
  // Basic view functions
  "function ozoneToken() view returns (address)",
  "function owner() view returns (address)",
  "function poolCount() view returns (uint256)",
  
  // Pool structure matching the deployed contract
  "function pools(uint256) view returns (uint256 id, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod, address rewardToken, uint256 totalStaked, uint256 activeStakers, bool active)",
  
  // Pool management functions matching deployed contract - simplified format
  "function getPoolInfo(uint256 _poolId) view returns (uint256 id, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod, address rewardToken, uint256 totalStaked, uint256 activeStakers, bool active)",
  "function getAllPools() view returns (tuple(uint256 id, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod, address rewardToken, uint256 totalStaked, uint256 activeStakers, bool active)[])",
  
  // User stake functions
  "function userStakes(address, uint256) view returns (uint256 amount, uint256 stakeTime, bool active, uint256 poolId)",
  "function getUserStake(address _user, uint256 _poolId) view returns (uint256 amount, uint256 stakeTime, bool active, uint256 timeLeft, uint256 potentialReward, bool canUnstake)",
  
  // Dashboard functions
  "function getAllActiveStakes() view returns (tuple(address user, uint256 amount, uint256 stakeTime, uint256 poolId, bool active)[])",
  "function getUserActiveStakes(address _user) view returns (tuple(address user, uint256 amount, uint256 stakeTime, uint256 poolId, bool active)[])",
  "function getTopStakers(uint256 _limit) view returns (address[], uint256[])",
  "function getPoolActiveStakers(uint256 _poolId) view returns (address[])",
  "function getTotalStakers() view returns (uint256)",
  
  // Calculation functions
  "function calculateReward(uint256 _poolId, address _user) view returns (uint256)",
  
  // Admin status
  "function admins(address) view returns (bool)",
  
  // User functions
  "function stake(uint256 _poolId, uint256 _amount)",
  "function unstake(uint256 _poolId)",
  
  // Admin functions
  "function createPool(uint256 _minAmount, uint256 _maxAmount, uint256 _apy, uint256 _lockPeriod, address _rewardToken)",
  "function fundRewardPool(uint256 _poolId, uint256 _amount)",
  "function addAdmin(address _admin)",
  "function removeAdmin(address _admin)",
  
  // Events
  "event PoolCreated(uint256 indexed poolId, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod)",
  "event Staked(address indexed user, uint256 indexed poolId, uint256 amount)",
  "event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 reward)",
  "event RewardPoolFunded(uint256 indexed poolId, address rewardToken, uint256 amount)",
];
