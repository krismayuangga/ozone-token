// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OZONE.sol";

contract OzoneStaking {
    OZONE public ozoneToken;
    
    struct Pool {
        uint256 id;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 apy;
        uint256 lockPeriod;
        address rewardToken;
        uint256 totalStaked;
        uint256 activeStakers;
        bool active;
    }
    
    struct UserStake {
        uint256 amount;
        uint256 stakeTime;
        bool active;
        uint256 poolId;
    }
    
    struct StakeInfo {
        address user;
        uint256 amount;
        uint256 stakeTime;
        uint256 poolId;
        bool active;
    }
    
    // State variables
    mapping(uint256 => Pool) public pools;
    mapping(address => mapping(uint256 => UserStake)) public userStakes;
    mapping(address => bool) public admins;
    
    // NEW: For dashboard tracking
    mapping(uint256 => address[]) public poolStakers;
    mapping(address => uint256[]) public userActivePools;
    address[] public allStakers;
    mapping(address => bool) private isRegisteredStaker;
    
    uint256 public poolCount;
    address public owner;
    
    // Events
    event PoolCreated(uint256 indexed poolId, uint256 minAmount, uint256 maxAmount, uint256 apy, uint256 lockPeriod);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 reward);
    event RewardPoolFunded(uint256 indexed poolId, address rewardToken, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Not admin");
        _;
    }
    
    constructor(address _ozoneToken) {
        ozoneToken = OZONE(_ozoneToken);
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    function createPool(
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _apy,
        uint256 _lockPeriod,
        address _rewardToken
    ) external onlyAdmin {
        pools[poolCount] = Pool({
            id: poolCount,
            minAmount: _minAmount,
            maxAmount: _maxAmount,
            apy: _apy,
            lockPeriod: _lockPeriod,
            rewardToken: _rewardToken,
            totalStaked: 0,
            activeStakers: 0,
            active: true
        });
        
        emit PoolCreated(poolCount, _minAmount, _maxAmount, _apy, _lockPeriod);
        poolCount++;
    }
    
    function stake(uint256 _poolId, uint256 _amount) external {
        require(_poolId < poolCount, "Invalid pool");
        require(pools[_poolId].active, "Pool not active");
        require(!userStakes[msg.sender][_poolId].active, "Already staked in this pool");
        require(_amount >= pools[_poolId].minAmount && _amount <= pools[_poolId].maxAmount, "Invalid amount");
        
        // Transfer tokens
        ozoneToken.transferFrom(msg.sender, address(this), _amount);
        
        // Update user stake
        userStakes[msg.sender][_poolId] = UserStake({
            amount: _amount,
            stakeTime: block.timestamp,
            active: true,
            poolId: _poolId
        });
        
        // Update pool stats
        pools[_poolId].totalStaked += _amount;
        pools[_poolId].activeStakers++;
        
        // NEW: Update tracking arrays
        poolStakers[_poolId].push(msg.sender);
        userActivePools[msg.sender].push(_poolId);
        
        // Register staker if new
        if (!isRegisteredStaker[msg.sender]) {
            allStakers.push(msg.sender);
            isRegisteredStaker[msg.sender] = true;
        }
        
        emit Staked(msg.sender, _poolId, _amount);
    }
    
    function unstake(uint256 _poolId) external {
        UserStake storage userStake = userStakes[msg.sender][_poolId];
        require(userStake.active, "No active stake");
        
        Pool storage pool = pools[_poolId];
        uint256 stakingDuration = block.timestamp - userStake.stakeTime;
        uint256 lockPeriodInSeconds = pool.lockPeriod * 24 * 60 * 60;
        uint256 reward = 0;
        
        // Calculate reward only if lock period completed
        if (stakingDuration >= lockPeriodInSeconds) {
            reward = calculateReward(_poolId, msg.sender);
        }
        
        // Transfer principal back
        ozoneToken.transfer(msg.sender, userStake.amount);
        
        // Transfer reward if eligible
        if (reward > 0) {
            if (pool.rewardToken == address(ozoneToken)) {
                ozoneToken.transfer(msg.sender, reward);
            } else {
                IERC20(pool.rewardToken).transfer(msg.sender, reward);
            }
        }
        
        // Update pool stats
        pool.totalStaked -= userStake.amount;
        pool.activeStakers--;
        
        // NEW: Update tracking arrays
        _removeFromPoolStakers(_poolId, msg.sender);
        _removeFromUserActivePools(msg.sender, _poolId);
        
        // Mark stake as inactive
        userStake.active = false;
        
        emit Unstaked(msg.sender, _poolId, userStake.amount, reward);
    }
    
    function calculateReward(uint256 _poolId, address _user) public view returns (uint256) {
        UserStake storage userStake = userStakes[_user][_poolId];
        if (!userStake.active) return 0;
        
        Pool storage pool = pools[_poolId];
        uint256 stakingDuration = block.timestamp - userStake.stakeTime;
        uint256 lockPeriodInSeconds = pool.lockPeriod * 24 * 60 * 60;
        
        // No reward if lock period not completed
        if (stakingDuration < lockPeriodInSeconds) return 0;
        
        // Calculate reward: (amount * APY * stakingDuration) / (365 days * 10000)
        uint256 annualReward = (userStake.amount * pool.apy) / 10000;
        uint256 reward = (annualReward * stakingDuration) / (365 * 24 * 60 * 60);
        
        return reward;
    }
    
    // ===== DASHBOARD DATA FUNCTIONS =====
    
    function getAllActiveStakes() external view returns (StakeInfo[] memory) {
        uint256 totalActive = 0;
        
        // Count active stakes
        for (uint256 i = 0; i < allStakers.length; i++) {
            address staker = allStakers[i];
            for (uint256 j = 0; j < userActivePools[staker].length; j++) {
                uint256 poolId = userActivePools[staker][j];
                if (userStakes[staker][poolId].active) {
                    totalActive++;
                }
            }
        }
        
        StakeInfo[] memory activeStakes = new StakeInfo[](totalActive);
        uint256 index = 0;
        
        // Collect active stakes
        for (uint256 i = 0; i < allStakers.length; i++) {
            address staker = allStakers[i];
            for (uint256 j = 0; j < userActivePools[staker].length; j++) {
                uint256 poolId = userActivePools[staker][j];
                UserStake storage userStake = userStakes[staker][poolId];
                if (userStake.active) {
                    activeStakes[index] = StakeInfo({
                        user: staker,
                        amount: userStake.amount,
                        stakeTime: userStake.stakeTime,
                        poolId: poolId,
                        active: true
                    });
                    index++;
                }
            }
        }
        
        return activeStakes;
    }
    
    function getUserActiveStakes(address _user) external view returns (StakeInfo[] memory) {
        uint256[] memory activePools = userActivePools[_user];
        uint256 activeCount = 0;
        
        // Count active stakes
        for (uint256 i = 0; i < activePools.length; i++) {
            if (userStakes[_user][activePools[i]].active) {
                activeCount++;
            }
        }
        
        StakeInfo[] memory userActiveStakes = new StakeInfo[](activeCount);
        uint256 index = 0;
        
        // Collect user active stakes
        for (uint256 i = 0; i < activePools.length; i++) {
            uint256 poolId = activePools[i];
            UserStake storage userStake = userStakes[_user][poolId];
            if (userStake.active) {
                userActiveStakes[index] = StakeInfo({
                    user: _user,
                    amount: userStake.amount,
                    stakeTime: userStake.stakeTime,
                    poolId: poolId,
                    active: true
                });
                index++;
            }
        }
        
        return userActiveStakes;
    }
    
    function getTopStakers(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        require(_limit > 0 && _limit <= allStakers.length, "Invalid limit");
        
        address[] memory topStakers = new address[](_limit);
        uint256[] memory totalStaked = new uint256[](_limit);
        
        // Simple sorting - in production, use more efficient algorithm
        for (uint256 i = 0; i < _limit && i < allStakers.length; i++) {
            address maxStaker = allStakers[0];
            uint256 maxStaked = _getTotalStakedByUser(allStakers[0]);
            
            for (uint256 j = 1; j < allStakers.length; j++) {
                uint256 userStaked = _getTotalStakedByUser(allStakers[j]);
                if (userStaked > maxStaked && !_isInTopStakers(allStakers[j], topStakers, i)) {
                    maxStaker = allStakers[j];
                    maxStaked = userStaked;
                }
            }
            
            topStakers[i] = maxStaker;
            totalStaked[i] = maxStaked;
        }
        
        return (topStakers, totalStaked);
    }
    
    function getPoolActiveStakers(uint256 _poolId) external view returns (address[] memory) {
        require(_poolId < poolCount, "Invalid pool");
        
        address[] memory stakers = poolStakers[_poolId];
        uint256 activeCount = 0;
        
        // Count active stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            if (userStakes[stakers[i]][_poolId].active) {
                activeCount++;
            }
        }
        
        address[] memory activeStakers = new address[](activeCount);
        uint256 index = 0;
        
        // Collect active stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            if (userStakes[stakers[i]][_poolId].active) {
                activeStakers[index] = stakers[i];
                index++;
            }
        }
        
        return activeStakers;
    }
    
    // ===== HELPER FUNCTIONS =====
    
    function _getTotalStakedByUser(address _user) internal view returns (uint256) {
        uint256 total = 0;
        uint256[] memory activePools = userActivePools[_user];
        
        for (uint256 i = 0; i < activePools.length; i++) {
            uint256 poolId = activePools[i];
            if (userStakes[_user][poolId].active) {
                total += userStakes[_user][poolId].amount;
            }
        }
        
        return total;
    }
    
    function _isInTopStakers(address _user, address[] memory _topStakers, uint256 _length) internal pure returns (bool) {
        for (uint256 i = 0; i < _length; i++) {
            if (_topStakers[i] == _user) {
                return true;
            }
        }
        return false;
    }
    
    function _removeFromPoolStakers(uint256 _poolId, address _user) internal {
        address[] storage stakers = poolStakers[_poolId];
        for (uint256 i = 0; i < stakers.length; i++) {
            if (stakers[i] == _user) {
                stakers[i] = stakers[stakers.length - 1];
                stakers.pop();
                break;
            }
        }
    }
    
    function _removeFromUserActivePools(address _user, uint256 _poolId) internal {
        uint256[] storage activePools = userActivePools[_user];
        for (uint256 i = 0; i < activePools.length; i++) {
            if (activePools[i] == _poolId) {
                activePools[i] = activePools[activePools.length - 1];
                activePools.pop();
                break;
            }
        }
    }
    
    // ===== EXISTING FUNCTIONS =====
    
    function getUserStake(address _user, uint256 _poolId) external view returns (
        uint256 amount,
        uint256 stakeTime,
        bool active,
        uint256 timeLeft,
        uint256 potentialReward,
        bool canUnstake
    ) {
        UserStake storage userStake = userStakes[_user][_poolId];
        amount = userStake.amount;
        stakeTime = userStake.stakeTime;
        active = userStake.active;
        
        if (active) {
            Pool storage pool = pools[_poolId];
            uint256 stakingDuration = block.timestamp - userStake.stakeTime;
            uint256 lockPeriodInSeconds = pool.lockPeriod * 24 * 60 * 60;
            
            if (stakingDuration < lockPeriodInSeconds) {
                timeLeft = lockPeriodInSeconds - stakingDuration;
                canUnstake = false;
            } else {
                timeLeft = 0;
                canUnstake = true;
            }
            
            potentialReward = calculateReward(_poolId, _user);
        }
    }
    
    function fundRewardPool(uint256 _poolId, uint256 _amount) external onlyAdmin {
        require(_poolId < poolCount, "Invalid pool");
        Pool storage pool = pools[_poolId];
        
        if (pool.rewardToken == address(ozoneToken)) {
            ozoneToken.transferFrom(msg.sender, address(this), _amount);
        } else {
            IERC20(pool.rewardToken).transferFrom(msg.sender, address(this), _amount);
        }
        
        emit RewardPoolFunded(_poolId, pool.rewardToken, _amount);
    }
    
    function addAdmin(address _admin) external onlyOwner {
        admins[_admin] = true;
    }
    
    function removeAdmin(address _admin) external onlyOwner {
        admins[_admin] = false;
    }
    
    function getPoolInfo(uint256 _poolId) external view returns (Pool memory) {
        require(_poolId < poolCount, "Invalid pool");
        return pools[_poolId];
    }
    
    function getAllPools() external view returns (Pool[] memory) {
        Pool[] memory allPools = new Pool[](poolCount);
        for (uint256 i = 0; i < poolCount; i++) {
            allPools[i] = pools[i];
        }
        return allPools;
    }
    
    function getTotalStakers() external view returns (uint256) {
        return allStakers.length;
    }
}
