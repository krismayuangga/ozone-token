import { createTheme } from '@mui/material/styles';

// Tema OZONE Nikel Mining - Real World Assets
export const ozoneTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2DD4BF', // Teal - warna nikel
      light: '#5EEAD4',
      dark: '#14B8A6',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#F59E0B', // Amber - warna emas/tambang
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#000000'
    },
    background: {
      default: '#0F172A', // Slate dark
      paper: '#1E293B',
      card: '#334155',
      gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      disabled: '#64748B'
    },
    success: {
      main: '#10B981', // Emerald
      light: '#34D399',
      dark: '#059669'
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FCD34D', 
      dark: '#D97706'
    },
    error: {
      main: '#EF4444', // Red
      light: '#F87171',
      dark: '#DC2626'
    },
    info: {
      main: '#3B82F6', // Blue
      light: '#60A5FA',
      dark: '#2563EB'
    },
    // Custom colors untuk mining theme
    mining: {
      nickel: '#2DD4BF',
      ore: '#64748B', 
      metal: '#94A3B8',
      gold: '#F59E0B',
      platinum: '#E5E7EB',
      industrial: '#374151'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #2DD4BF 0%, #F59E0B 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#F8FAFC'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#F8FAFC'
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#CBD5E1'
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      color: '#CBD5E1'
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#CBD5E1'
    },
    body1: {
      fontSize: '1rem',
      color: '#CBD5E1'
    },
    body2: {
      fontSize: '0.875rem',
      color: '#94A3B8'
    },
    caption: {
      fontSize: '0.75rem',
      color: '#64748B'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(45, 212, 191, 0.1)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(45, 212, 191, 0.2), 0 0 0 1px rgba(45, 212, 191, 0.3)',
            borderColor: 'rgba(45, 212, 191, 0.4)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s ease-in-out'
        },
        contained: {
          background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
          boxShadow: '0 4px 16px rgba(45, 212, 191, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
            boxShadow: '0 6px 20px rgba(45, 212, 191, 0.4)',
            transform: 'translateY(-2px)'
          },
          '&:disabled': {
            background: 'rgba(100, 116, 139, 0.3)',
            color: 'rgba(203, 213, 225, 0.5)'
          }
        },
        outlined: {
          borderColor: 'rgba(45, 212, 191, 0.5)',
          color: '#2DD4BF',
          '&:hover': {
            borderColor: '#2DD4BF',
            backgroundColor: 'rgba(45, 212, 191, 0.1)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500
        },
        filled: {
          background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, rgba(20, 184, 166, 0.3) 100%)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          color: '#2DD4BF'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(45, 212, 191, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          border: '1px solid rgba(45, 212, 191, 0.1)',
          borderRadius: '12px'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          background: 'rgba(100, 116, 139, 0.3)',
          borderRadius: '4px',
          height: '8px'
        },
        bar: {
          background: 'linear-gradient(90deg, #2DD4BF 0%, #14B8A6 100%)',
          borderRadius: '4px'
        }
      }
    }
  }
});

// Mining-specific gradient backgrounds
export const miningGradients = {
  nickelShine: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 50%, #14B8A6 100%)',
  goldOre: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #D97706 100%)',
  platinumGlow: 'linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 50%, #D1D5DB 100%)',
  industrialMetal: 'linear-gradient(135deg, #374151 0%, #4B5563 50%, #6B7280 100%)',
  darkOre: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
  emeraldMine: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #059669 100%)'
};
