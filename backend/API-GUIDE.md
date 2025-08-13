# Ozone Staking Backend - Development Scripts

## Quick Start
```bash
# Windows
scripts\dev-start.bat

# Or manually:
cd backend
node server.js
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/connect` - Connect wallet
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### User Management
- `GET /api/v1/user/stats` - Get user stats
- `PUT /api/v1/user/profile` - Update profile
- `GET /api/v1/user/stakes` - Get user stakes
- `GET /api/v1/user/transactions` - Get user transactions

### Staking
- `GET /api/v1/stakes/active` - Get all active stakes
- `POST /api/v1/stakes` - Create stake (via blockchain)
- `PUT /api/v1/stakes/:id/unstake` - Unstake

### Pools
- `GET /api/v1/pools` - Get staking pools
- `GET /api/v1/pools/:id` - Get specific pool
- `GET /api/v1/pools/:id/stats` - Get pool statistics

### Blockchain
- `POST /api/v1/blockchain/sync` - Manual sync
- `GET /api/v1/blockchain/events` - Get recent events
- `GET /api/v1/blockchain/status` - Get indexer status

### Admin (requires admin role)
- `GET /api/v1/admin/dashboard` - Admin dashboard data
- `GET /api/v1/admin/users` - All users
- `GET /api/v1/admin/stats` - Platform statistics
- `POST /api/v1/admin/settings` - Update settings

### Health
- `GET /health` - Health check

## Testing Endpoints

### With PowerShell
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3000/health"

# Get pools
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/pools"

# Connect wallet (replace with actual wallet address)
$body = @{ walletAddress = "0x742d35Cc6634C0532925a3b8d6aC6B1B8C86d4Y" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/connect" -Method Post -Body $body -ContentType "application/json"
```

### With Browser
- http://localhost:3000/health
- http://localhost:3000/api/v1/pools
- http://localhost:3000/api/v1/admin/stats (if admin)

## Environment Setup

1. **XAMPP**: Start MySQL service
2. **Database**: Import schema from `database/` folder
3. **Environment**: Configure `.env` file
4. **Dependencies**: Run `npm install`

## Database Schema

Tables created:
- `users` - User accounts and wallet addresses
- `stakes` - Staking records and history
- `transactions` - Blockchain transactions
- `pools` - Staking pool configurations
- `blockchain_events` - Event indexer data
- `admin_settings` - Platform settings

## Real-time Features

- **WebSocket**: Real-time updates on port 3000
- **Blockchain Indexer**: Auto-sync blockchain events
- **Rate Limiting**: API protection and throttling

## Troubleshooting

### Database Connection Issues
1. Check XAMPP MySQL is running
2. Verify database `ozone_staking` exists
3. Check `.env` configuration

### Server Won't Start
1. Run `npm install` to install dependencies
2. Check port 3000 is not in use
3. Verify you're in backend directory

### API Errors
1. Check server logs for details
2. Verify request headers and body format
3. Check authentication for protected routes
