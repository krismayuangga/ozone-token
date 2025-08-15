import React, { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import BottomNavigation from './BottomNavigation';
import UserDashboard from './UserDashboard';
import PoolsView from './PoolsView';
import StakingView from './StakingView';
import PortfolioView from './PortfolioView';
import SettingsView from './SettingsView';

const MobileLayout = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      // For unauthenticated users, show pools but allow navigation to see all views
      switch (currentTab) {
        case 'pools':
        default:
          return <PoolsView />;
        case 'dashboard':
          return <PoolsView />; // Redirect to pools for non-auth users
        case 'staking':
          return <PoolsView />; // Redirect to pools for non-auth users  
        case 'portfolio':
          return <PoolsView />; // Redirect to pools for non-auth users
        case 'settings':
          return <SettingsView />;
      }
    }

    switch (currentTab) {
      case 'dashboard':
        return <UserDashboard />;
      case 'pools':
        return <PoolsView />;
      case 'staking':
        return <StakingView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Desktop Navigation - Left Sidebar */}
      {!isMobile && (
        <DesktopNavigation 
          currentTab={currentTab} 
          onTabChange={handleTabChange} 
        />
      )}
      
      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          paddingBottom: isMobile ? '70px' : 0,
          marginLeft: !isMobile ? 0 : 0, // DesktopNavigation handles its own width
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            padding: isMobile ? '16px' : '24px',
            minHeight: '100vh',
            paddingTop: isMobile ? '16px' : '100px', // Extra space for navbar on desktop
          }}
        >
          {renderContent()}
        </Container>
      </Box>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation 
          currentTab={currentTab} 
          onTabChange={handleTabChange} 
        />
      )}
    </Box>
  );
};

export default MobileLayout;
