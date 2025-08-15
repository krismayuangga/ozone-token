import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ResponsiveLayout from './ResponsiveLayout';
import { Box, CircularProgress } from '@mui/material';

const MainContent = () => {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 80px)"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Use the new responsive layout
  return <ResponsiveLayout />;
};

export default MainContent;
