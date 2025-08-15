/**
 * Utility to check OZONE token balance via BSCScan API
 */

const BSCSCAN_API_KEY = 'YourAPIKeyHere'; // You can get free API key from bscscan.com
const OZONE_CONTRACT = '0x8aE086CA4E4e24b616409c69Bd2bbFe7262AEe59';
const ADMIN_WALLET = '0x5ACb28365aF47A453a14FeDD5f72cE502224F30B';

async function checkOzoneBalance() {
  try {
    // Check balance via BSCScan API
    const url = `https://api-testnet.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${OZONE_CONTRACT}&address=${ADMIN_WALLET}&tag=latest&apikey=${BSCSCAN_API_KEY}`;
    
    console.log('🔍 Checking balance via BSCScan API...');
    console.log('📍 Contract:', OZONE_CONTRACT);
    console.log('📍 Wallet:', ADMIN_WALLET);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 API Response:', data);
    
    if (data.status === '1') {
      const balanceWei = data.result;
      const balanceTokens = parseInt(balanceWei) / Math.pow(10, 18); // Assuming 18 decimals
      
      console.log('💰 Balance (Wei):', balanceWei);
      console.log('💰 Balance (Tokens):', balanceTokens);
      
      return {
        wei: balanceWei,
        tokens: balanceTokens
      };
    } else {
      console.error('❌ API Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    return null;
  }
}

// Alternative: Check if admin wallet has BNB for gas
async function checkBNBBalance() {
  try {
    const url = `https://api-testnet.bscscan.com/api?module=account&action=balance&address=${ADMIN_WALLET}&tag=latest&apikey=${BSCSCAN_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('🔍 BNB Balance Response:', data);
    
    if (data.status === '1') {
      const balanceBNB = parseInt(data.result) / Math.pow(10, 18);
      console.log('💰 BNB Balance:', balanceBNB);
      return balanceBNB;
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Error checking BNB balance:', error);
    return 0;
  }
}

// Manual test function - call from browser console
window.testBalance = async function() {
  console.log('🧪 Testing OZONE balance...');
  await checkOzoneBalance();
  await checkBNBBalance();
};

// Export for use in other modules
export { checkOzoneBalance, checkBNBBalance, OZONE_CONTRACT, ADMIN_WALLET };
