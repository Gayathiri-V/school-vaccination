import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';

const api = process.env.REACT_APP_API_URL;

function ReportsPage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api}/api/reports`);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched records:', {
        count: data.length,
        sample: data.slice(0, 5),
      });
      setRecords(data);
      setError('');
    } catch (err) {
      console.error('Fetch records error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: `${api}/api/reports`,
      });
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const columns = [
    {
      field: 'studentId',
      headerName: 'Student ID',
      flex: 1,
      filterable: true,
      valueGetter: (params) => params || '',
    },
    {
      field: 'studentName',
      headerName: 'Student Name',
      flex: 1,
      filterable: true,
      valueGetter: (params) => params || '',
    },
    {
      field: 'vaccineName',
      headerName: 'Vaccine Name',
      flex: 1,
      filterable: true,
      valueGetter: (params) => params || '',
    },
    {
      field: 'vaccination',
      headerName: 'Vaccination',
      flex: 1,
      filterable: true,
      type: 'singleSelect',
      valueOptions: ['Yes', 'No'],
      valueGetter: (params) => params || 'No',
    },
    {
      field: 'drive',
      headerName: 'Drive Name',
      flex: 1,
      filterable: true,
      valueGetter: (params) => params || '',
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      type: 'date',
      valueGetter: (params) => {
        if (!params || typeof params !== 'string') {
          return null;
        }
        const date = new Date(params);
        return isNaN(date.getTime()) ? null : date;
      },
      renderCell: (params) => (params.value ? format(params.value, 'yyyy-MM-dd') : ''),
      filterable: true,
    },
  ];

  // Process raw data into rows
  const rows = records.flatMap((student) => {
    const vaccines = student.vaccines || [];
    const vaccinations = student.vaccinations || [];
    const drives = student.drives || [];

    // Generate one row per vaccine for the student
    return vaccines.map((vaccine) => {
      // Find vaccinations for this student and vaccine
      const relevantVaccinations = vaccinations.filter((vaccination) => {
        const drive = drives.find((d) => d._id.toString() === vaccination.driveId?.toString());
        return drive && drive.vaccineId?.toString() === vaccine._id?.toString();
      });

      // Get the earliest vaccination date and corresponding drive name
      let earliestDate = null;
      let driveName = null;
      if (relevantVaccinations.length > 0) {
        const vaccinationDrives = relevantVaccinations
          .map((vaccination) => {
            const drive = drives.find((d) => d._id.toString() === vaccination.driveId?.toString());
            console.log('drive', drive)
            return {
              driveName: drive?.name,
              date: drive?.date ? new Date(drive.date) : null,
            };
          })
          .filter((vd) => vd.date && !isNaN(vd.date.getTime()));

        console.log('drives', vaccinationDrives)

        if (vaccinationDrives.length > 0) {
          const earliest = vaccinationDrives.reduce((min, curr) =>
            min.date < curr.date ? min : curr
          );
          earliestDate = earliest.date.toISOString();
          driveName = earliest.driveName;
        }
      }

      return {
        id: `${student._id || 'unknown'}-${vaccine._id || 'unknown'}`,
        studentId: student.id || '',
        studentName: student.name || '',
        vaccineName: vaccine.name || '',
        vaccination: relevantVaccinations.length > 0 ? 'Yes' : 'No',
        drive: driveName,
        date: earliestDate || null,
      };
    });
  }).sort((a, b) => (a.studentId || '').localeCompare(b.studentId || ''));

  console.log('Rows prepared:', { count: rows.length, sample: rows.slice(0, 5) });

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
        Vaccination Report
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
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
        }}
      >
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            showToolbar
            rows={rows}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: {
                sortModel: [{ field: 'studentId', sort: 'asc' }],
              },
            }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#e8eaf6',
                color: '#1a237e',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#e3f2fd',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default ReportsPage;