import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TableContainer,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import VaccinationsModal from './VaccinationsModal';

const api = process.env.REACT_APP_API_URL;

function DrivesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const driveId = query.get('driveId');
  const [drives, setDrives] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vaccinationModalOpen, setVaccinationModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    vaccineId: '',
    totalDoses: '',
    enabled: true,
    applicableClasses: '',
  });
  const [editDrive, setEditDrive] = useState(null);
  const [deleteDriveId, setDeleteDriveId] = useState(null);

  useEffect(() => {
    fetchDrives();
    fetchVaccines();
    fetchStudents();
    if (driveId) {
      const drive = drives.find(d => d._id === driveId);
      if (drive) {
        setSelectedDrive(drive);
        setVaccinationModalOpen(true);
      }
    }
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api}/api/drives/get-all`);
      setDrives(response.data);
    } catch (err) {
      setError('Failed to fetch drives');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      const response = await axios.get(`${api}/api/vaccines/get-all`);
      setVaccines(response.data);
    } catch (err) {
      setError('Failed to fetch vaccines');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${api}/api/students/get-all`);
      setStudents(response.data);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const handleCreateOpen = () => {
    setFormData({
      name: '',
      date: '',
      vaccineId: '',
      totalDoses: '',
      enabled: true,
      applicableClasses: '',
    });
    setDateError('');
    setError('');
    setCreateModalOpen(true);
  };

  const handleCreateClose = () => {
    setCreateModalOpen(false);
    setDateError('');
    setError('');
  };

  const handleDateChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (name === 'date') {
      const driveDate = new Date(value);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 15);
      if (driveDate < minDate) {
        setDateError('Drive must be scheduled at least 15 days in advance');
      } else {
        setDateError('');
      }
    }
    if (isEdit) {
      setEditDrive({ ...editDrive, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreateChange = (e) => {
    handleDateChange(e);
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateSubmit = async () => {
    if (dateError) return;
    setLoading(true);
    try {
      await axios.post(`${api}/api/drives/create`, {
        ...formData,
        totalDoses: parseInt(formData.totalDoses),
        applicableClasses: formData.applicableClasses,
      });
      setCreateModalOpen(false);
      fetchDrives();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (drive) => {
    setEditDrive({
      ...drive,
      date: format(new Date(drive.date), 'yyyy-MM-dd'),
      applicableClasses: drive.applicableClasses ? drive.applicableClasses.join(', ') : '',
    });
    setDateError('');
    setError('');
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    handleDateChange(e, true);
    const { name, value } = e.target;
    setEditDrive({ ...editDrive, [name]: value });
  };

  const handleEditSave = async () => {
    if (dateError) return;
    setLoading(true);
    try {
      await axios.put(`${api}/api/drives/update/${editDrive._id}`, {
        ...editDrive,
        totalDoses: parseInt(editDrive.totalDoses),
        applicableClasses: editDrive.applicableClasses,
      });
      setEditModalOpen(false);
      setEditDrive(null);
      fetchDrives();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update drive');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditDrive(null);
    setDateError('');
    setError('');
  };

  const handleDeleteClick = (id) => {
    setDeleteDriveId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await axios.delete(`${api}/api/drives/delete/${deleteDriveId}`);
      setDeleteModalOpen(false);
      setDeleteDriveId(null);
      fetchDrives();
      setError('');
    } catch (err) {
      setError('Failed to delete drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteDriveId(null);
    setError('');
  };

  const handleVaccinationModalOpen = (drive) => {
    setSelectedDrive(drive);
    setVaccinationModalOpen(true);
  };

  const handleVaccinationModalClose = () => {
    setVaccinationModalOpen(false);
    setSelectedDrive(null);
    navigate('/drives'); // Clear query param
  };

  return (
    <Box sx={{ mt: 8, mb: 8, p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
        Vaccination Drives
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateOpen}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Create Drive
      </Button>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Drives
        </Typography>
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
        {!loading && drives.length === 0 ? (
          <Typography>No upcoming drives</Typography>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Vaccine</TableCell>
                  <TableCell>Available Doses</TableCell>
                  <TableCell>Total Doses</TableCell>
                  <TableCell>Applicable Classes</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drives.map((drive) => (
                  <TableRow key={drive._id}>
                    <TableCell>{drive.name}</TableCell>
                    <TableCell>{format(new Date(drive.date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>
                      {vaccines.find((v) => v._id === drive.vaccineId)?._id ? drive.vaccineId.name : drive.vaccineId.name}
                    </TableCell>
                    <TableCell>{drive.availableDoses}</TableCell>
                    <TableCell>{drive.totalDoses}</TableCell>
                    <TableCell>{drive.applicableClasses ? drive.applicableClasses.join(', ') : ''}</TableCell>
                    <TableCell>{drive.enabled ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {new Date(drive.date) > new Date() && (
                        <IconButton onClick={() => handleEditClick(drive)} title="Edit Drive">
                          <Edit />
                        </IconButton>
                      )}
                      <IconButton onClick={() => handleDeleteClick(drive._id)} title="Delete Drive">
                        <Delete />
                      </IconButton>
                      <IconButton onClick={() => handleVaccinationModalOpen(drive)} title="View Vaccinations">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
      {/* Create Drive Modal */}
      <Dialog open={createModalOpen} onClose={handleCreateClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Drive</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Drive Name"
            name="name"
            value={formData.name}
            onChange={handleCreateChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleCreateChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          {dateError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {dateError}
            </Typography>
          )}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Vaccine</InputLabel>
            <Select
              name="vaccineId"
              value={formData.vaccineId}
              onChange={handleCreateChange}
            >
              {vaccines.map((vaccine) => (
                <MenuItem key={vaccine._id} value={vaccine._id}>
                  {vaccine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Total Doses"
            name="totalDoses"
            type="number"
            value={formData.totalDoses}
            onChange={handleCreateChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Applicable Classes (comma-separated, e.g., 5,6,7)"
            name="applicableClasses"
            value={formData.applicableClasses}
            onChange={handleCreateChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Enabled</InputLabel>
            <Select
              name="enabled"
              value={formData.enabled}
              onChange={handleCreateChange}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            color="primary"
            disabled={!!dateError || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Drive Modal */}
      <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Drive</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Drive Name"
            name="name"
            value={editDrive?.name || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={editDrive?.date || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          {dateError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {dateError}
            </Typography>
          )}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Vaccine</InputLabel>
            <Select
              name="vaccineId"
              value={editDrive?.vaccineId || ''}
              onChange={handleEditChange}
            >
              {vaccines.map((vaccine) => (
                <MenuItem key={vaccine._id} value={vaccine._id}>
                  {vaccine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Total Doses"
            name="totalDoses"
            type="number"
            value={editDrive?.totalDoses || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Applicable Classes (comma-separated, e.g., 5,6,7)"
            name="applicableClasses"
            value={editDrive?.applicableClasses || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Enabled</InputLabel>
            <Select
              name="enabled"
              value={editDrive?.enabled || true}
              onChange={handleEditChange}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            disabled={!!dateError || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Drive Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this drive? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Vaccination Modal */}
      {selectedDrive && (
        <VaccinationsModal
          open={vaccinationModalOpen}
          onClose={handleVaccinationModalClose}
          driveId={selectedDrive._id}
          driveName={selectedDrive.name}
          enabled={selectedDrive.enabled}
          applicableClasses={selectedDrive.applicableClasses || []}
          vaccines={vaccines}
          students={students}
        />
      )}
    </Box>
  );
}

export default DrivesPage;