import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function AppShell() {
  return (
    <Box component="main" aria-labelledby="app-title" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4 }}>
            <Stack spacing={2}>
              <Chip
                label="Local development timeline"
                color="primary"
                variant="outlined"
                sx={{ alignSelf: 'flex-start', fontWeight: 700, letterSpacing: '0.08em' }}
              />
              <Typography id="app-title" component="h1" variant="h1">
                SpecLens Timeline
              </Typography>
              <Typography color="text.secondary" variant="body1">
                cc-sddで進めるReact/Vite開発の流れを、ローカルだけで記録して見返すための
                アプリです。
              </Typography>
            </Stack>
          </Paper>

          <Paper component="section" elevation={0} aria-label="初期状態" sx={{ p: 4, borderRadius: 4 }}>
            <Stack spacing={1}>
              <Typography component="h2" variant="h2">
                ログインなしで利用できます
              </Typography>
              <Typography color="text.secondary">
                初期セットアップ中です。タイムライン機能は後続タスクでTDD実装します。
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
