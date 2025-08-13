import { ethers } from 'ethers';

// Format number with commas
export const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat().format(num);
};

// Format token amount (from wei to readable format)
export const formatTokenAmount = (amount, decimals = 18, fixed = 2) => {
  if (!amount) return '0';
  try {
    const formatted = ethers.formatUnits(amount.toString(), decimals);
    const number = parseFloat(formatted);
    return number.toFixed(fixed);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

// Parse token amount (from readable format to wei)
export const parseTokenAmount = (amount, decimals = 18) => {
  if (!amount || amount === '') return ethers.parseUnits('0', decimals);
  try {
    return ethers.parseUnits(amount.toString(), decimals);
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return ethers.parseUnits('0', decimals);
  }
};

// Shorten address (0x1234...5678)
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format time duration
export const formatDuration = (seconds) => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Format timestamp to readable date
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Calculate APY display format
export const formatAPY = (basisPoints) => {
  if (!basisPoints) return '0%';
  return `${(basisPoints / 100).toFixed(1)}%`;
};

// Validate Ethereum address
export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

// Convert seconds to days
export const secondsToDays = (seconds) => {
  return Math.floor(seconds / (24 * 60 * 60));
};

// Convert days to seconds
export const daysToSeconds = (days) => {
  return days * 24 * 60 * 60;
};

// Get remaining time
export const getRemainingTime = (startTime, lockPeriod) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + lockPeriod;
  const remaining = endTime - currentTime;
  
  if (remaining <= 0) return 0;
  return remaining;
};

// Check if lock period ended
export const isLockPeriodEnded = (startTime, lockPeriod) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= (startTime + lockPeriod);
};
