# 🚀 OZONE Smart Contract Deployment Guide

## ✅ Status Deployment

### ✅ Local Hardhat Network (COMPLETED)
- **OZONE Token**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **OzoneStaking**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Total Supply**: 1,000,000,000 OZONE (FIXED)
- **Features**: Tax system (1%), Treasury wallet, Fixed supply (no mint function)

## 🧪 BSC Testnet Deployment

### Prerequisites:
1. **MetaMask Wallet** dengan BSC Testnet network
2. **Testnet BNB** dari [BSC Faucet](https://testnet.binance.org/faucet-smart)
3. **Private Key** dari wallet deployment

### Setup Steps:

#### 1. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file dengan:
# - PRIVATE_KEY: Private key wallet Anda (tanpa 0x)
# - BSCSCAN_API_KEY: API key dari BSCScan (optional)
```

#### 2. Get Testnet BNB
- Visit: https://testnet.binance.org/faucet-smart
- Request BNB untuk wallet address Anda
- Minimal 0.1 BNB untuk gas fees

#### 3. Deploy to BSC Testnet
```bash
npm run deploy:testnet
```

#### 4. Add to MetaMask
Setelah deployment berhasil, tambahkan token ke MetaMask:
- **Token Address**: [Dari hasil deployment]
- **Symbol**: OZONE
- **Decimals**: 18

### Network Configuration (BSC Testnet)
- **Network Name**: BSC Testnet
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Chain ID**: 97
- **Symbol**: BNB
- **Block Explorer**: https://testnet.bscscan.com

## 🌟 Features Implemented

### OZONE Token
- ✅ **Fixed Total Supply**: 1 billion tokens (no inflation)
- ✅ **1% Tax System**: Automatic tax on transfers
- ✅ **Treasury System**: Tax goes to designated wallet
- ✅ **Tax Exemption**: Owner and treasury exempt
- ✅ **Pausable**: Emergency pause functionality
- ✅ **Ownable**: Administrative controls

### OzoneStaking Contract
- ✅ **Multi-Pool System**: Different APY and lock periods
- ✅ **Flexible Rewards**: OZONE token rewards
- ✅ **Admin Controls**: Create/update pools
- ✅ **Secure Staking**: ReentrancyGuard protection
- ✅ **Pool Statistics**: Track total staked per pool

## 🔗 Integration dengan Frontend

File konfigurasi sudah di-generate otomatis:
- **Location**: `../web/src/config/contracts.json`
- **Contains**: Contract addresses dan network info
- **Auto-updated**: Setiap deployment

## 🛡️ Security Features

1. **Fixed Supply**: Tidak ada fungsi mint setelah initial deployment
2. **ReentrancyGuard**: Proteksi dari reentrancy attacks  
3. **Access Control**: Owner-only administrative functions
4. **Input Validation**: Semua parameter di-validate
5. **Emergency Controls**: Pause/unpause functionality

## 📊 Pool Configuration

### Default Test Pools:
1. **Starter Pool**
   - APY: 75%
   - Lock Period: 30 days
   - Min Stake: 1,000 OZONE

2. **Premium Pool**  
   - APY: 120%
   - Lock Period: 60 days
   - Min Stake: 10,000 OZONE

### Custom Pool Creation:
Admin dapat membuat pool baru melalui:
- Smart contract functions
- Admin dashboard di frontend
- Custom deployment scripts

## 🔄 Next Steps

1. **Deploy to BSC Testnet**: Untuk public testing
2. **Frontend Integration**: Connect dengan deployed contracts
3. **User Testing**: Test staking flow dengan real users
4. **Security Audit**: Review code sebelum mainnet
5. **Mainnet Deployment**: Production deployment

## 🆘 Troubleshooting

### Common Issues:
1. **Insufficient BNB**: Get more testnet BNB dari faucet
2. **Private Key Error**: Pastikan format tanpa 0x prefix
3. **Network Issues**: Cek RPC URL dan chain ID
4. **Gas Estimation**: Increase gas limit jika diperlukan

### Support:
Jika ada masalah deployment, cek:
1. Terminal output untuk error details
2. File `deployments/[network]-deployment.json`
3. Hardhat console untuk debugging
