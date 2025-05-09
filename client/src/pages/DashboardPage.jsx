import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Alert,
  IconButton,
  TableContainer,
} from '@mui/material';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';

const api = process.env.REACT_APP_API_URL;

function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    vaccinatedStudents: 0,
    upcomingDrives: [],
    chartData: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${api}/api/dashboard`);
      const rawData = Array.isArray(response.data) ? response.data : [];

      // Process raw data
      const totalStudents = rawData.length;
      const vaccinatedStudents = rawData.filter(student =>
        (student.vaccinations || []).length > 0
      ).length;

      // Filter upcoming drives (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);
      const upcomingDrives = rawData
        .flatMap(student => student.drives || [])
        .filter(drive => {
          const driveDate = new Date(drive.date);
          return (
            drive.enabled &&
            driveDate >= today &&
            driveDate <= thirtyDaysFromNow
          );
        })
        .map(drive => {
          // Find vaccine name
          const vaccine = rawData
            .flatMap(s => s.vaccines || [])
            .find(v => v._id.toString() === drive.vaccineId?.toString());
          // Count vaccinations for this drive
          const vaccinationCount = rawData
            .flatMap(s => s.allVaccinations || [])
            .filter(v => v.driveId?.toString() === drive._id.toString()).length;
          return {
            _id: drive._id,
            vaccineName: vaccine?.name || 'Unknown',
            date: drive.date,
            totalDoses: drive.totalDoses,
            availableDoses: drive.totalDoses - vaccinationCount,
            applicableClasses: drive.applicableClasses || 'N/A',
          };
        })
        .filter((drive, index, self) =>
          index === self.findIndex(d => d._id.toString() === drive._id.toString())
        );

      // Prepare chart data for vaccines
      const vaccines = rawData
        .flatMap(student => student.vaccines || [])
        .filter((vaccine, index, self) =>
          index === self.findIndex(v => v._id.toString() === vaccine._id.toString())
        );
      const chartData = vaccines.map(vaccine => {
        const vaccinatedCount = rawData.filter(student => {
          const hasVaccination = (student.vaccinations || []).some(vaccination => {
            const drive = (student.drives || []).find(d =>
              d._id.toString() === vaccination.driveId?.toString()
            );
            return drive && drive.vaccineId?.toString() === vaccine._id.toString();
          });
          return hasVaccination;
        }).length;
        const percentage = totalStudents > 0
          ? ((vaccinatedCount / totalStudents) * 100).toFixed(0)
          : 0;
        return {
          name: `${vaccine.name || 'Unknown'} (${percentage}%)`,
          vaccinatedCount,
          unvaccinatedCount: totalStudents - vaccinatedCount,
        };
      });

      setDashboardData({
        totalStudents,
        vaccinatedStudents,
        upcomingDrives,
        chartData,
      });
      setError('');
    } catch (err) {
      console.error('Fetch dashboard error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('Failed to fetch dashboard data');
    }
  };

  const handleRowClick = (driveId) => {
    navigate(`/drives?driveId=${driveId}`);
  };

  const handleCloseError = () => {
    setError('');
  };

  // Prepare data for existing drive doses bar chart
  const driveChartData = dashboardData.upcomingDrives.map(drive => ({
    name: format(new Date(drive.date), 'MMM dd'),
    doses: drive.availableDoses,
  }));

  return (
    <Box
      sx={{
        mt: 8,
        mb: 8,
        p: { xs: 2, md: 3 },
        maxWidth: 1400,
        mx: 'auto',
        background: 'linear-gradient(180deg, #f5f7fa 0%, #e4e7eb 100%)',
        borderRadius: 3,
        minHeight: '80vh',
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#1a237e',
          textAlign: 'center',
          mb: 4,
        }}
      >
        Vaccination Dashboard
      </Typography>
      {error && (
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={handleCloseError}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tooltip title="Total number of students registered in the system">
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #7986cb 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6">Total Students</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {dashboardData.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tooltip title="Number of students who have received at least one vaccination">
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #f06292 0%, #f48fb1 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VerifiedIcon sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6">Vaccinated Students</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {dashboardData.vaccinatedStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tooltip title="Number of vaccination drives scheduled in the next 30 days">
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6">Upcoming Drives</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {dashboardData.upcomingDrives.length}
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </motion.div>
        </Grid>
      </Grid>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
          mb: 5,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Vaccination Status by Vaccine
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="vaccinatedCount" stackId="a" fill="#4caf50" name="Vaccinated" />
              <Bar dataKey="unvaccinatedCount" stackId="a" fill="#f44336" name="Unvaccinated" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Upcoming Vaccination Drives (Next 30 Days)
        </Typography>
        {dashboardData.upcomingDrives.length === 0 ? (
          <Typography color="text.secondary">No upcoming drives</Typography>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e8eaf6' }}>Vaccine Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e8eaf6' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e8eaf6' }}>Doses</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e8eaf6' }}>Classes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.upcomingDrives.map((drive) => (
                    <TableRow
                      key={drive._id}
                      onClick={() => handleRowClick(drive._id)}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                        '&:hover': { backgroundColor: '#e3f2fd', transition: 'background-color 0.2s' },
                      }}
                    >
                      <TableCell>{drive.vaccineName}</TableCell>
                      <TableCell>{format(new Date(drive.date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{drive.totalDoses}</TableCell>
                      <TableCell>{drive.applicableClasses.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* <Box sx={{ mt: 4, height: 300 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Drive Doses Overview
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driveChartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="doses" fill="#3f51b5" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
          </>
        )}
      </Paper>
    </Box>
  );
}

export default DashboardPage;