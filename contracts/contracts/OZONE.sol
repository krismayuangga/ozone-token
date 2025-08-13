// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OZONE is ERC20, Ownable, Pausable {
    uint256 public constant TAX_RATE = 100; // 1% = 100 basis points
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant TOTAL_SUPPLY = 1000000000 * 10**18; // Fixed 1 billion tokens
    
    address public treasuryWallet;
    
    mapping(address => bool) public isExemptFromTax;
    
    // Events
    event TaxCollected(address indexed from, address indexed to, uint256 taxAmount);
    event TreasuryWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event TaxExemptionUpdated(address indexed account, bool isExempt);
    
    constructor(
        address _treasuryWallet
    ) ERC20("OZONE", "OZONE") Ownable(msg.sender) {
        require(_treasuryWallet != address(0), "Treasury wallet cannot be zero");
        
        treasuryWallet = _treasuryWallet;
        
        // Mint fixed total supply to owner (no more minting allowed after this)
        _mint(msg.sender, TOTAL_SUPPLY);
        
        // Exempt treasury and owner from tax
        isExemptFromTax[_treasuryWallet] = true;
        isExemptFromTax[msg.sender] = true;
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        _transferWithTax(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transferWithTax(from, to, amount);
        return true;
    }
    
    function _transferWithTax(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        
        if (isExemptFromTax[from] || isExemptFromTax[to] || from == address(this)) {
            // No tax for exempt addresses
            _transfer(from, to, amount);
        } else {
            // Calculate tax
            uint256 taxAmount = (amount * TAX_RATE) / BASIS_POINTS;
            uint256 transferAmount = amount - taxAmount;
            
            // Transfer tax to treasury
            if (taxAmount > 0) {
                _transfer(from, treasuryWallet, taxAmount);
                emit TaxCollected(from, to, taxAmount);
            }
            
            // Transfer remaining amount
            _transfer(from, to, transferAmount);
        }
    }
    
    // Admin functions
    function setTreasuryWallet(address _newTreasuryWallet) external onlyOwner {
        require(_newTreasuryWallet != address(0), "Treasury wallet cannot be zero");
        address oldWallet = treasuryWallet;
        treasuryWallet = _newTreasuryWallet;
        
        // Update tax exemption
        isExemptFromTax[oldWallet] = false;
        isExemptFromTax[_newTreasuryWallet] = true;
        
        emit TreasuryWalletUpdated(oldWallet, _newTreasuryWallet);
    }
    
    function setTaxExemption(address account, bool exempt) external onlyOwner {
        isExemptFromTax[account] = exempt;
        emit TaxExemptionUpdated(account, exempt);
    }
    
    // NOTE: No mint function - Total supply is FIXED at 1 billion OZONE tokens
    // This ensures controlled tokenomics and prevents inflation
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
    
    // View functions
    function calculateTax(uint256 amount) external pure returns (uint256) {
        return (amount * TAX_RATE) / BASIS_POINTS;
    }
    
    function getTransferAmount(uint256 amount, address from, address to) external view returns (uint256 transferAmount, uint256 taxAmount) {
        if (isExemptFromTax[from] || isExemptFromTax[to]) {
            return (amount, 0);
        }
        
        taxAmount = (amount * TAX_RATE) / BASIS_POINTS;
        transferAmount = amount - taxAmount;
        
        return (transferAmount, taxAmount);
    }
    
    function getFixedTotalSupply() external pure returns (uint256) {
        return TOTAL_SUPPLY;
    }
    
    function getRemainingSupply() external view returns (uint256) {
        return TOTAL_SUPPLY - totalSupply();
    }
}
