import { createTheme } from '@mui/material/styles';

// Mac-style theme configuration
export const macTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Mac blue
      light: '#4DA6FF',
      dark: '#0056CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5856D6', // Mac purple
      light: '#7A78E0',
      dark: '#3D3B9E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF', // Pure white background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#343A40', // Dark muted blue/charcoal for headings
      secondary: '#6C757D', // Medium-dark gray for paragraphs
    },
    grey: {
      50: '#F9F9F9',
      100: '#F2F2F7',
      200: '#E5E5EA',
      300: '#D1D1D6',
      400: '#C7C7CC',
      500: '#AEAEB2',
      600: '#8E8E93',
      700: '#636366',
      800: '#48484A',
      900: '#1C1C1E',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: '#343A40',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: '#343A40',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#343A40',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#343A40',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#343A40',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#343A40',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#6C757D',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6C757D',
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12, // Mac-style rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          backgroundColor: '#007AFF',
          '&:hover': {
            backgroundColor: '#0056CC',
          },
        },
        outlined: {
          borderColor: '#007AFF',
          color: '#007AFF',
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
            borderColor: '#0056CC',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'background.paper',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#007AFF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#007AFF',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#F2F2F7',
          color: '#1D1D1F',
          '&:hover': {
            backgroundColor: '#E5E5EA',
          },
        },
      },
    },
  },
});

// Dark theme variant
export const macDarkTheme = createTheme({
  ...macTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF', // Mac dark blue
      light: '#4DA6FF',
      dark: '#0056CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5E5CE6', // Mac dark purple
      light: '#7A78E0',
      dark: '#3D3B9E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0A0A', // Very dark background similar to fractal image
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF', // Pure white text for headings
      secondary: '#E5E5E5', // Light gray for paragraphs
    },
  },
  typography: {
    ...macTheme.typography,
    h1: {
      ...macTheme.typography.h1,
      color: '#FFFFFF',
    },
    h2: {
      ...macTheme.typography.h2,
      color: '#FFFFFF',
    },
    h3: {
      ...macTheme.typography.h3,
      color: '#FFFFFF',
    },
    h4: {
      ...macTheme.typography.h4,
      color: '#FFFFFF',
    },
    h5: {
      ...macTheme.typography.h5,
      color: '#FFFFFF',
    },
    h6: {
      ...macTheme.typography.h6,
      color: '#FFFFFF',
    },
    body1: {
      ...macTheme.typography.body1,
      color: '#E5E5E5',
    },
    body2: {
      ...macTheme.typography.body2,
      color: '#E5E5E5',
    },
  },
  components: {
    ...macTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
  },
});
