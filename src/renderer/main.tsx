import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// macOS-inspired theme with dynamic mode support
const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#007AFF', // macOS blue
    },
    secondary: {
      main: '#5856D6', // macOS purple
    },
    error: {
      main: '#FF3B30', // macOS red
    },
    warning: {
      main: '#FF9500', // macOS orange
    },
    success: {
      main: '#34C759', // macOS green
    },
    info: {
      main: '#5AC8FA', // macOS light blue
    },
    background: {
      default: mode === 'dark' ? '#1e1e1e' : '#f5f5f7', // macOS light gray
      paper: mode === 'dark' ? '#2d2d2d' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#1d1d1f', // macOS dark text
      secondary: mode === 'dark' ? '#8e8e93' : '#6e6e73', // macOS secondary text
    },
    divider: mode === 'dark' ? '#404040' : '#e5e5e7', // macOS divider
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
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // macOS-style rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: 'none',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          color: mode === 'dark' ? '#ffffff' : '#1d1d1f',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Default to light theme
let currentTheme = createAppTheme('light');

const AppWrapper: React.FC = () => {
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark'>('light');
  const [theme, setTheme] = React.useState(currentTheme);

  // Function to update theme
  const updateTheme = (mode: 'light' | 'dark') => {
    console.log('updateTheme called with mode:', mode);
    setThemeMode(mode);
    const newTheme = createAppTheme(mode);
    console.log('New theme created, updating state...');
    setTheme(newTheme);
  };

  // Expose theme update function globally
  React.useEffect(() => {
    (window as any).updateAppTheme = updateTheme;
  }, []);

  return (
    <ThemeProvider theme={theme} key={themeMode}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
); 