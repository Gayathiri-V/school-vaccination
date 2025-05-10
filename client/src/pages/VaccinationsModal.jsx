import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
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
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const api = process.env.REACT_APP_API_URL;

function VaccinationsModal({ open, onClose, driveId, driveName, enabled, applicableClasses, students, vaccineId }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccineVaccinations, setVaccineVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vaccinationCreateModalOpen, setVaccinationCreateModalOpen] = useState(false);
  const [vaccinationDeleteModalOpen, setVaccinationDeleteModalOpen] = useState(false);
  const [vaccinationFormData, setVaccinationFormData] = useState({ studentId: '' });
  const [deleteVaccinationId, setDeleteVaccinationId] = useState(null);

  // Filter students based on applicableClasses and exclude those vaccinated with this vaccine
  const vaccinatedStudentIds = vaccineVaccinations.map(v => v.studentId?._id?.toString());
  const filteredStudents = students.filter(
    student =>
      applicableClasses.includes(student.studentClass) &&
      !vaccinatedStudentIds.includes(student._id.toString())
  );

  useEffect(() => {
    if (open && driveId && vaccineId) {
      fetchVaccinations();
      fetchVaccineVaccinations();
    }
  }, [open, driveId, vaccineId]);

  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api}/api/vaccinations/by-drive/${driveId}`);
      setVaccinations(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch vaccinations');
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccineVaccinations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api}/api/vaccinations/by-vaccine/${vaccineId}`);
      setVaccineVaccinations(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch vaccine vaccinations');
    } finally {
      setLoading(false);
    }
  };

  const handleVaccinationCreateOpen = () => {
    setVaccinationFormData({ studentId: '' });
    setError('');
    setVaccinationCreateModalOpen(true);
  };

  const handleVaccinationCreateClose = () => {
    setVaccinationCreateModalOpen(false);
    setError('');
  };

  const handleVaccinationCreateChange = (e) => {
    setVaccinationFormData({ ...vaccinationFormData, [e.target.name]: e.target.value });
  };

  const handleVaccinationCreateSubmit = async () => {
    if (!vaccinationFormData.studentId) {
      setError('Student is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${api}/api/vaccinations/create`, {
        studentId: vaccinationFormData.studentId,
        driveId,
      });
      setVaccinationCreateModalOpen(false);
      fetchVaccinations();
      fetchVaccineVaccinations();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create vaccination');
    } finally {
      setLoading(false);
    }
  };

  const handleVaccinationDeleteClick = (id) => {
    setDeleteVaccinationId(id);
    setVaccinationDeleteModalOpen(true);
  };

  const handleVaccinationDeleteConfirm = async () => {
    setLoading(true);
    try {
      await axios.delete(`${api}/api/vaccinations/delete/${deleteVaccinationId}`);
      setVaccinationDeleteModalOpen(false);
      setDeleteVaccinationId(null);
      fetchVaccinations();
      fetchVaccineVaccinations();
      setError('');
    } catch (err) {
      setError('Failed to delete vaccination');
    } finally {
      setLoading(false);
    }
  };

  const handleVaccinationDeleteCancel = () => {
    setVaccinationDeleteModalOpen(false);
    setDeleteVaccinationId(null);
    setError('');
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Vaccinations for {driveName || 'Drive'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {enabled ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleVaccinationCreateOpen}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              Add Vaccination
            </Button>
          ) : (
            <Typography color="error" sx={{ mb: 2 }}>
              This drive is disabled. Vaccinations cannot be added.
            </Typography>
          )}
          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
          {!loading && vaccinations.length === 0 ? (
            <Typography>No vaccinations recorded for this drive</Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Vaccine</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vaccinations.map((vaccination) => (
                    <TableRow key={vaccination._id}>
                      <TableCell>{vaccination.studentId?.id || 'Unknown'}</TableCell>
                      <TableCell>{vaccination.studentId?.name || 'Unknown'}</TableCell>
                      <TableCell>{vaccination.studentId?.studentClass || 'Unknown'}</TableCell>
                      <TableCell>{vaccination.driveId?.vaccineId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {vaccination.driveId?.date ? format(new Date(vaccination.driveId.date), 'yyyy-MM-dd') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleVaccinationDeleteClick(vaccination._id)}
                          title="Delete Vaccination"
                        >
                          <Delete />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Create Vaccination Modal */}
      <Dialog open={vaccinationCreateModalOpen} onClose={handleVaccinationCreateClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Vaccination</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Student</InputLabel>
            <Select
              name="studentId"
              value={vaccinationFormData.studentId}
              onChange={handleVaccinationCreateChange}
            >
              {filteredStudents.length === 0 ? (
                <MenuItem disabled>No eligible students</MenuItem>
              ) : (
                filteredStudents.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.id} - {student.name} (Class {student.studentClass})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVaccinationCreateClose}>Cancel</Button>
          <Button
            onClick={handleVaccinationCreateSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Vaccination Confirmation Modal */}
      <Dialog open={vaccinationDeleteModalOpen} onClose={handleVaccinationDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vaccination record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVaccinationDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleVaccinationDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default VaccinationsModal;