// OZONE Token ABI (essential functions only)
export const OZONE_ABI = [
  // ERC20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // OZONE Specific
  "function treasuryWallet() view returns (address)",
  "function isExemptFromTax(address account) view returns (bool)",
  "function calculateTax(uint256 amount) view returns (uint256)",
  "function getTransferAmount(uint256 amount, address from, address to) view returns (uint256 transferAmount, uint256 taxAmount)",
  
  // Owner functions
  "function mint(address to, uint256 amount)",
  "function setTaxExemption(address account, bool exempt)",
  "function setTreasuryWallet(address newTreasuryWallet)",
  "function pause()",
  "function unpause()",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TaxCollected(address indexed from, address indexed to, uint256 taxAmount)",
  "event TreasuryWalletUpdated(address indexed oldWallet, address indexed newWallet)",
  "event TaxExemptionUpdated(address indexed account, bool isExempt)",
];
