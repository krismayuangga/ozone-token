const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting OZONE Smart Contract Deployment...\n");

  // Get network info
  const network = hre.network.name;
  console.log(`📡 Deploying to network: ${network}`);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ${network === 'hardhat' ? 'ETH' : 'BNB'}\n`);

  try {
    // 1. Deploy OZONE Token
    console.log("⛏️  Deploying OZONE Token...");
    const OZONE = await hre.ethers.getContractFactory("OZONE");
    // Use deployer address as treasury wallet
    const ozoneToken = await OZONE.deploy(deployer.address);
    await ozoneToken.waitForDeployment();
    
    const ozoneAddress = await ozoneToken.getAddress();
    console.log(`✅ OZONE Token deployed to: ${ozoneAddress}`);
    
    // Verify token deployment
    const tokenName = await ozoneToken.name();
    const tokenSymbol = await ozoneToken.symbol();
    const totalSupply = await ozoneToken.totalSupply();
    console.log(`   📊 Name: ${tokenName}`);
    console.log(`   🔖 Symbol: ${tokenSymbol}`);
    console.log(`   💎 Total Supply: ${hre.ethers.formatEther(totalSupply)} OZONE\n`);

    // 2. Deploy OzoneStaking Contract
    console.log("🏦 Deploying OzoneStaking Contract...");
    const OzoneStaking = await hre.ethers.getContractFactory("OzoneStaking");
    // OzoneStaking constructor only takes OZONE token address
    const ozoneStaking = await OzoneStaking.deploy(ozoneAddress);
    await ozoneStaking.waitForDeployment();
    
    const stakingAddress = await ozoneStaking.getAddress();
    console.log(`✅ OzoneStaking Contract deployed to: ${stakingAddress}\n`);

    // 3. Setup initial configuration (NO AUTO REWARD TRANSFER)
    console.log("⚙️  Setting up initial configuration...");
    console.log("ℹ️  Skipping auto reward transfer - Admin will manage rewards via dashboard");
    
    // Verify token deployment
    const deployerBalance = await ozoneToken.balanceOf(deployer.address);
    console.log(`✅ Full token supply remains with deployer: ${hre.ethers.formatEther(deployerBalance)} OZONE`);

    // Create initial test pools if on local network (NO REWARD TRANSFER)
    if (network === 'hardhat' || network === 'localhost') {
      console.log("\n🏊 Creating initial test pools (rewards will be managed by admin)...");
      
      // Pool 1: Starter Pool - 75% APY, 30 days lock
      const pool1Tx = await ozoneStaking.createPool(
        7500, // 75% APY (in basis points)
        30 * 24 * 60 * 60, // 30 days in seconds
        hre.ethers.parseEther("1000") // 1000 OZONE minimum
      );
      await pool1Tx.wait();
      console.log("✅ Created Pool #0: Starter Pool (75% APY, 30 days) - No rewards allocated yet");
      
      // Pool 2: Premium Pool - 120% APY, 60 days lock
      const pool2Tx = await ozoneStaking.createPool(
        12000, // 120% APY
        60 * 24 * 60 * 60, // 60 days
        hre.ethers.parseEther("10000") // 10000 OZONE minimum
      );
      await pool2Tx.wait();
      console.log("✅ Created Pool #1: Premium Pool (120% APY, 60 days) - No rewards allocated yet");
      
      console.log("\n💡 Use Admin Dashboard to:");
      console.log("   - Configure reward tokens for each pool");
      console.log("   - Transfer rewards as needed");
      console.log("   - Set different reward tokens (OZONE, USDT, BNB, etc.)");
    }

    // 4. Save deployment info
    const deploymentInfo = {
      network: network,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        OZONE: {
          address: ozoneAddress,
          name: tokenName,
          symbol: tokenSymbol,
          totalSupply: totalSupply.toString()
        },
        OzoneStaking: {
          address: stakingAddress,
          tokenAddress: ozoneAddress
        }
      },
      gasUsed: {
        ozoneToken: "Estimated",
        ozoneStaking: "Estimated"
      }
    };

    // Save to file
    const deploymentDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentDir, `${network}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

    // 5. Generate frontend config
    const frontendConfig = {
      contracts: {
        OZONE: ozoneAddress,
        OzoneStaking: stakingAddress
      },
      network: {
        name: network,
        chainId: network === 'bscTestnet' ? 97 : network === 'bsc' ? 56 : 31337
      }
    };

    const frontendConfigPath = path.join(__dirname, '..', '..', 'web', 'src', 'config', 'contracts.json');
    const configDir = path.dirname(frontendConfigPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
    
    console.log(`📱 Frontend config generated: ${frontendConfigPath}`);

    // 6. Summary
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=" * 50);
    console.log(`📍 Network: ${network}`);
    console.log(`⛏️  OZONE Token: ${ozoneAddress}`);
    console.log(`🏦 OzoneStaking: ${stakingAddress}`);
    console.log(`👤 Deployer: ${deployer.address}`);
    
    if (network === 'bscTestnet') {
      console.log("\n📋 Next Steps:");
      console.log("1. Add BSC Testnet to MetaMask");
      console.log("2. Get testnet BNB from faucet");
      console.log("3. Import OZONE token to MetaMask");
      console.log(`   - Token Address: ${ozoneAddress}`);
      console.log("4. Access Admin Dashboard to configure rewards");
      console.log("5. Allocate rewards per pool as needed");
      console.log("6. Test the application!");
      console.log("\n💰 Token Supply Management:");
      console.log(`   - Total Supply: 1 Billion OZONE (100% circulating)`);
      console.log(`   - Admin Wallet: ${deployer.address}`);
      console.log(`   - Reward Allocation: Managed via Admin Dashboard`);
    }

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
