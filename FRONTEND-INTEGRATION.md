# Ozone Staking - Frontend Integration Guide

## 🚀 Quick Start

### Development Setup
```bash
# Run both backend and frontend
dev-start.bat

# Or manually:
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
cd web
npm start
```

## 📋 Integration Status

### ✅ Completed Features

#### Backend API Integration
- **API Service**: Complete REST API client (`src/services/api.js`)
- **React Hooks**: Custom hooks for data management (`src/hooks/useApi.js`)
- **Authentication**: Wallet-based auth with JWT tokens
- **Real-time Updates**: WebSocket integration ready

#### Updated Components
- **UnifiedUserDashboard_Backend.js**: New backend-integrated dashboard
- **Environment Config**: API endpoints and settings (`.env`)
- **Error Handling**: Comprehensive error management and notifications

#### API Endpoints Integration
- ✅ Authentication: `/auth/connect`, `/auth/me`, `/auth/logout`
- ✅ Pools: `/pools`, `/pools/:id`, `/pools/:id/stats`
- ✅ User Management: `/user/stats`, `/user/stakes`, `/user/transactions`
- ✅ Staking: `/stakes/active`, `/stakes/:id/unstake`
- ✅ Admin: `/admin/dashboard`, `/admin/users`, `/admin/stats`

### 🔄 Migration Steps

#### 1. Replace Old Components
```bash
# Backup current component
mv src/components/UnifiedUserDashboard.js src/components/UnifiedUserDashboard_OLD.js

# Use new backend-integrated component
mv src/components/UnifiedUserDashboard_Backend.js src/components/UnifiedUserDashboard.js
```

#### 2. Update Dependencies
```bash
cd web
npm install  # Install any missing packages
```

#### 3. Environment Configuration
- Update `.env` file with correct API URLs
- Configure blockchain contract addresses
- Set development/production flags

## 🔧 Component Architecture

### API Service Layer
```javascript
// src/services/api.js
import apiService from '../services/api';

// Authentication
await apiService.connectWallet(address, signature, message);
const user = await apiService.getCurrentUser();

// Data fetching
const pools = await apiService.getPools();
const stakes = await apiService.getUserStakes();
```

### React Hooks Integration
```javascript
// src/hooks/useApi.js
import { useAuth, usePools, useUserStakes } from '../hooks/useApi';

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { pools, loading, refetch } = usePools();
  const { stakes, unstake } = useUserStakes();
}
```

### Component Features
```javascript
// Key features in UnifiedUserDashboard
- Wallet connection with backend auth
- Real-time data synchronization
- Staking pool management
- User stake tracking
- Transaction history
- Admin functionality
- Mobile-responsive design
```

## 🎯 User Flow

### 1. Wallet Connection
```
User clicks "Connect Wallet" 
  ↓
MetaMask/WalletConnect opens
  ↓
User approves connection
  ↓
Frontend gets nonce from backend
  ↓
User signs authentication message
  ↓
Backend verifies signature & creates JWT
  ↓
Frontend stores token & loads user data
```

### 2. Staking Process
```
User selects staking pool
  ↓
Enters stake amount
  ↓
Confirms transaction in wallet
  ↓
Smart contract processes stake
  ↓
Backend indexes blockchain event
  ↓
Frontend updates user balance & stakes
```

### 3. Data Synchronization
```
Frontend requests data from API
  ↓
Backend queries MySQL database
  ↓
Real-time updates via WebSocket
  ↓
UI updates automatically
```

## 🔐 Authentication Flow

### Wallet Authentication
```javascript
// 1. Get signing nonce
const nonceResponse = await apiService.getNonce(walletAddress);

// 2. Sign message with wallet
const signature = await signer.signMessage(nonceResponse.data.message);

// 3. Authenticate with backend
const authResponse = await apiService.connectWallet(
  walletAddress, 
  signature, 
  nonceResponse.data.message
);

// 4. Store JWT token
localStorage.setItem('authToken', authResponse.data.token);
```

### Protected Routes
```javascript
// Automatic token validation
const { user, isAuthenticated, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!isAuthenticated) return <ConnectWallet />;
return <Dashboard />;
```

## 📊 Data Management

### State Management
- **Local State**: Component-specific UI state
- **API State**: Server data via custom hooks
- **Global State**: Authentication & user info
- **Real-time**: WebSocket updates

### Error Handling
```javascript
try {
  const result = await apiService.getUserStakes();
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired - redirect to login
    logout();
  } else {
    // Show error message
    showSnackbar('Error: ' + error.message, 'error');
  }
}
```

### Loading States
```javascript
const { stakes, loading, error, refetch } = useUserStakes();

if (loading) return <CircularProgress />;
if (error) return <Alert severity="error">{error}</Alert>;
if (!stakes.length) return <Alert severity="info">No stakes found</Alert>;
```

## 🎨 UI/UX Features

### Mobile-First Design
- Responsive grid layout
- Touch-friendly interactions
- Collapsible sections
- Swipe navigation tabs

### Real-time Updates
- Live balance updates
- Instant stake confirmations
- Real-time APY changes
- Push notifications

### Error Management
- Toast notifications
- Inline error messages
- Retry mechanisms
- Graceful fallbacks

## 🧪 Testing

### API Testing
```bash
# Test backend endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/pools

# Or use browser
http://localhost:3000/api/v1/pools
```

### Frontend Testing
```bash
# Start development server
cd web
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Integration Testing
1. **Wallet Connection**: Test MetaMask integration
2. **API Calls**: Verify all endpoints work
3. **Real-time Updates**: Check WebSocket connection
4. **Error Handling**: Test error scenarios
5. **Mobile Responsiveness**: Test on different devices

## 🚀 Deployment

### Development
```bash
# Start both servers
./dev-start.bat

# Or individually
cd backend && node server.js
cd web && npm start
```

### Production Build
```bash
# Build frontend
cd web
npm run build

# Deploy backend to server
cd backend
# Upload files to hosting
# Configure environment variables
# Start with PM2 or similar
```

## 📱 Features Overview

### User Features
- ✅ Wallet connection & authentication
- ✅ Staking pool browsing
- ✅ Stake management (stake/unstake)
- ✅ Real-time balance tracking
- ✅ Transaction history
- ✅ Rewards tracking

### Admin Features  
- ✅ Platform statistics
- ✅ User management
- ✅ Stake monitoring
- ✅ System settings

### Technical Features
- ✅ JWT authentication
- ✅ Real-time WebSocket updates
- ✅ Responsive mobile design
- ✅ Error handling & recovery
- ✅ Loading states & UX
- ✅ API integration layer

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend server is running on port 3000
   - Verify CORS settings allow frontend origin
   - Check `.env` file has correct API_URL

2. **Wallet Not Connecting**
   - Ensure MetaMask is installed
   - Check network configuration
   - Verify contract addresses in config

3. **Authentication Fails**
   - Check JWT secret is set in backend
   - Verify nonce generation working
   - Test message signing in wallet

4. **Data Not Loading**
   - Check database connection
   - Verify API endpoints responding
   - Check authentication token validity

### Debug Tools
- **Browser DevTools**: Network tab for API calls
- **Console Logs**: Error messages and API responses
- **Backend Logs**: Server console output
- **Database Logs**: MySQL query logs

## 📞 Next Steps

1. **Test Integration**: Run both servers and test all features
2. **Fix Remaining Issues**: Address any integration problems
3. **Add Real Contract Integration**: Connect to actual smart contracts
4. **Mobile Testing**: Test on various mobile devices
5. **Production Deployment**: Deploy to staging/production environment
6. **User Acceptance Testing**: Get feedback from test users
