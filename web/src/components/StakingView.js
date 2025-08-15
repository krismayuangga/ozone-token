import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const StakingView = () => {
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [unstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState(null);
  const [userStakes, setUserStakes] = useState([]);
  const { ozoneBalance, isAuthenticated, connectWallet } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Load user stakes
    loadUserStakes();
  }, []);

  const loadUserStakes = async () => {
    // Mock data for now - replace with actual API call
    setUserStakes([
      {
        id: 1,
        poolName: 'OZONE Staking Pool',
        amount: 1000,
        apy: 12.5,
        lockPeriod: 30,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        rewards: 25.6,
        status: 'active'
      },
      {
        id: 2,
        poolName: 'OZONE Pro Pool',
        amount: 500,
        apy: 18.0,
        lockPeriod: 90,
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-04-10'),
        rewards: 67.8,
        status: 'active'
      }
    ]);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const calculateDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const StakeCard = ({ stake }) => {
    const daysRemaining = calculateDaysRemaining(stake.endDate);
    const progressPercentage = ((stake.lockPeriod - daysRemaining) / stake.lockPeriod) * 100;
    
    return (
      <Card
        sx={{
          background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0, 212, 255, 0.15)'
          }
        }}
      >
        <CardContent sx={{ padding: isMobile ? '16px' : '20px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" color="white" fontWeight="bold">
                {stake.poolName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Chip
                  label={stake.status}
                  size="small"
                  sx={{
                    backgroundColor: stake.status === 'active' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                    color: stake.status === 'active' ? '#4caf50' : '#ffc107'
                  }}
                />
                <Chip
                  label={`${stake.apy}% APY`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    color: '#00d4ff'
                  }}
                />
              </Box>
            </Box>
            <Box textAlign="right">
              <Typography variant="h5" color="white" fontWeight="bold">
                {formatNumber(stake.amount)}
              </Typography>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                OZONE Staked
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Earned Rewards
              </Typography>
              <Typography variant="body1" color="#4caf50" fontWeight="bold">
                +{formatNumber(stake.rewards)} OZONE
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Time Remaining
              </Typography>
              <Typography variant="body1" color="white" fontWeight="500">
                {daysRemaining} days
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Lock Period Progress
              </Typography>
              <Typography variant="caption" color="#00d4ff">
                {progressPercentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: progressPercentage === 100 
                    ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                    : 'linear-gradient(90deg, #00d4ff 0%, #0099cc 100%)',
                  borderRadius: 3
                }
              }}
            />
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedPool(stake);
                setStakeDialogOpen(true);
              }}
              sx={{
                borderColor: '#00d4ff',
                color: '#00d4ff',
                flex: 1,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Add More
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={daysRemaining === 0 ? <RemoveIcon /> : <Warning />}
              onClick={() => {
                setSelectedPool(stake);
                setUnstakeDialogOpen(true);
              }}
              disabled={daysRemaining > 0}
              sx={{
                borderColor: daysRemaining === 0 ? '#f44336' : 'rgba(255, 193, 7, 0.5)',
                color: daysRemaining === 0 ? '#f44336' : 'rgba(255, 193, 7, 0.5)',
                flex: 1,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              {daysRemaining === 0 ? 'Unstake' : 'Locked'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const handleStake = () => {
    // Implement staking logic
    console.log('Staking:', stakeAmount, 'to pool:', selectedPool?.poolName);
    setStakeDialogOpen(false);
    setStakeAmount('');
    // Refresh user stakes
    loadUserStakes();
  };

  const handleUnstake = () => {
    // Implement unstaking logic
    console.log('Unstaking from pool:', selectedPool?.poolName);
    setUnstakeDialogOpen(false);
    // Refresh user stakes
    loadUserStakes();
  };

  const totalStaked = userStakes.reduce((sum, stake) => sum + stake.amount, 0);
  const totalRewards = userStakes.reduce((sum, stake) => sum + stake.rewards, 0);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Box>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight="bold"
          color="white"
          gutterBottom
        >
          My Staking
        </Typography>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={4}>
          Connect your wallet to view and manage your stakes
        </Typography>

        {/* Connect Wallet Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" color="white" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 4 }}>
              To view your staking positions and manage your stakes, please connect your wallet first.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={connectWallet}
              startIcon={<AddIcon />}
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
              Connect Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Demo/Preview Section */}
        <Card sx={{ opacity: 0.6 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Staking Interface Preview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(45, 212, 191, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Staked</Typography>
                  <Typography variant="h5" color="primary.main">-- OZONE</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Rewards</Typography>
                  <Typography variant="h5" color="success.main">-- OZONE</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">Active Stakes</Typography>
                  <Typography variant="h5" color="warning.main">--</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
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
        My Staking
      </Typography>
      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={3}>
        Manage your active stakes and rewards
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1))',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Total Staked
              </Typography>
              <Typography variant="h5" color="white" fontWeight="bold">
                {formatNumber(totalStaked)} OZONE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(102, 187, 106, 0.1))',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Total Rewards
              </Typography>
              <Typography variant="h5" color="#4caf50" fontWeight="bold">
                +{formatNumber(totalRewards)} OZONE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 213, 79, 0.1))',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                Available Balance
              </Typography>
              <Typography variant="h5" color="white" fontWeight="bold">
                {formatNumber(ozoneBalance)} OZONE
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Stakes */}
      <Typography variant="h6" color="white" fontWeight="bold" mb={2}>
        Active Stakes ({userStakes.length})
      </Typography>
      
      <Grid container spacing={isMobile ? 2 : 3}>
        {userStakes.length > 0 ? (
          userStakes.map((stake) => (
            <Grid item xs={12} md={6} key={stake.id}>
              <StakeCard stake={stake} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{
              background: 'rgba(30, 30, 30, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              textAlign: 'center',
              padding: '40px'
            }}>
              <TrendingUp sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
              <Typography variant="h6" color="rgba(255, 255, 255, 0.7)">
                No active stakes yet
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" mb={3}>
                Start staking to earn rewards
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #00d4ff 30%, #0099cc 90%)',
                  borderRadius: '12px'
                }}
                onClick={() => setStakeDialogOpen(true)}
              >
                Start Staking
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Stake Dialog */}
      <Dialog 
        open={stakeDialogOpen} 
        onClose={() => setStakeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Add Stake {selectedPool && `to ${selectedPool.poolName}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={2}>
              Available Balance: {formatNumber(ozoneBalance)} OZONE
            </Typography>
            <TextField
              fullWidth
              label="Amount to Stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              type="number"
              InputProps={{
                endAdornment: <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>OZONE</Typography>
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#00d4ff' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={1}>
                Quick Select:
              </Typography>
              <Box display="flex" gap={1}>
                {[25, 50, 75, 100].map((percentage) => (
                  <Button
                    key={percentage}
                    size="small"
                    variant="outlined"
                    onClick={() => setStakeAmount((ozoneBalance * percentage / 100).toString())}
                    sx={{
                      borderColor: 'rgba(0, 212, 255, 0.5)',
                      color: '#00d4ff',
                      borderRadius: '8px'
                    }}
                  >
                    {percentage}%
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStakeDialogOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleStake}
            variant="contained"
            disabled={!stakeAmount || parseFloat(stakeAmount) > ozoneBalance}
            sx={{
              background: 'linear-gradient(45deg, #00d4ff 30%, #0099cc 90%)',
              borderRadius: '8px'
            }}
          >
            Confirm Stake
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unstake Dialog */}
      <Dialog 
        open={unstakeDialogOpen} 
        onClose={() => setUnstakeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Unstake from {selectedPool?.poolName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={2}>
              You will receive your staked amount plus earned rewards.
            </Typography>
            <Card sx={{ 
              background: 'rgba(76, 175, 80, 0.1)', 
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '12px'
            }}>
              <CardContent>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                  Total to Receive:
                </Typography>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {selectedPool && formatNumber(selectedPool.amount + selectedPool.rewards)} OZONE
                </Typography>
                <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <Box display="flex" justify="space-between">
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                    Staked Amount: {selectedPool && formatNumber(selectedPool.amount)} OZONE
                  </Typography>
                </Box>
                <Box display="flex" justify="space-between">
                  <Typography variant="body2" color="#4caf50">
                    Earned Rewards: +{selectedPool && formatNumber(selectedPool.rewards)} OZONE
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUnstakeDialogOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUnstake}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              borderRadius: '8px'
            }}
          >
            Confirm Unstake
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StakingView;
