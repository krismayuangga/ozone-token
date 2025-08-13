/**
 * Utility functions for formatting numbers, tokens, and currencies
 */

// Format number to display with proper decimals and separators
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return '0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};

// Format token amount (handles big numbers and wei conversion if needed)
export const formatTokenAmount = (amount, decimals = 18, displayDecimals = 6) => {
  if (amount === null || amount === undefined || amount === '') {
    return '0.000000';
  }
  
  let numAmount;
  
  if (typeof amount === 'string') {
    // If it's a string number, parse it
    numAmount = parseFloat(amount);
  } else if (typeof amount === 'number') {
    numAmount = amount;
  } else {
    return '0.000000';
  }
  
  if (isNaN(numAmount)) {
    return '0.000000';
  }
  
  // If the number is very large, it might be in wei (need to divide by 10^18)
  if (numAmount > 1e15) {
    numAmount = numAmount / Math.pow(10, decimals);
  }
  
  return formatNumber(numAmount, displayDecimals);
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  const formatted = formatNumber(value, decimals);
  return `${formatted}%`;
};

// Format currency (USD)
export const formatCurrency = (value, currency = 'USD', decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return '$0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};

// Shorten wallet address
export const shortenAddress = (address, startChars = 4, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars + 2)}...${address.slice(-endChars)}`;
};

// Format time duration
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  
  const units = [
    { name: 'd', value: 86400 },
    { name: 'h', value: 3600 },
    { name: 'm', value: 60 },
    { name: 's', value: 1 }
  ];
  
  const parts = [];
  let remainingSeconds = Math.floor(seconds);
  
  for (const unit of units) {
    const count = Math.floor(remainingSeconds / unit.value);
    if (count > 0) {
      parts.push(`${count}${unit.name}`);
      remainingSeconds -= count * unit.value;
    }
    
    // Only show first 2 units for readability
    if (parts.length >= 2) break;
  }
  
  return parts.length > 0 ? parts.join(' ') : '0s';
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
};

// Format large numbers with K, M, B suffixes
export const formatLargeNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  const absValue = Math.abs(numValue);
  
  if (absValue >= 1e9) {
    return formatNumber(numValue / 1e9, decimals) + 'B';
  } else if (absValue >= 1e6) {
    return formatNumber(numValue / 1e6, decimals) + 'M';
  } else if (absValue >= 1e3) {
    return formatNumber(numValue / 1e3, decimals) + 'K';
  } else {
    return formatNumber(numValue, decimals);
  }
};

// Safe number conversion
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return isNaN(numValue) ? defaultValue : numValue;
};
