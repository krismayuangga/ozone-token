# Ozone Token Staking Platform

A decentralized staking platform for Ozone tokens built with React.js frontend and Node.js backend.

## 🚀 Features

- **MetaMask Integration**: Seamless wallet connection
- **Token Staking**: Stake Ozone tokens with flexible periods
- **Real-time Dashboard**: View staking statistics and rewards
- **Responsive Design**: Modern UI with Material-UI components
- **Blockchain Indexer**: Real-time blockchain data synchronization

## 🏗️ Project Structure

```
ozone-staking/
├── web/                    # React.js Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── theme/          # Material-UI theme
│   │   ├── contracts/      # Smart contract ABIs
│   │   └── services/       # API services
│   └── package.json
├── backend/                # Node.js Backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── database/       # Database models and config
│   │   └── indexer/        # Blockchain indexer
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Web3.js / Ethers.js
- MetaMask SDK

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Web3 Provider

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- MetaMask wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/krismayuangga/ozone-token.git
   cd ozone-token
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd web
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in backend directory:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=ozone_staking
   JWT_SECRET=your_jwt_secret
   WEB3_PROVIDER_URL=your_web3_provider_url
   ```

5. **Start the Application**
   
   Backend (from backend directory):
   ```bash
   npm start
   ```
   
   Frontend (from web directory):
   ```bash
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

## 📱 Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **View Dashboard**: See your staking statistics and available pools
3. **Stake Tokens**: Select a staking pool and stake your Ozone tokens
4. **Monitor Rewards**: Track your staking rewards in real-time

## 🔧 Development

### Available Scripts

#### Frontend (web/)
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

#### Backend (backend/)
- `npm start` - Start server
- `npm run dev` - Start with nodemon (development)
- `npm test` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Issues

If you encounter any issues, please create an issue on GitHub with detailed information about the problem.

---

Made with ❤️ by [krismayuangga](https://github.com/krismayuangga)
