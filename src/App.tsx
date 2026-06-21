import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppShell } from './app/AppShell';
import { appTheme } from './app/theme';

export function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppShell />
    </ThemeProvider>
  );
}
