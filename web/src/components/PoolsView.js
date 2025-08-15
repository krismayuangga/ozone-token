import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp,
  AccessTime,
  AccountBalanceWallet,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const PoolsView = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, connectWallet, user, ozoneBalance } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pools');
      setPools(response.data || []);
    } catch (error) {
      console.error('Error loading pools:', error);
      // Fallback to mock data if API fails
      setPools([
        {
          id: 1,
          name: 'OZONE Staking Pool',
          apy: 12.5,
          lockPeriod: 30,
          totalStaked: 1000000,
          maxCapacity: 5000000,
          stakersCount: 150,
          isActive: true
        },
        {
          id: 2,
          name: 'OZONE Pro Pool',
          apy: 18.0,
          lockPeriod: 90,
          totalStaked: 300000,
          maxCapacity: 1000000,
          stakersCount: 75,
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const PoolCard = ({ pool }) => {
    const utilizationRate = ((pool.totalStaked / pool.maxCapacity) * 100).toFixed(1);
    
    return (
      <Card
        sx={{
          background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.15)',
            border: '1px solid rgba(0, 212, 255, 0.3)'
          }
        }}
      >
        <CardContent sx={{ padding: isMobile ? '16px' : '20px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                color="white"
                gutterBottom
              >
                {pool.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={pool.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    backgroundColor: pool.isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    color: pool.isActive ? '#4caf50' : '#f44336',
                    border: `1px solid ${pool.isActive ? '#4caf50' : '#f44336'}`
                  }}
                />
                <Chip
                  label={`${pool.lockPeriod} days`}
                  size="small"
                  icon={<AccessTime sx={{ fontSize: '16px' }} />}
                  sx={{
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    color: '#00d4ff',
                    border: '1px solid rgba(0, 212, 255, 0.3)'
                  }}
                />
              </Box>
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" color="#00d4ff" fontWeight="bold">
                {pool.apy}%
              </Typography>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                APY
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  Total Staked
                </Typography>
                <Typography variant="body1" color="white" fontWeight="500">
                  {formatNumber(pool.totalStaked)} OZONE
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  Stakers
                </Typography>
                <Typography variant="body1" color="white" fontWeight="500">
                  {pool.stakersCount || 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Pool Utilization
              </Typography>
              <Typography variant="caption" color="#00d4ff">
                {utilizationRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={parseFloat(utilizationRate)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #00d4ff 0%, #0099cc 100%)',
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {isAuthenticated ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<TrendingUp />}
              sx={{
                background: 'linear-gradient(45deg, #00d4ff 30%, #0099cc 90%)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                padding: '12px',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0099cc 30%, #007aa3 90%)',
                  transform: 'translateY(-1px)'
                }
              }}
              disabled={!pool.isActive}
            >
              Stake Now
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AccountBalanceWallet />}
              onClick={connectWallet}
              sx={{
                borderColor: '#00d4ff',
                color: '#00d4ff',
                fontWeight: 'bold',
                borderRadius: '12px',
                padding: '12px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  borderColor: '#00d4ff'
                }
              }}
            >
              Connect Wallet to Stake
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold"
            color="white"
            gutterBottom
          >
            Staking Pools
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Choose a pool and start earning rewards
          </Typography>
        </Box>
        <IconButton
          onClick={loadPools}
          disabled={loading}
          sx={{
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
            '&:hover': {
              backgroundColor: 'rgba(0, 212, 255, 0.2)'
            }
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* User Info - Only show when authenticated */}
      {isAuthenticated && user && (
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1))',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '16px',
            mb: 3
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  Your OZONE Balance
                </Typography>
                <Typography variant="h5" color="white" fontWeight="bold">
                  {formatNumber(ozoneBalance)} OZONE
                </Typography>
              </Box>
              <AccountBalanceWallet sx={{ color: '#00d4ff', fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <LinearProgress sx={{ width: '100%', borderRadius: 2 }} />
        </Box>
      )}

      {/* Pools Grid */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {pools.length > 0 ? (
          pools.map((pool) => (
            <Grid item xs={12} sm={6} lg={4} key={pool.id}>
              <PoolCard pool={pool} />
            </Grid>
          ))
        ) : (
          !loading && (
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'rgba(30, 30, 30, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  padding: '40px'
                }}
              >
                <Typography variant="h6" color="rgba(255, 255, 255, 0.7)">
                  No staking pools available
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" mt={1}>
                  Check back later for new opportunities
                </Typography>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
};

export default PoolsView;
