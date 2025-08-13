const crypto = require('crypto');

function getFunctionSelector(signature) {
    const hash = crypto.createHash('sha3-256').update(signature).digest('hex');
    return '0x' + hash.slice(0, 8);
}

// Check function selectors for pool-related functions
console.log('getPoolInfo(uint256):', getFunctionSelector('getPoolInfo(uint256)'));
console.log('poolCount():', getFunctionSelector('poolCount()'));
console.log('getPool(uint256):', getFunctionSelector('getPool(uint256)'));
console.log('pools(uint256):', getFunctionSelector('pools(uint256)'));
console.log('stakingPools(uint256):', getFunctionSelector('stakingPools(uint256)'));
console.log('getStakingPool(uint256):', getFunctionSelector('getStakingPool(uint256)'));
