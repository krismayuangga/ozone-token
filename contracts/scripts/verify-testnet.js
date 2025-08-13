const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying OZONE contracts on BSCScan Testnet...\n");

  const ozoneAddress = "0x7B4a5fCe9223548BF99b87ee880867a706a6d087";
  const stakingAddress = "0xB501ba320cA9e231EDb0179D89B1033c81098D14";
  const deployerAddress = "0x5ACb28365aF47A453a14FeDD5f72cE502224F30B";

  try {
    // Verify OZONE Token
    console.log("🪙 Verifying OZONE Token...");
    await hre.run("verify:verify", {
      address: ozoneAddress,
      constructorArguments: [deployerAddress]
    });
    console.log(`✅ OZONE Token verified: https://testnet.bscscan.com/address/${ozoneAddress}`);

    // Verify OzoneStaking Contract
    console.log("\n🏦 Verifying OzoneStaking Contract...");
    await hre.run("verify:verify", {
      address: stakingAddress,
      constructorArguments: [ozoneAddress, ozoneAddress]
    });
    console.log(`✅ OzoneStaking verified: https://testnet.bscscan.com/address/${stakingAddress}`);

    console.log("\n🎉 All contracts verified successfully!");
    console.log("\n📋 Verification Links:");
    console.log(`OZONE Token: https://testnet.bscscan.com/address/${ozoneAddress}#code`);
    console.log(`OzoneStaking: https://testnet.bscscan.com/address/${stakingAddress}#code`);

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    if (error.message.includes("already verified")) {
      console.log("ℹ️  Contracts may already be verified");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
