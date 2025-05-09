import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import LogoutIcon from '@mui/icons-material/Logout';

const coordinatorLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  { label: 'Drives', path: '/drives', icon: <EventIcon /> },
  { label: 'Vaccines', path: '/vaccines', icon: <VaccinesIcon /> },
  { label: 'Students', path: '/students', icon: <PeopleIcon /> },
];

function CustomAppBar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = coordinatorLinks;

  return (
    <>
      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            School Vaccination Portal
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, textAlign: 'center', alignItems: 'center' }}>
            {/* {links.map((link) => (
              <Tooltip title={link.label} key={link.path}>
                <IconButton
                  color={location.pathname === link.path ? 'primary' : 'inherit'}
                  onClick={() => navigate(link.path)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {link.icon}
                </IconButton>
              </Tooltip>
            ))} */}
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={onLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Bottom AppBar with Navigation Icons */}
      <AppBar
        position="fixed"
        color="default"
        sx={{
          top: 'auto',
          bottom: 0,
          boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
          py: 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {links.map((link) => (
              <Tooltip title={link.label} key={link.path}>
                <IconButton
                  color={location.pathname === link.path ? 'primary' : 'default'}
                  onClick={() => navigate(link.path)}
                  sx={{
                    borderRadius: '8px',
                    border: location.pathname === link.path ? '1px solid #1976d2' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {link.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default CustomAppBar;