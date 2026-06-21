import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    background: {
      default: '#f7f8fb',
      paper: '#ffffff'
    },
    primary: {
      main: '#3157d5'
    },
    text: {
      primary: '#172033',
      secondary: '#52627a'
    }
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2.4rem, 7vw, 5rem)',
      fontWeight: 800,
      letterSpacing: '-0.06em',
      lineHeight: 0.95
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 700
    },
    body1: {
      lineHeight: 1.8
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #dde3ee',
          boxShadow: '0 16px 40px rgb(23 32 51 / 8%)'
        }
      }
    }
  }
});
