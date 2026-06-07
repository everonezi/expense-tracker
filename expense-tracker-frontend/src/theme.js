import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    success: { main: '#2e7d32' },
    error: { main: '#d32f2f' },
    background: { default: '#f5f5f5' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'Roboto, sans-serif' },
})

export default theme
