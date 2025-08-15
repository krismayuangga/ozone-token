import React, { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import BottomNavigation from './BottomNavigation';
import DesktopNavigation from './DesktopNavigation';
import UserDashboard from './UserDashboard';
import PoolsView from './PoolsView';
import StakingView from './StakingView';
import PortfolioView from './PortfolioView';
import SettingsView from './SettingsView';

const ResponsiveLayout = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
  };

  const renderContent = () => {
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
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            padding: isMobile ? '16px' : '32px',
            minHeight: '100vh',
            paddingTop: isMobile ? '16px' : '24px', // Less padding for desktop since navbar is static
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

export default ResponsiveLayout;
