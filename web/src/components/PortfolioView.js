import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Timeline,
  History
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const PortfolioView = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const { ozoneBalance, isAuthenticated, connectWallet } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadPortfolioData();
    loadTransactions();
  }, []);

  const loadPortfolioData = async () => {
    // Mock data - replace with actual API call
    setPortfolioData({
      totalValue: 1525.60,
      totalStaked: 1500,
      totalRewards: 93.40,
      dailyChange: 12.45,
      dailyChangePercent: 0.82,
      weeklyChange: 45.60,
      monthlyChange: 125.30,
      stakingHistory: [
        { date: '2024-01-01', value: 1000 },
        { date: '2024-01-15', value: 1250 },
        { date: '2024-01-30', value: 1400 },
        { date: '2024-02-15', value: 1525.60 },
      ]
    });
  };

  const loadTransactions = async () => {
    // Mock data - replace with actual API call
    setTransactions([
      {
        id: 1,
        type: 'stake',
        amount: 1000,
        pool: 'OZONE Staking Pool',
        date: '2024-02-10T10:30:00Z',
        status: 'completed',
        txHash: '0x1234...5678'
      },
      {
        id: 2,
        type: 'reward',
        amount: 25.6,
        pool: 'OZONE Staking Pool',
        date: '2024-02-09T15:45:00Z',
        status: 'completed',
        txHash: '0x2345...6789'
      },
      {
        id: 3,
        type: 'stake',
        amount: 500,
        pool: 'OZONE Pro Pool',
        date: '2024-02-08T09:15:00Z',
        status: 'completed',
        txHash: '0x3456...7890'
      },
      {
        id: 4,
        type: 'unstake',
        amount: 250,
        pool: 'OZONE Pro Pool',
        date: '2024-02-07T14:20:00Z',
        status: 'completed',
        txHash: '0x4567...8901'
      }
    ]);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'stake': return <TrendingUp sx={{ color: '#00d4ff' }} />;
      case 'unstake': return <TrendingDown sx={{ color: '#f44336' }} />;
      case 'reward': return <AccountBalance sx={{ color: '#4caf50' }} />;
      default: return <History sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'stake': return '#00d4ff';
      case 'unstake': return '#f44336';
      case 'reward': return '#4caf50';
      default: return 'rgba(255, 255, 255, 0.7)';
    }
  };

  if (!isAuthenticated) {
    return (
      <Box>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          color="white"
          gutterBottom
        >
          Portfolio
        </Typography>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={4}>
          Connect your wallet to track your staking performance and history
        </Typography>

        {/* Public Market Data */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">OZONE Price</Typography>
                </Box>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  $0.45
                </Typography>
                <Box display="flex" alignItems="center">
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 1 }} />
                  <Typography variant="body2" color="success.main">
                    +5.2% (24h)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance sx={{ color: 'info.main', mr: 2 }} />
                  <Typography variant="h6">Total Value Locked</Typography>
                </Box>
                <Typography variant="h4" color="info.main" gutterBottom>
                  $1.25M
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all staking pools
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Connect Wallet CTA */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUp sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" color="white" gutterBottom>
              Track Your Portfolio Performance
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Connect your wallet to view detailed portfolio analytics, staking performance, 
              and transaction history all in one place.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Connect Wallet to Continue
            </Button>
          </CardContent>
        </Card>

        {/* Demo Portfolio Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ opacity: 0.5 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Portfolio Value</Typography>
                <Typography variant="h5" color="primary.main">--</Typography>
                <Typography variant="caption" color="text.secondary">Connect to view</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ opacity: 0.5 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total Rewards</Typography>
                <Typography variant="h5" color="success.main">--</Typography>
                <Typography variant="caption" color="text.secondary">All time earnings</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ opacity: 0.5 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Available Balance</Typography>
                <Typography variant="h5" color="warning.main">--</Typography>
                <Typography variant="caption" color="text.secondary">Ready to stake</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ opacity: 0.5 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total Staked</Typography>
                <Typography variant="h5" color="info.main">--</Typography>
                <Typography variant="caption" color="text.secondary">Across all pools</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!portfolioData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <LinearProgress sx={{ width: '200px' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        color="white"
        gutterBottom
      >
        Portfolio
      </Typography>
      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={3}>
        Track your staking performance and history
      </Typography>

      {/* Portfolio Summary */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1))',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    Total Portfolio Value
                  </Typography>
                  <Typography variant="h5" color="white" fontWeight="bold">
                    {formatNumber(portfolioData.totalValue)} OZONE
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <TrendingUp sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                    <Typography variant="caption" color="#4caf50">
                      +{formatNumber(portfolioData.dailyChange)} ({portfolioData.dailyChangePercent}%)
                    </Typography>
                  </Box>
                </Box>
                <Timeline sx={{ color: '#00d4ff', fontSize: 30 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(102, 187, 106, 0.1))',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    Total Rewards
                  </Typography>
                  <Typography variant="h5" color="#4caf50" fontWeight="bold">
                    +{formatNumber(portfolioData.totalRewards)} OZONE
                  </Typography>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    All time earnings
                  </Typography>
                </Box>
                <TrendingUp sx={{ color: '#4caf50', fontSize: 30 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 213, 79, 0.1))',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    Available Balance
                  </Typography>
                  <Typography variant="h5" color="white" fontWeight="bold">
                    {formatNumber(ozoneBalance)} OZONE
                  </Typography>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    Ready to stake
                  </Typography>
                </Box>
                <AccountBalance sx={{ color: '#ffc107', fontSize: 30 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(171, 71, 188, 0.1))',
            border: '1px solid rgba(156, 39, 176, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justify="space-between">
                <Box>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    Total Staked
                  </Typography>
                  <Typography variant="h5" color="white" fontWeight="bold">
                    {formatNumber(portfolioData.totalStaked)} OZONE
                  </Typography>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    Across all pools
                  </Typography>
                </Box>
                <Timeline sx={{ color: '#9c27b0', fontSize: 30 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Summary */}
      <Card sx={{
        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        mb: 4
      }}>
        <CardContent>
          <Typography variant="h6" color="white" fontWeight="bold" mb={3}>
            Performance Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  Daily Change
                </Typography>
                <Typography variant="h6" color="#4caf50" fontWeight="bold">
                  +{formatNumber(portfolioData.dailyChange)} OZONE
                </Typography>
                <Typography variant="caption" color="#4caf50">
                  +{portfolioData.dailyChangePercent}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  Weekly Change
                </Typography>
                <Typography variant="h6" color="#4caf50" fontWeight="bold">
                  +{formatNumber(portfolioData.weeklyChange)} OZONE
                </Typography>
                <Typography variant="caption" color="#4caf50">
                  +3.08%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  Monthly Change
                </Typography>
                <Typography variant="h6" color="#4caf50" fontWeight="bold">
                  +{formatNumber(portfolioData.monthlyChange)} OZONE
                </Typography>
                <Typography variant="caption" color="#4caf50">
                  +8.95%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card sx={{
        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px'
      }}>
        <CardContent>
          <Typography variant="h6" color="white" fontWeight="bold" mb={3}>
            Recent Transactions
          </Typography>
          
          {isMobile ? (
            // Mobile view - card layout
            <Box>
              {transactions.map((tx) => (
                <Card key={tx.id} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  mb: 2
                }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justify="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getTransactionIcon(tx.type)}
                        <Typography variant="body1" color="white" fontWeight="500">
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </Typography>
                      </Box>
                      <Chip
                        label={tx.status}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          color: '#4caf50'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={1}>
                      {tx.pool}
                    </Typography>
                    <Box display="flex" justify="space-between" alignItems="center">
                      <Typography 
                        variant="h6" 
                        color={getTransactionColor(tx.type)} 
                        fontWeight="bold"
                      >
                        {tx.type === 'unstake' ? '-' : '+'}{formatNumber(tx.amount)} OZONE
                      </Typography>
                      <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                        {formatDate(tx.date)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop view - table layout
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>Type</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>Pool</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }} align="right">Amount</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>Date</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } }}>
                      <TableCell sx={{ border: 'none' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getTransactionIcon(tx.type)}
                          <Typography color="white">
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>
                        {tx.pool}
                      </TableCell>
                      <TableCell align="right" sx={{ border: 'none' }}>
                        <Typography 
                          color={getTransactionColor(tx.type)} 
                          fontWeight="bold"
                        >
                          {tx.type === 'unstake' ? '-' : '+'}{formatNumber(tx.amount)} OZONE
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', border: 'none' }}>
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Chip
                          label={tx.status}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(76, 175, 80, 0.2)',
                            color: '#4caf50'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PortfolioView;
