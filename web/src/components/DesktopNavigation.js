import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Waves as PoolIcon,
  AccountBalance as StakingIcon,
  TrendingUp as PortfolioIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const DesktopNavigation = ({ currentTab, onTabChange }) => {
  const theme = useTheme();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      description: 'Overview & Statistics'
    },
    {
      id: 'pools',
      label: 'Staking Pools',
      icon: <PoolIcon />,
      description: 'Available Pools'
    },
    {
      id: 'staking',
      label: 'My Staking',
      icon: <StakingIcon />,
      description: 'Active Stakes'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <PortfolioIcon />,
      description: 'Performance & History'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      description: 'Account & Preferences'
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#0a0a0a',
          borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          paddingTop: '70px', // Reduced space for navbar
          overflow: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.2),
            borderRadius: '3px',
          },
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            mb: 1
          }}
        >
          Navigation
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            mb: 2
          }}
        >
          Manage your OZONE staking
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, borderColor: alpha(theme.palette.primary.main, 0.12) }} />

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => onTabChange(item.id)}
              selected={currentTab === item.id}
              sx={{
                borderRadius: 2,
                minHeight: 60,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: currentTab === item.id 
                    ? theme.palette.primary.main 
                    : 'text.secondary',
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: currentTab === item.id ? 600 : 500,
                      color: currentTab === item.id 
                        ? theme.palette.primary.main 
                        : 'text.primary',
                    }}
                  >
                    {item.label}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                    }}
                  >
                    {item.description}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.primary.main, 0.12) }} />
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              display: 'block',
              mb: 0.5
            }}
          >
            OZONE Staking Platform
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 500
            }}
          >
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DesktopNavigation;
