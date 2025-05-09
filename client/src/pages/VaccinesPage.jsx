import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const api = process.env.REACT_APP_API_URL;

function VaccinesListPage() {
  const [vaccines, setVaccines] = useState([]);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editVaccine, setEditVaccine] = useState(null);
  const [deleteVaccineId, setDeleteVaccineId] = useState(null);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      const response = await axios.get(`${api}/api/vaccines/get-all`);
      setVaccines(response.data);
    } catch (err) {
      setError('Failed to fetch vaccines');
    }
  };

  const handleCreateOpen = () => {
    setFormData({ name: '', description: '' });
    setCreateModalOpen(true);
  };

  const handleCreateClose = () => {
    setCreateModalOpen(false);
  };

  const handleCreateChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async () => {
    try {
      await axios.post(`${api}/api/vaccines/create`, formData);
      setCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchVaccines();
      setError('');
    } catch (err) {
      setError('Failed to create vaccine');
    }
  };

  const handleEditClick = (vaccine) => {
    setEditVaccine({ ...vaccine });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditVaccine({ ...editVaccine, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`${api}/api/vaccines/update/${editVaccine._id}`, {
        name: editVaccine.name,
        description: editVaccine.description,
      });
      setEditModalOpen(false);
      setEditVaccine(null);
      fetchVaccines();
      setError('');
    } catch (err) {
      setError('Failed to update vaccine');
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditVaccine(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteVaccineId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${api}/api/vaccines/delete/${deleteVaccineId}`);
      setDeleteModalOpen(false);
      setDeleteVaccineId(null);
      fetchVaccines();
      setError('');
    } catch (err) {
      setError('Failed to delete vaccine');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteVaccineId(null);
  };

  return (
    <Box sx={{ mt: 8, mb: 8, p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Available Vaccines
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateOpen}
        sx={{ mb: 3 }}
      >
        Add Vaccine
      </Button>
      <Paper sx={{ p: 3 }}>
        {vaccines.length === 0 ? (
          <Typography>No vaccines available</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vaccine Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaccines.map((vaccine) => (
                <TableRow key={vaccine._id}>
                  <TableCell>{vaccine.name}</TableCell>
                  <TableCell>{vaccine.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(vaccine)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(vaccine._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>
      {/* Create Vaccine Modal */}
      <Dialog open={createModalOpen} onClose={handleCreateClose}>
        <DialogTitle>Add New Vaccine</DialogTitle>
        <DialogContent>
          <TextField
            label="Vaccine Name"
            name="name"
            value={formData.name}
            onChange={handleCreateChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleCreateChange}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Vaccine Modal */}
      <Dialog open={editModalOpen} onClose={handleEditCancel}>
        <DialogTitle>Edit Vaccine</DialogTitle>
        <DialogContent>
          <TextField
            label="Vaccine Name"
            name="name"
            value={editVaccine?.name || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            name="description"
            value={editVaccine?.description || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vaccine? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VaccinesListPage;