import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from './components/AppBar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import DrivesPage from './pages/DrivesPage';
import ReportsPage from './pages/ReportsPage';
import VaccinesPage from './pages/VaccinesPage';

// Custom MUI theme for vaccination portal
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
    },
    secondary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#087f23',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#1976d2',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      color: '#333',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        },
        containedSecondary: {
          backgroundColor: '#4caf50',
          '&:hover': {
            backgroundColor: '#43a047',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '16px',
        },
      },
    },
  },
});


// PrivateRoute component to protect routes
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('loggedin') === 'true';
  const location = useLocation();

  return isLoggedIn ? children : <Navigate to="/" state={{ from: location }} replace />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('loggedin') === 'true');
  const [role, setRole] = useState(localStorage.getItem('role') || 'coordinator');

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('loggedin') === 'true');
      setRole(localStorage.getItem('role') || 'coordinator');
    };
    window.addEventListener('storage', checkLoginStatus);
    checkLoginStatus();
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedin');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setRole('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isLoggedIn && (
          <AppBar
            onLogout={handleLogout}
          />
        )}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <StudentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/drives"
            element={
              <PrivateRoute>
                <DrivesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/vaccines"
            element={
              <PrivateRoute>
                <VaccinesPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;