import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  NetworkWifi,
  Business,
  Menu as MenuIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Helper functions
const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatNumber = (value) => {
  if (!value || isNaN(value)) return '0';
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
};

const Navbar = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated,
    isConnecting, 
    connectWallet, 
    logout 
  } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [navMenuAnchor, setNavMenuAnchor] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavMenuClick = (event) => {
    setNavMenuAnchor(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchor(null);
  };

  const handleDisconnect = () => {
    logout();
    handleMenuClose();
  };

  const navItems = [
    { label: 'Dashboard', path: '/' },
    ...(user?.isAdmin ? [{ label: 'Admin', path: '/admin' }] : [])
  ];

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Toolbar>
        {/* Logo and Company Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar sx={{ 
            bgcolor: '#2DD4BF',
            mr: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <Business />
          </Avatar>
          <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              OZONE
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(45, 212, 191, 0.8)',
              fontSize: '0.7rem',
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              Staking Platform
            </Typography>
          </Box>
        </Box>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 1,
            mr: 3
          }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(45, 212, 191, 0.1)',
                    color: '#2DD4BF',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile Navigation Menu */}
        {isAuthenticated && (
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }}>
            <IconButton
              color="inherit"
              onClick={handleNavMenuClick}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={navMenuAnchor}
              open={Boolean(navMenuAnchor)}
              onClose={handleNavMenuClose}
            >
              {navItems.map((item) => (
                <MenuItem 
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    handleNavMenuClose();
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Network Indicator */}
          <Chip
            icon={<NetworkWifi />}
            label="BSC Testnet"
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.2)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          />

          {/* Wallet Connection */}
          {isAuthenticated ? (
            <>
              <Box sx={{ 
                textAlign: 'right',
                display: { xs: 'none', sm: 'block' }
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#2DD4BF',
                  fontWeight: 600
                }}>
                  {formatNumber(user?.totalStaked || 0)} OZONE
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.8rem'
                }}>
                  {shortenAddress(user?.walletAddress)}
                </Typography>
              </Box>
              
              <IconButton
                onClick={handleMenuClick}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px rgba(45, 212, 191, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <AccountBalanceWallet />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    bgcolor: 'rgba(30, 41, 59, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    minWidth: 200
                  }
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(45, 212, 191, 0.2)' }}>
                  <Typography variant="body2" sx={{ color: '#2DD4BF' }}>
                    {formatNumber(user?.totalStaked || 0)} OZONE
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {shortenAddress(user?.walletAddress)}
                  </Typography>
                </Box>
                <MenuItem 
                  onClick={handleDisconnect}
                  sx={{ 
                    color: '#EF4444',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <AccountBalanceWallet sx={{ mr: 1 }} />
                  Disconnect Wallet
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccountBalanceWallet />}
              onClick={connectWallet}
              disabled={isConnecting}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(45, 212, 191, 0.4)'
                },
                '&:disabled': {
                  background: 'rgba(100, 116, 139, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
