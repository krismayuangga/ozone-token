// Contract addresses (updated with BSC Testnet deployment)
export const CONTRACT_ADDRESSES = {
  OZONE: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Local deployment
  OZONE_STAKING: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Local deployment
  
  // BSC Testnet (LIVE DEPLOYMENT)
  BSC_TESTNET: {
    OZONE: "0x8aE086CA4E4e24b616409c69Bd2bbFe7262AEe59",
    OZONE_STAKING: "0x6CbDdD8BD2072263291ddfF8d5760c36fDA08A26",
  },
  
  // BSC Mainnet (update when deployed)
  BSC_MAINNET: {
    OZONE: "",
    OZONE_STAKING: "",
  }
};

// Network configurations
export const NETWORKS = {
  LOCALHOST: {
    chainId: "0x539", // 1337 in hex
    chainName: "Localhost 8545",
    rpcUrls: ["http://127.0.0.1:8545"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
  BSC_TESTNET: {
    chainId: "0x61", // 97 in hex
    chainName: "BSC Testnet",
    rpcUrls: [
      "https://bsc-testnet.publicnode.com",
      "https://bsc-testnet-rpc.publicnode.com",
      "https://endpoints.omniatech.io/v1/bsc/testnet/public",
      "https://data-seed-prebsc-1-s1.binance.org:8545/",
      "https://data-seed-prebsc-2-s1.binance.org:8545/"
    ],
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
  },
  BSC_MAINNET: {
    chainId: "0x38", // 56 in hex
    chainName: "BSC Mainnet",
    rpcUrls: ["https://bsc-dataseed1.binance.org/"],
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorerUrls: ["https://bscscan.com/"],
  },
};
