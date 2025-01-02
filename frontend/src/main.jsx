import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import ShopContextProvider from './context/ShopContext.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a custom theme (optional)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Primary color
    },
    secondary: {
      main: '#9c27b0', // Secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Font family
  },
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ShopContextProvider>
      <ThemeProvider theme={theme}> {/* Wrapping your app with ThemeProvider */}
        <App />
      </ThemeProvider>
    </ShopContextProvider>
  </BrowserRouter>
);