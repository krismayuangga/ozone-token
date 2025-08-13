require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_URL || "https://bsc-testnet.publicnode.com",
      chainId: 97,
      gasPrice: parseInt(process.env.GAS_PRICE) || 20000000000, // 20 gwei for testnet
      gas: parseInt(process.env.GAS_LIMIT) || 6000000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000
    },
    bsc: {
      url: process.env.BSC_MAINNET_URL || "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      gasPrice: parseInt(process.env.GAS_PRICE) || 3000000000, // 3 gwei
      gas: parseInt(process.env.GAS_LIMIT) || 8000000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY
    }
  },
  mocha: {
    timeout: 200000
  }
};
