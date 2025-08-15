import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Notifications,
  Security,
  Language,
  Palette,
  AccountCircle,
  Email,
  Logout,
  Info
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const SettingsView = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const { user, disconnect } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    disconnect();
  };

  const handleSaveProfile = () => {
    // Implement profile save logic
    console.log('Saving profile:', { username, email });
    setProfileDialogOpen(false);
  };

  const SettingsCard = ({ title, children }) => (
    <Card sx={{
      background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      mb: 3
    }}>
      <CardContent>
        <Typography variant="h6" color="white" fontWeight="bold" mb={2}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight="bold"
        color="white"
        gutterBottom
      >
        Settings
      </Typography>
      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={3}>
        Customize your OZONE staking experience
      </Typography>

      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} md={8}>
          {/* Account Settings */}
          <SettingsCard title="Account Settings">
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountCircle sx={{ color: '#00d4ff' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography color="white">Profile Information</Typography>}
                  secondary={
                    <Typography color="rgba(255, 255, 255, 0.7)">
                      Update your username and email
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setProfileDialogOpen(true)}
                    sx={{
                      borderColor: '#00d4ff',
                      color: '#00d4ff',
                      '&:hover': { backgroundColor: 'rgba(0, 212, 255, 0.1)' }
                    }}
                  >
                    Edit
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
              <ListItem>
                <ListItemIcon>
                  <Security sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography color="white">Wallet Connected</Typography>}
                  secondary={
                    <Typography color="rgba(255, 255, 255, 0.7)" sx={{ wordBreak: 'break-all' }}>
                      {user?.walletAddress || 'Not connected'}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </SettingsCard>

          {/* Notification Settings */}
          <SettingsCard title="Notifications">
            <List>
              <ListItem>
                <ListItemIcon>
                  <Notifications sx={{ color: '#ffc107' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography color="white">Push Notifications</Typography>}
                  secondary={
                    <Typography color="rgba(255, 255, 255, 0.7)">
                      Receive notifications about your stakes
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#00d4ff' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00d4ff' }
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
              <ListItem>
                <ListItemIcon>
                  <Email sx={{ color: '#9c27b0' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography color="white">Email Notifications</Typography>}
                  secondary={
                    <Typography color="rgba(255, 255, 255, 0.7)">
                      Receive email updates about rewards
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#00d4ff' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00d4ff' }
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingsCard>

          {/* Appearance Settings */}
          <SettingsCard title="Appearance">
            <List>
              <ListItem>
                <ListItemIcon>
                  <Palette sx={{ color: '#e91e63' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography color="white">Dark Mode</Typography>}
                  secondary={
                    <Typography color="rgba(255, 255, 255, 0.7)">
                      Use dark theme for better night viewing
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#00d4ff' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00d4ff' }
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
              <ListItem>
                <ListItemIcon>
                  <Language sx={{ color: '#2196f3' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography color="white">Language</Typography>}
                  secondary={
                    <Typography color="rgba(255, 255, 255, 0.7)">
                      Choose your preferred language
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    English
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SettingsCard>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <SettingsCard title="Quick Actions">
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Info />}
                sx={{
                  borderColor: '#00d4ff',
                  color: '#00d4ff',
                  justifyContent: 'flex-start',
                  borderRadius: '12px',
                  padding: '12px',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(0, 212, 255, 0.1)' }
                }}
              >
                Help & Support
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  justifyContent: 'flex-start',
                  borderRadius: '12px',
                  padding: '12px',
                  textTransform: 'none',
                  '&:hover': { 
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderColor: '#f44336'
                  }
                }}
              >
                Disconnect Wallet
              </Button>
            </Box>
          </SettingsCard>

          {/* System Info */}
          <SettingsCard title="System Information">
            <Box>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={1}>
                App Version: 1.0.0
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={1}>
                Network: BSC Testnet
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" mb={2}>
                Last Updated: Feb 15, 2024
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: '#2196f3' }
                }}
              >
                You're using the latest version of OZONE Staking Platform
              </Alert>
            </Box>
          </SettingsCard>
        </Grid>
      </Grid>

      {/* Profile Edit Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={() => setProfileDialogOpen(false)}
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
          Edit Profile Information
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#00d4ff' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setProfileDialogOpen(false)} 
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #00d4ff 30%, #0099cc 90%)',
              borderRadius: '8px'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsView;
