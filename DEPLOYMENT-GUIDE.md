# Ozone Staking - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
Create production `.env` file:
```env
NODE_ENV=production
PORT=3000

# Production Database (Domainesia)
DB_HOST=your-domainesia-mysql-host
DB_PORT=3306
DB_NAME=ozone_staking
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_CONNECTION_LIMIT=5

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# Blockchain (Production)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
OZONE_CONTRACT_ADDRESS=0x6cbddd8bd2072263291ddff8d5760c36fda08a26
PRIVATE_KEY=your-admin-wallet-private-key

# CORS
CORS_ORIGIN=https://your-domain.com
```

### 2. Database Setup (Domainesia cPanel)
1. **Create Database**: 
   - Login to cPanel → MySQL Databases
   - Create database: `username_ozone_staking`
   - Create user with full privileges

2. **Import Schema**:
   - Use phpMyAdmin to import `database/setup.sql`
   - Or use MySQL command line if available

3. **Verify Tables**:
   ```sql
   SHOW TABLES;
   -- Should show: users, stakes, transactions, pools, blockchain_events, admin_settings
   ```

### 3. File Upload Structure
```
/public_html/
├── api/                 # Backend files here
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── database/
│   ├── package.json
│   └── .env
├── index.html          # Frontend build
├── static/
└── assets/
```

### 4. Package.json Scripts (Production)
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "production": "npm install --production && npm run start"
  }
}
```

## Deployment Steps

### Step 1: Database Migration
```sql
-- Production database setup
CREATE DATABASE IF NOT EXISTS ozone_staking;
USE ozone_staking;

-- Import all tables from development
-- (Copy content from database/setup.sql)
```

### Step 2: Upload Backend Files
```bash
# Zip backend folder (exclude node_modules)
# Upload via cPanel File Manager or FTP
# Extract to /public_html/api/
```

### Step 3: Install Dependencies
```bash
# Via cPanel Terminal or SSH
cd public_html/api
npm install --production
```

### Step 4: Start Application
```bash
# Using PM2 (if available)
pm2 start server.js --name "ozone-api"

# Or using nohup
nohup node server.js > app.log 2>&1 &

# Or configure as service in hosting panel
```

## Security Checklist

### 1. Environment Variables
- [ ] Strong JWT secret (32+ characters)
- [ ] Production database credentials
- [ ] Secure RPC endpoint
- [ ] Proper CORS configuration

### 2. Rate Limiting
- [ ] API rate limits active
- [ ] Per-IP connection limits
- [ ] DDoS protection enabled

### 3. HTTPS Configuration
- [ ] SSL certificate installed
- [ ] HTTP to HTTPS redirect
- [ ] Secure headers enabled

### 4. Database Security
- [ ] Database user with minimal privileges
- [ ] Connection over SSL if available
- [ ] Regular backups configured

## Performance Optimization

### 1. Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_stakes_user ON stakes(user_id, is_active);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX idx_events_block ON blockchain_events(block_number);
```

### 2. Connection Pool
```javascript
// Optimize for production
connectionLimit: 5,  // Lower for shared hosting
queueLimit: 0,
acquireTimeout: 60000
```

### 3. Caching Strategy
- Redis for session storage
- API response caching
- Database query caching

## Monitoring & Logging

### 1. Application Logs
```javascript
// Production logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Health Monitoring
- Endpoint: `GET /health`
- Database connectivity check
- Blockchain connection status
- Memory and CPU usage

### 3. Error Tracking
- API error logging
- Database error monitoring
- Blockchain sync issues

## Backup Strategy

### 1. Database Backup
```sql
-- Daily backup script
mysqldump -u username -p ozone_staking > backup_$(date +%Y%m%d).sql
```

### 2. Application Files
- Weekly full backup
- Daily incremental backup
- Version control integration

## Maintenance Tasks

### Daily
- [ ] Check application logs
- [ ] Monitor database performance
- [ ] Verify blockchain sync status

### Weekly
- [ ] Database backup verification
- [ ] Security log review
- [ ] Performance metrics analysis

### Monthly
- [ ] Dependency updates
- [ ] Security patches
- [ ] Database optimization

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check credentials in `.env`
   - Verify database server status
   - Check connection limits

2. **API Not Responding**
   - Check process status: `ps aux | grep node`
   - Review error logs: `tail -f error.log`
   - Restart application

3. **Blockchain Sync Issues**
   - Check RPC endpoint status
   - Verify contract address
   - Review rate limiting

4. **High Memory Usage**
   - Monitor connection pool
   - Check for memory leaks
   - Optimize database queries

### Emergency Procedures

1. **Service Recovery**
   ```bash
   # Stop current process
   pkill -f "node server.js"
   
   # Start with error logging
   nohup node server.js > error.log 2>&1 &
   ```

2. **Database Recovery**
   ```sql
   -- Restore from backup
   mysql -u username -p ozone_staking < backup_latest.sql
   ```

3. **Rollback Procedure**
   - Backup current state
   - Restore previous version
   - Update database if needed
   - Verify functionality

## Contact & Support

- **Development Team**: [Your contact info]
- **Server Status**: `GET /health`
- **Documentation**: `/api/v1/docs` (if implemented)
- **Emergency Contact**: [Emergency procedures]
