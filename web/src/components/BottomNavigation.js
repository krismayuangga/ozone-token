import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Waves as PoolIcon,
  AccountBalance as StakingIcon,
  TrendingUp as PortfolioIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const BottomNav = ({ currentTab, onTabChange }) => {
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(10px)',
        '@media (min-width: 768px)': {
          display: 'none'
        }
      }} 
      elevation={8}
    >
      <BottomNavigation
        value={currentTab}
        onChange={(event, newValue) => onTabChange(newValue)}
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(255, 255, 255, 0.6)',
            minWidth: 'auto',
            padding: '6px 0',
            '&.Mui-selected': {
              color: '#00d4ff',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            marginTop: '4px',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            }
          }
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="dashboard"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label="Pools"
          value="pools"
          icon={<PoolIcon />}
        />
        <BottomNavigationAction
          label="Staking"
          value="staking"
          icon={<StakingIcon />}
        />
        <BottomNavigationAction
          label="Portfolio"
          value="portfolio"
          icon={<PortfolioIcon />}
        />
        <BottomNavigationAction
          label="Settings"
          value="settings"
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
