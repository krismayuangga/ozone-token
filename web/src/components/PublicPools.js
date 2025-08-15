import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Container,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  AccountBalance as PoolIcon,
  TrendingUp as APYIcon,
  Lock as LockIcon,
  Groups as UsersIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { formatNumber } from '../utils/formatters';

const PublicPools = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalValueLocked: 0,
    totalUsers: 0,
    totalRewardsDistributed: 0
  });

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        
        // Fetch pools from API
        const response = await fetch('http://localhost:3000/api/v1/pools');
        if (!response.ok) {
          throw new Error('Failed to fetch pools');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setPools(data.data.pools || []);
          
          // Calculate aggregate stats
          const totalTVL = data.data.pools?.reduce((sum, pool) => sum + (pool.totalStaked || 0), 0) || 0;
          const totalUsers = data.data.pools?.reduce((sum, pool) => sum + (pool.totalStakers || 0), 0) || 0;
          
          setStats({
            totalValueLocked: totalTVL,
            totalUsers: totalUsers,
            totalRewardsDistributed: 125000 // Mock data
          });
        }
      } catch (error) {
        console.error('Error fetching pools:', error);
        setError('Failed to load staking pools');
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Platform Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
          Ozone Staking Platform
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Earn rewards by staking your OZONE tokens
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <FireIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats.totalValueLocked)} OZONE
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Value Locked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <UsersIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats.totalUsers)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Active Stakers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <APYIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {formatNumber(stats.totalRewardsDistributed)} OZONE
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Rewards Distributed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Available Pools */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Available Staking Pools
        </Typography>
        
        <Grid container spacing={3}>
          {pools.map((pool, index) => (
            <Grid item xs={12} md={6} key={pool.id || index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  border: pool.isActive ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: pool.isActive ? '#4caf50' : '#ff9800', width: 48, height: 48 }}>
                      <PoolIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {pool.name || `Pool ${index + 1}`}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip 
                          label={pool.isActive ? 'Active' : 'Inactive'} 
                          color={pool.isActive ? 'success' : 'warning'}
                          size="small"
                        />
                        <Chip 
                          label={`${pool.lockPeriod || 30} days`}
                          icon={<LockIcon />}
                          variant="outlined"
                          size="small"
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {pool.apy ? `${(pool.apy / 100).toFixed(1)}%` : '12.5%'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          APY
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(pool.totalStaked || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Staked
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {pool.totalStakers && (
                    <Box sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Pool Capacity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pool.totalStakers} stakers
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((pool.totalStaked || 0) / 1000000 * 100, 100)} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Connect your wallet to start staking
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {pools.length === 0 && (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <PoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active pools available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new staking opportunities
            </Typography>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default PublicPools;
