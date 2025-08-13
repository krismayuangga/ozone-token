const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OzoneStaking", function () {
  let ozoneToken;
  let rewardToken;
  let ozoneStaking;
  let owner;
  let treasury;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();
    
    // Deploy OZONE token
    const OZONE = await ethers.getContractFactory("OZONE");
    ozoneToken = await OZONE.deploy(treasury.address);
    await ozoneToken.waitForDeployment();
    
    // Deploy mock reward token (using OZONE as reward token for testing)
    rewardToken = ozoneToken; // For simplicity in testing
    
    // Deploy staking contract
    const OzoneStaking = await ethers.getContractFactory("OzoneStaking");
    ozoneStaking = await OzoneStaking.deploy(ozoneToken.target, rewardToken.target);
    await ozoneStaking.waitForDeployment();
    
    // Set tax exemption for staking contract
    await ozoneToken.setTaxExemption(ozoneStaking.target, true);
    
    // Transfer some tokens to users for testing
    const transferAmount = ethers.parseEther("10000");
    await ozoneToken.transfer(user1.address, transferAmount);
    await ozoneToken.transfer(user2.address, transferAmount);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ozoneStaking.owner()).to.equal(owner.address);
    });

    it("Should set token addresses correctly", async function () {
      expect(await ozoneStaking.ozoneToken()).to.equal(ozoneToken.target);
      expect(await ozoneStaking.rewardToken()).to.equal(rewardToken.target);
    });
  });

  describe("Pool Management", function () {
    it("Should allow admin to create pool", async function () {
      const apy = 1000; // 10%
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days
      const minStake = ethers.parseEther("100");
      
      await ozoneStaking.createPool(apy, lockPeriod, minStake);
      
      const pool = await ozoneStaking.getPoolInfo(0);
      expect(pool.apy).to.equal(apy);
      expect(pool.lockPeriod).to.equal(lockPeriod);
      expect(pool.minStake).to.equal(minStake);
      expect(pool.active).to.equal(true);
    });

    it("Should allow admin to update pool", async function () {
      const apy = 1000;
      const lockPeriod = 30 * 24 * 60 * 60;
      const minStake = ethers.parseEther("100");
      
      await ozoneStaking.createPool(apy, lockPeriod, minStake);
      
      const newApy = 1500; // 15%
      await ozoneStaking.updatePool(0, newApy, lockPeriod, minStake, true);
      
      const pool = await ozoneStaking.getPoolInfo(0);
      expect(pool.apy).to.equal(newApy);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Create a test pool
      const apy = 1000; // 10%
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days
      const minStake = ethers.parseEther("100");
      await ozoneStaking.createPool(apy, lockPeriod, minStake);
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("500");
      
      // Approve staking contract
      await ozoneToken.connect(user1).approve(ozoneStaking.target, stakeAmount);
      
      // Stake tokens
      await ozoneStaking.connect(user1).stake(0, stakeAmount);
      
      const userStakes = await ozoneStaking.getUserStakes(user1.address);
      expect(userStakes.length).to.equal(1);
      expect(userStakes[0].amount).to.equal(stakeAmount);
      expect(userStakes[0].poolId).to.equal(0);
      
      const totalStaked = await ozoneStaking.getTotalStaked();
      expect(totalStaked).to.equal(stakeAmount);
    });

    it("Should reject stakes below minimum", async function () {
      const stakeAmount = ethers.parseEther("50"); // Below 100 minimum
      
      await ozoneToken.connect(user1).approve(ozoneStaking.target, stakeAmount);
      
      await expect(
        ozoneStaking.connect(user1).stake(0, stakeAmount)
      ).to.be.revertedWith("Below min stake");
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      // Create a test pool
      const apy = 1000; // 10%
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days
      const minStake = ethers.parseEther("100");
      await ozoneStaking.createPool(apy, lockPeriod, minStake);
      
      // Deposit rewards to contract (approve first)
      const rewardAmount = ethers.parseEther("1000");
      await ozoneToken.approve(ozoneStaking.target, rewardAmount);
      await ozoneStaking.depositRewards(rewardAmount);
    });

    it("Should calculate pending rewards correctly", async function () {
      const stakeAmount = ethers.parseEther("1000");
      
      await ozoneToken.connect(user1).approve(ozoneStaking.target, stakeAmount);
      await ozoneStaking.connect(user1).stake(0, stakeAmount);
      
      // Fast forward time (simulate 365 days)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const pendingReward = await ozoneStaking.pendingReward(user1.address, 0);
      const expectedReward = ethers.parseEther("100"); // 10% of 1000
      
      expect(pendingReward).to.be.closeTo(expectedReward, ethers.parseEther("1"));
    });
  });
});
