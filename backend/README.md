# Ozone Staking Backend

Backend API untuk Ozone Staking Platform dengan dukungan MySQL dan PHPMyAdmin (kompatibel dengan Domainesia hosting).

## 🚀 Features

- **RESTful API** dengan Express.js
- **MySQL Database** dengan PHPMyAdmin support
- **JWT Authentication** untuk Web3 wallet
- **Blockchain Event Indexer** untuk sinkronisasi otomatis
- **WebSocket Real-time Updates**
- **Admin Dashboard APIs**
- **Rate Limiting & Security**
- **Comprehensive Logging**

## 📋 Requirements

- Node.js 16+
- MySQL 5.7+ atau MariaDB
- PHPMyAdmin (untuk manajemen database)

## 🛠 Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Untuk Domainesia Hosting:

1. Login ke **cPanel Domainesia**
2. Buka **MySQL Databases**
3. Buat database baru: `ozone_staking`
4. Buat user database dan berikan akses penuh
5. Buka **PHPMyAdmin**
6. Import file `database/schema.sql`

#### Untuk Local Development:

```bash
# Install MySQL
# Buka MySQL Workbench atau command line
mysql -u root -p

# Jalankan schema
source database/schema.sql
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env dengan kredensial database Anda
nano .env
```

**Contoh konfigurasi untuk Domainesia:**

```env
# Database Configuration
DB_HOST=your-domain.domainesia.com
DB_PORT=3306
DB_NAME=yourdomain_ozone_staking
DB_USER=yourdomain_ozone
DB_PASSWORD=your_secure_password

# Update other configs as needed
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📊 Database Schema

### Tables:
- **users** - User profiles dan wallet addresses
- **stakes** - Staking records dengan history
- **transactions** - Semua blockchain transactions
- **pools** - Staking pool configurations
- **blockchain_events** - Event indexer data
- **admin_settings** - Platform settings

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/connect` - Connect wallet
- `POST /api/v1/auth/verify` - Verify JWT token
- `GET /api/v1/auth/nonce/:walletAddress` - Get signing nonce

### User
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update profile
- `GET /api/v1/user/stakes` - Get user stakes
- `GET /api/v1/user/transactions` - Get user transactions
- `GET /api/v1/user/dashboard` - Get dashboard data

### Stakes
- `GET /api/v1/stakes/user/:walletAddress` - Get user stakes
- `POST /api/v1/stakes/create` - Create stake record
- `PUT /api/v1/stakes/unstake` - Update stake as unstaked
- `GET /api/v1/stakes/stats` - Get platform stats
- `GET /api/v1/stakes/all` - Get all stakes (admin)

### Admin
- `GET /api/v1/admin/dashboard` - Admin dashboard data
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/stakes` - Get all stakes
- `GET /api/v1/admin/transactions` - Get all transactions
- `GET /api/v1/admin/analytics` - Platform analytics

### Blockchain
- `GET /api/v1/blockchain/events` - Get blockchain events
- `POST /api/v1/blockchain/sync` - Trigger manual sync
- `GET /api/v1/blockchain/status` - Get indexer status

## 🔌 WebSocket Events

Connect to `ws://your-domain:3000/ws?token=JWT_TOKEN`

### Client → Server:
```json
{
  "type": "ping"
}

{
  "type": "subscribe",
  "channels": ["platform_stats", "user_updates"]
}
```

### Server → Client:
```json
{
  "type": "stake_created",
  "data": { "stakeId": 123, "amount": "1000", "user": "0x..." }
}

{
  "type": "platform_stats",
  "data": { "totalStaked": "50000", "totalStakers": 100 }
}
```

## 🚀 Deployment ke Domainesia

### 1. Upload Files
```bash
# Zip backend folder
zip -r ozone-backend.zip backend/

# Upload via File Manager atau FTP
# Extract ke public_html/api atau subdomain
```

### 2. Node.js Setup
1. Login cPanel Domainesia
2. Buka **Node.js Apps**
3. Create New Application:
   - Version: 18.x
   - Directory: `/api` atau sesuai folder
   - Startup File: `server.js`
4. Install dependencies via **npm install**

### 3. Database Import
1. Buka **PHPMyAdmin**
2. Select database yang sudah dibuat
3. Import `database/schema.sql`
4. Verify tables terbuat dengan benar

### 4. Environment Variables
1. Update `.env` dengan kredensial production
2. Set `NODE_ENV=production`
3. Generate strong JWT secret

## 📈 Monitoring

### Health Check
```bash
curl http://your-domain/health
```

### API Status
```bash
curl http://your-domain/api/v1
```

### Database Connection
Login PHPMyAdmin untuk monitoring query performance

## 🔧 Development

### Local Testing
```bash
# Run dengan nodemon
npm run dev

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/stakes/stats
```

### Database Management
```bash
# Connect to MySQL
mysql -u root -p ozone_staking

# Show tables
SHOW TABLES;

# Check recent stakes
SELECT * FROM stakes ORDER BY created_at DESC LIMIT 10;
```

## 🛡 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin protection  
- **Rate Limiting** - API abuse prevention
- **JWT Authentication** - Secure user sessions
- **Input Validation** - SQL injection prevention
- **Environment Variables** - Secure config management

## 📞 Support

Untuk bantuan deployment di Domainesia:
1. Dokumentasi Node.js: https://domainesia.com/panduan/nodejs
2. Support Ticket: https://domainesia.com/support
3. MySQL/PHPMyAdmin: Tersedia di cPanel

---

🚀 **Ready untuk production!** Backend ini sudah dioptimalkan untuk hosting Domainesia dengan MySQL dan PHPMyAdmin support.
