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
  AlertTitle,
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
  const { user, isLoading, isAuthenticated, connectWallet, logout, apiCall, ozoneBalance } = useAuth();
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
            // Handle different response structures
            const poolsData = poolsResponse.data;
            console.log('🔍 Raw pools response:', poolsResponse);
            console.log('🔍 Pools data:', poolsData);
            
            if (Array.isArray(poolsData)) {
              console.log('✅ Setting pools as direct array:', poolsData);
              setPools(poolsData);
            } else if (poolsData && Array.isArray(poolsData.pools)) {
              console.log('✅ Setting pools from nested structure:', poolsData.pools);
              setPools(poolsData.pools);
            } else {
              console.warn('⚠️ Unexpected pools data structure:', poolsData);
              setPools([]);
            }
          } else {
            console.warn('❌ Pools response failed:', poolsResponse);
            setPools([]);
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
        // Handle different response structures
        const poolsData = poolsResponse.data;
        if (Array.isArray(poolsData)) {
          setPools(poolsData);
        } else if (poolsData && Array.isArray(poolsData.pools)) {
          setPools(poolsData.pools);
        } else {
          console.warn('Unexpected pools data structure:', poolsData);
          setPools([]);
        }
      } else {
        setPools([]);
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

  // Not authenticated - show platform overview
  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Video Banner Section */}
        <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          <Box sx={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
            >
              <source src="/videos/ozone-banner.mp4" type="video/mp4" />
              <source src="/web/src/image/ozone-banner.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Subtle overlay for better video visibility */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.1)',
                zIndex: 2
              }}
            />
          </Box>
        </Card>

        {/* Global Statistics */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Global Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                '&:hover': { transform: 'translateY(-4px)' },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    12.5%
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Average APY
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                borderRadius: 3,
                '&:hover': { transform: 'translateY(-4px)' },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    2.5M
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Total Staked OZONE
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #ff9800 0%, #ef6c00 100%)',
                borderRadius: 3,
                '&:hover': { transform: 'translateY(-4px)' },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    1,234
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Active Stakers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                borderRadius: 3,
                '&:hover': { transform: 'translateY(-4px)' },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    5
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Active Pools
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Token Information */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Token Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                    Token Name:
                  </Typography>
                  <Typography variant="body1" color="primary.main">
                    OZONE RWA Token
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                    Total Supply:
                  </Typography>
                  <Typography variant="body1">
                    1,000,000,000 OZONE
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                    Transfer Tax:
                  </Typography>
                  <Chip label="1%" color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                    Backing:
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Nickel Mining Assets
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Active Pools */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Available Staking Pools
            </Typography>
            
            {loadingData ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {/* Pool 1 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          30-Day Pool
                        </Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          8.5%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual APY
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Lock Period:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          30 Days
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Min. Stake:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          100 OZONE
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={() => handleConnect()}
                      >
                        Connect to Stake
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Pool 2 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          90-Day Pool
                        </Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          12.5%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual APY
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Lock Period:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          90 Days
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Min. Stake:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          500 OZONE
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={() => handleConnect()}
                      >
                        Connect to Stake
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Pool 3 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          180-Day Pool
                        </Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          15.8%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual APY
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Lock Period:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          180 Days
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Min. Stake:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          1,000 OZONE
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={() => handleConnect()}
                      >
                        Connect to Stake
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Pool 4 */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          365-Day Pool
                        </Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          20.2%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual APY
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Lock Period:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          365 Days
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Min. Stake:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          5,000 OZONE
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        sx={{ mt: 2 }}
                        onClick={() => handleConnect()}
                      >
                        Connect to Stake
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
              Why Stake OZONE?
            </Typography>
            
            <Grid container spacing={4} alignItems="stretch">
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mb: 3, 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Earn Rewards
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Earn competitive APY rewards by staking your OZONE tokens with rates up to 20.2% annually
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mb: 3, 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                  }}>
                    <SecurityIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Secure Protocol
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Built on secure smart contracts with audited code and backed by real-world nickel mining assets
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'info.main', 
                    mb: 3, 
                    width: 64, 
                    height: 64,
                    boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)'
                  }}>
                    <PoolIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Multiple Pools
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Choose from various staking pools with different lock periods and APY rates to suit your strategy
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Connection Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Container>
    );
  }

  // Authenticated dashboard
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
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
          sx={{ borderRadius: 2, px: 3 }}
        >
          Disconnect Wallet
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {ozoneBalance === '0.00' && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <AlertTitle>No OZONE Tokens Found</AlertTitle>
          Your wallet doesn't have any OZONE tokens. You need OZONE tokens to participate in staking.
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
              onClick={async () => {
                try {
                  await window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                      type: 'ERC20',
                      options: {
                        address: '0x8aE086CA4E4e24b616409c69Bd2bbFe7262AEe59',
                        symbol: 'OZONE',
                        decimals: 18,
                        image: 'https://via.placeholder.com/64'
                      },
                    },
                  });
                } catch (error) {
                  console.error('Error adding token to MetaMask:', error);
                }
              }}
            >
              Add OZONE to MetaMask
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
              href="https://testnet.bscscan.com/address/0x8aE086CA4E4e24b616409c69Bd2bbFe7262AEe59"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Contract
            </Button>
          </Box>
        </Alert>
      )}

      {/* Overview Wallet */}
      <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            Overview Wallet
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {formatNumber(ozoneBalance || '0')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  OZONE Balance
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {formatNumber(user?.totalStaked || '0')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Staked
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  {formatNumber(user?.totalRewards || '0')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Rewards
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistik Staking */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Staking Statistics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <WalletIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatNumber(user?.totalStaked || '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Staked OZONE
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <TrendingUpIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatNumber(user?.totalRewards || '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rewards Claimed
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <PoolIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {userStats?.activeStakes || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Stakes
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <SecurityIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {user?.isAdmin ? 'Admin' : 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account Type
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Global Statistics untuk authenticated user juga */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Global Statistics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                textAlign: 'center',
                py: 3
              }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  12.5%
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Average APY
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                borderRadius: 2,
                textAlign: 'center',
                py: 3
              }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  2.5M
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Staked OZONE
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #ef6c00 100%)',
                borderRadius: 2,
                textAlign: 'center',
                py: 3
              }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  1,234
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Active Stakers
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                borderRadius: 2,
                textAlign: 'center',
                py: 3
              }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                  5
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Active Pools
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staking Pools */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Available Staking Pools
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {loadingData ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : !Array.isArray(pools) || pools.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No staking pools available
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {Array.isArray(pools) && pools.map((pool) => (
                <Grid item xs={12} md={6} key={pool.id || Math.random()}>
                  <Card variant="outlined" sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Pool #{pool.id}
                        </Typography>
                        <Chip 
                          label={pool.status || 'Active'} 
                          color="success" 
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          {formatNumber(pool.apy || '0')}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Annual APY
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Total Staked:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {formatNumber(pool.totalStaked || '0')} OZONE
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" mb={3}>
                        <Typography variant="body2" color="text.secondary">
                          Stakers:
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {pool.totalStakers || 0}
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        fullWidth
                        sx={{ 
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 600
                        }}
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
