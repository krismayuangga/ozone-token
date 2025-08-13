import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { ethers } from 'ethers';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  // Verify stored token
  const verifyToken = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        return null;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  }, []);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setAccount(account);

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setProvider(provider);
      setSigner(signer);

      // Get signature message
      const nonceResponse = await fetch(`${API_BASE_URL}/auth/nonce/${account}`);
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }
      
      const { data: { message } } = await nonceResponse.json();

      // Sign message
      const signature = await signer.signMessage(message);

      // Authenticate with backend
      const authResponse = await fetch(`${API_BASE_URL}/auth/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account,
          signature,
          message
        }),
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const { data } = await authResponse.json();
      
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      setUser(data.user);

      return data.user;

    } catch (error) {
      console.error('Connect wallet error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Get current user data
  const getCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        localStorage.removeItem('authToken');
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      return null;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    setAccount(null);
    setSigner(null);
  }, []);

  // API call with auth
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired, logout
      logout();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API call failed');
    }

    return response.json();
  }, [logout]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);
            
            // Check for stored token
            const token = localStorage.getItem('authToken');
            if (token) {
              await verifyToken(token);
            }
          }
        }
      } catch (error) {
        console.error('Initialize auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [verifyToken]);

  const value = {
    // State
    user,
    isLoading,
    isConnecting,
    isAuthenticated: !!user,
    account,
    provider,
    signer,

    // Methods
    connectWallet,
    logout,
    getCurrentUser,
    apiCall,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
