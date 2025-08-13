const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting OZONE Token & Staking Contract Deployment...\n");

  // Get deployment configuration
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("Block Number:", await ethers.provider.getBlockNumber());
  console.log("─".repeat(50));

  // Token configuration
  const TOKEN_NAME = process.env.TOKEN_NAME || "OZONE";
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "OZONE";
  const INITIAL_SUPPLY = process.env.INITIAL_SUPPLY || "1000000000"; // 1 billion
  const TRANSACTION_TAX = process.env.TRANSACTION_TAX || "100"; // 1%
  const TAX_RECIPIENT = process.env.TAX_RECIPIENT || deployer.address;

  console.log("🪙 Token Configuration:");
  console.log("Name:", TOKEN_NAME);
  console.log("Symbol:", TOKEN_SYMBOL);
  console.log("Initial Supply:", INITIAL_SUPPLY, "tokens");
  console.log("Transaction Tax:", (parseInt(TRANSACTION_TAX) / 100).toFixed(2), "%");
  console.log("Tax Recipient:", TAX_RECIPIENT);
  console.log("─".repeat(50));

  // Deploy OZONE Token
  console.log("📦 Deploying OZONE Token...");
  const OzoneToken = await ethers.getContractFactory("OZONE");
  
  const ozoneToken = await OzoneToken.deploy(TAX_RECIPIENT);
  await ozoneToken.waitForDeployment();
  const ozoneAddress = await ozoneToken.getAddress();
  
  console.log("✅ OZONE Token deployed!");
  console.log("Contract address:", ozoneAddress);
  console.log("Transaction hash:", ozoneToken.deploymentTransaction().hash);
  
  // Wait for a few blocks
  console.log("⏳ Waiting for block confirmations...");
  await ozoneToken.deploymentTransaction().wait(2);

  // Deploy OzoneStaking Contract
  console.log("\n📦 Deploying OzoneStaking Contract...");
  const OzoneStaking = await ethers.getContractFactory("OzoneStaking");
  
  const ozoneStaking = await OzoneStaking.deploy(ozoneAddress, ozoneAddress); // Use OZONE as reward token
  await ozoneStaking.waitForDeployment();
  const stakingAddress = await ozoneStaking.getAddress();
  
  console.log("✅ OzoneStaking Contract deployed!");
  console.log("Contract address:", stakingAddress);
  console.log("Transaction hash:", ozoneStaking.deploymentTransaction().hash);
  
  // Wait for confirmations
  await ozoneStaking.deploymentTransaction().wait(2);

  // Set tax exemption for staking contract
  console.log("\n⚙️ Setting up tax exemption...");
  const exemptionTx = await ozoneToken.setTaxExemption(stakingAddress, true);
  await exemptionTx.wait();
  console.log("✅ Tax exemption set for staking contract");

  // Verify deployment
  console.log("\n🔍 Verifying deployments...");
  
  // Check token details
  const tokenName = await ozoneToken.name();
  const tokenSymbol = await ozoneToken.symbol();
  const tokenSupply = await ozoneToken.totalSupply();
  const tokenDecimals = await ozoneToken.decimals();
  
  console.log("Token verification:");
  console.log("- Name:", tokenName);
  console.log("- Symbol:", tokenSymbol);
  console.log("- Total Supply:", ethers.formatUnits(tokenSupply, tokenDecimals));
  console.log("- Decimals:", tokenDecimals.toString());
  
  // Check staking contract
  const stakingToken = await ozoneStaking.token();
  console.log("Staking contract verification:");
  console.log("- Token address matches:", stakingToken.toLowerCase() === ozoneAddress.toLowerCase());
  console.log("- Owner:", await ozoneStaking.owner());

  // Transfer some tokens to staking contract for rewards
  console.log("\n💰 Setting up initial rewards...");
  const rewardAmount = ethers.parseUnits("10000000", tokenDecimals); // 10M tokens
  const transferTx = await ozoneToken.transfer(stakingAddress, rewardAmount);
  await transferTx.wait();
  
  console.log("✅ Transferred", ethers.formatUnits(rewardAmount, tokenDecimals), "OZONE to staking contract for rewards");

  // Create initial pools
  console.log("\n🏊 Creating initial mining pools...");
  
  const pools = [
    { name: "Nikel Starter Pool", apy: 7500, lockPeriod: 30, minStake: "1000" },      // 75% APY, 30 days
    { name: "Nikel Premium Pool", apy: 12000, lockPeriod: 60, minStake: "10000" },   // 120% APY, 60 days  
    { name: "Platinum Mining Pool", apy: 20000, lockPeriod: 90, minStake: "25000" }, // 200% APY, 90 days
  ];

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lockPeriodSeconds = pool.lockPeriod * 24 * 60 * 60;
    const minStakeWei = ethers.parseUnits(pool.minStake, tokenDecimals);
    
    console.log(`Creating ${pool.name}...`);
    const createTx = await ozoneStaking.createPool(pool.apy, lockPeriodSeconds, minStakeWei);
    await createTx.wait();
    console.log(`✅ ${pool.name} created - APY: ${pool.apy/100}%, Lock: ${pool.lockPeriod} days, Min: ${pool.minStake} OZONE`);
  }

  // Create deployment artifacts
  const deploymentData = {
    network: hre.network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    contracts: {
      OZONE: {
        address: ozoneAddress,
        transactionHash: ozoneToken.deploymentTransaction().hash,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: Number(tokenDecimals),
        totalSupply: ethers.formatUnits(tokenSupply, tokenDecimals)
      },
      OzoneStaking: {
        address: stakingAddress,
        transactionHash: ozoneStaking.deploymentTransaction().hash,
        tokenAddress: ozoneAddress
      }
    },
    configuration: {
      tokenName: TOKEN_NAME,
      tokenSymbol: TOKEN_SYMBOL,
      initialSupply: INITIAL_SUPPLY,
      transactionTax: TRANSACTION_TAX,
      taxRecipient: TAX_RECIPIENT
    }
  };

  // Save deployment data
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  
  console.log("\n📄 Deployment artifacts saved to:", deploymentFile);

  // Generate frontend constants
  const frontendConstantsDir = path.join(__dirname, '..', '..', 'web', 'src', 'constants');
  if (!fs.existsSync(frontendConstantsDir)) {
    fs.mkdirSync(frontendConstantsDir, { recursive: true });
  }

  const contractConstants = `// Auto-generated deployment constants
// Generated on: ${new Date().toISOString()}
// Network: ${hre.network.name}
// Chain ID: ${Number((await ethers.provider.getNetwork()).chainId)}

export const CONTRACTS = {
  OZONE: {
    address: "${ozoneAddress}",
    name: "${tokenName}",
    symbol: "${tokenSymbol}",
    decimals: ${tokenDecimals}
  },
  OZONE_STAKING: {
    address: "${stakingAddress}",
    tokenAddress: "${ozoneAddress}"
  }
};

export const NETWORK_CONFIG = {
  chainId: ${Number((await ethers.provider.getNetwork()).chainId)},
  name: "${hre.network.name}",
  rpcUrl: "${ethers.provider._getConnection().url || 'localhost'}"
};

export const DEPLOYMENT_INFO = {
  deployer: "${deployer.address}",
  timestamp: "${new Date().toISOString()}",
  blockNumber: ${await ethers.provider.getBlockNumber()}
};
`;

  const constantsFile = path.join(frontendConstantsDir, 'contracts.js');
  fs.writeFileSync(constantsFile, contractConstants);
  
  console.log("📄 Frontend constants generated:", constantsFile);

  // Summary
  console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉");
  console.log("─".repeat(50));
  console.log("📋 Contract Addresses:");
  console.log("OZONE Token:", ozoneAddress);
  console.log("OzoneStaking:", stakingAddress);
  console.log("─".repeat(50));
  console.log("🔗 Network Info:");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", Number((await ethers.provider.getNetwork()).chainId));
  console.log("Deployer:", deployer.address);
  console.log("─".repeat(50));
  console.log("📝 Next Steps:");
  console.log("1. Update frontend with new contract addresses");
  console.log("2. Verify contracts on BSCScan (if on mainnet/testnet)");
  console.log("3. Add liquidity to DEX (if needed)");
  console.log("4. Test staking functionality");
  console.log("─".repeat(50));

  // If on testnet/mainnet, provide verification commands
  if (hre.network.name === 'bscTestnet' || hre.network.name === 'bsc') {
    console.log("🔍 Contract Verification Commands:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${ozoneAddress} "${TAX_RECIPIENT}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${stakingAddress} ${ozoneAddress} ${ozoneAddress}`);
    console.log("─".repeat(50));
  }

  return {
    ozoneToken: ozoneAddress,
    ozoneStaking: stakingAddress,
    deployer: deployer.address,
    network: hre.network.name
  };
}

// Error handling
main()
  .then((result) => {
    console.log("✅ Deployment script completed successfully");
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exitCode = 1;
  });
