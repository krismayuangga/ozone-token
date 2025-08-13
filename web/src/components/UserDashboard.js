import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as PoolIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

// Format numbers safely
const formatNumber = (value) => {
  if (!value || isNaN(value)) return '0';
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
};

// Format address
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const UserDashboard = () => {
  const { user, isLoading, isConnecting, isAuthenticated, connectWallet, logout, apiCall } = useAuth();
  const [pools, setPools] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Load data when user is authenticated
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        setLoadingData(true);
        setError(null);
        
        try {
          // Load pools and user stats in parallel
          const [poolsResponse, statsResponse] = await Promise.all([
            apiCall('/pools'),
            apiCall('/user/stats')
          ]);

          if (poolsResponse.success) {
            setPools(poolsResponse.data || []);
          }

          if (statsResponse.success) {
            setUserStats(statsResponse.data);
          }
        } catch (err) {
          console.error('Load dashboard data error:', err);
          setError(err.message);
        } finally {
          setLoadingData(false);
        }
      }
    };
    
    loadData();
  }, [isAuthenticated, apiCall]);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      // Load pools and user stats in parallel
      const [poolsResponse, statsResponse] = await Promise.all([
        apiCall('/pools'),
        apiCall('/user/stats')
      ]);

      if (poolsResponse.success) {
        setPools(poolsResponse.data || []);
      }

      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Load dashboard data error:', err);
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle connect wallet
  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
    } catch (err) {
      console.error('Connect error:', err);
      setError(err.message);
    }
  };

  // Handle stake action
  const handleStake = async (poolId, amount) => {
    try {
      setError(null);
      const response = await apiCall('/stakes/create', {
        method: 'POST',
        body: JSON.stringify({
          poolId: parseInt(poolId),
          amount: amount.toString()
        })
      });

      if (response.success) {
        // Reload data
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Stake error:', err);
      setError(err.message);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Not authenticated - show connect screen
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Avatar sx={{ mx: 'auto', mb: 3, bgcolor: 'primary.main', width: 80, height: 80 }}>
              <WalletIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h4" gutterBottom>
              Ozone Staking
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Connect your MetaMask wallet to start staking
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Button
              variant="contained"
              size="large"
              onClick={handleConnect}
              disabled={isConnecting}
              startIcon={isConnecting ? <CircularProgress size={20} /> : <WalletIcon />}
              sx={{ minWidth: 200 }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Authenticated dashboard
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {formatAddress(user?.walletAddress)}
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          onClick={logout}
          color="secondary"
        >
          Disconnect
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* User Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <WalletIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Staked
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(user?.totalStaked || '0')} OZONE
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Rewards
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(user?.totalRewards || '0')} OZONE
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PoolIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Stakes
                  </Typography>
                  <Typography variant="h6">
                    {userStats?.activeStakes || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Account Type
                  </Typography>
                  <Chip 
                    label={user?.isAdmin ? 'Admin' : 'User'} 
                    color={user?.isAdmin ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Staking Pools */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Staking Pools
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {loadingData ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : pools.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No staking pools available
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {pools.map((pool) => (
                <Grid item xs={12} md={6} key={pool.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6">
                          Pool #{pool.id}
                        </Typography>
                        <Chip 
                          label={pool.status || 'Active'} 
                          color="success" 
                          size="small"
                        />
                      </Box>
                      
                      <Typography color="text.secondary" gutterBottom>
                        APY: {formatNumber(pool.apy || '0')}%
                      </Typography>
                      
                      <Typography color="text.secondary" gutterBottom>
                        Total Staked: {formatNumber(pool.totalStaked || '0')} OZONE
                      </Typography>
                      
                      <Typography color="text.secondary" gutterBottom>
                        Stakers: {pool.totalStakers || 0}
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ mt: 2 }}
                        onClick={() => {
                          // Simple stake action - can be enhanced
                          const amount = prompt('Enter amount to stake:');
                          if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                            handleStake(pool.id, parseFloat(amount));
                          }
                        }}
                      >
                        Stake Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserDashboard;
