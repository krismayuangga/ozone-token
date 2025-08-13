const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OZONE Token", function () {
  let ozoneToken;
  let owner;
  let treasury;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();
    
    const OZONE = await ethers.getContractFactory("OZONE");
    ozoneToken = await OZONE.deploy(treasury.address);
    await ozoneToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ozoneToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await ozoneToken.balanceOf(owner.address);
      expect(await ozoneToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set treasury wallet correctly", async function () {
      expect(await ozoneToken.treasuryWallet()).to.equal(treasury.address);
    });

    it("Should exempt treasury and owner from tax", async function () {
      expect(await ozoneToken.isExemptFromTax(treasury.address)).to.equal(true);
      expect(await ozoneToken.isExemptFromTax(owner.address)).to.equal(true);
    });
  });

  describe("Tax System", function () {
    it("Should apply 1% tax on transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      const expectedTax = ethers.parseEther("10"); // 1% of 1000
      const expectedTransfer = ethers.parseEther("990"); // 1000 - 10

      // First transfer some tokens to user1 (owner is tax exempt)
      await ozoneToken.transfer(user1.address, transferAmount);
      
      const initialTreasuryBalance = await ozoneToken.balanceOf(treasury.address);
      
      // Transfer from user1 to user2 (should apply tax)
      await ozoneToken.connect(user1).transfer(user2.address, transferAmount);
      
      const finalTreasuryBalance = await ozoneToken.balanceOf(treasury.address);
      const user2Balance = await ozoneToken.balanceOf(user2.address);
      
      expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(expectedTax);
      expect(user2Balance).to.equal(expectedTransfer);
    });

    it("Should not apply tax for exempt addresses", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      // Transfer from owner (exempt) to user1
      await ozoneToken.transfer(user1.address, transferAmount);
      
      const user1Balance = await ozoneToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(transferAmount);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialSupply = await ozoneToken.totalSupply();
      
      await ozoneToken.mint(user1.address, mintAmount);
      
      const finalSupply = await ozoneToken.totalSupply();
      const user1Balance = await ozoneToken.balanceOf(user1.address);
      
      expect(finalSupply).to.equal(initialSupply + mintAmount);
      expect(user1Balance).to.equal(mintAmount);
    });

    it("Should allow owner to set tax exemption", async function () {
      expect(await ozoneToken.isExemptFromTax(user1.address)).to.equal(false);
      
      await ozoneToken.setTaxExemption(user1.address, true);
      
      expect(await ozoneToken.isExemptFromTax(user1.address)).to.equal(true);
    });
  });
});
