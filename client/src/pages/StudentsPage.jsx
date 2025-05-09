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
  Input,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import Papa from 'papaparse';

const api = process.env.REACT_APP_API_URL;

function StudentsListPage() {
  const [students, setStudents] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', studentClass: '' });
  const [csvData, setCsvData] = useState([]);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  useEffect(() => {
    if (!fetched) {
      fetchStudents();
    }
  }, [fetched]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${api}/api/students/get-all`);
      setStudents(response.data);
      setFetched(true);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!['5', '6', '7'].includes(formData.studentClass)) {
      setError('Student class must be 5, 6, or 7');
      return;
    }
    try {
      await axios.post(`${api}/api/students/create`, formData);
      fetchStudents();
      setFormData({ id: '', name: '', studentClass: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError('Please select a CSV file');
      return;
    }
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsedData = results.data
          .map((row) => ({
            id: row.id || '',
            name: row.name || '',
            studentClass: row.studentClass || '',
          }))
          .filter((row) => row.id && row.name && row.studentClass);
        for (const row of parsedData) {
          if (!['5', '6', '7'].includes(row.studentClass)) {
            setError(`Invalid class for student ${row.id}: class must be 5, 6, or 7`);
            setCsvData([]);
            return;
          }
        }
        if (parsedData.length === 0) {
          setError('No valid student data found in CSV');
          return;
        }
        setCsvData(parsedData);
        setError('');
      },
      error: () => {
        setError('Error parsing CSV file');
      },
    });
  };

  const handleCsvDataChange = (index, field, value) => {
    const updatedData = [...csvData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setCsvData(updatedData);
  };

  const handleSaveAll = async () => {
    if (csvData.length === 0) {
      setError('No students to save');
      return;
    }
    for (const row of csvData) {
      if (!['5', '6', '7'].includes(row.studentClass)) {
        setError(`Invalid class for student ${row.id}: class must be 5, 6, or 7`);
        return;
      }
    }
    try {
      await axios.post(`${api}/api/students/bulk`, csvData);
      setCsvData([]);
      fetchStudents();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save students');
    }
  };

  const handleEditClick = (student) => {
    setEditStudent({ ...student });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditStudent({ ...editStudent, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!['5', '6', '7'].includes(editStudent.studentClass)) {
      setError('Student class must be 5, 6, or 7');
      return;
    }
    try {
      await axios.put(`${api}/api/students/update/${editStudent._id}`, {
        id: editStudent.id,
        name: editStudent.name,
        studentClass: editStudent.studentClass,
      });
      setEditModalOpen(false);
      setEditStudent(null);
      fetchStudents();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditStudent(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteStudentId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${api}/api/students/delete/${deleteStudentId}`);
      setDeleteModalOpen(false);
      setDeleteStudentId(null);
      fetchStudents();
      setError('');
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteStudentId(null);
  };

  return (
    <Box sx={{ mt: 8, mb: 8, p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Student Management
      </Typography>
      {/* Single Student Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Student
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Student ID"
            name="id"
            value={formData.id}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Class</InputLabel>
            <Select
              name="studentClass"
              value={formData.studentClass}
              onChange={handleChange}
            >
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="7">7</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Student
          </Button>
        </form>
      </Paper>
      {/* CSV Upload */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Students (CSV)
        </Typography>
        <Input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          sx={{ mb: 2 }}
        />
      </Paper>
      {/* Editable CSV Data Table */}
      {csvData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Uploaded Students
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {csvData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      value={row.id}
                      onChange={(e) => handleCsvDataChange(index, 'id', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={row.name}
                      onChange={(e) => handleCsvDataChange(index, 'name', e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Class</InputLabel>
                      <Select
                        value={row.studentClass}
                        onChange={(e) => handleCsvDataChange(index, 'studentClass', e.target.value)}
                      >
                        <MenuItem value="5">5</MenuItem>
                        <MenuItem value="6">6</MenuItem>
                        <MenuItem value="7">7</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAll}
            sx={{ mt: 2 }}
          >
            Save All Users
          </Button>
        </Paper>
      )}
      {/* Saved Students Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Students List
        </Typography>
        {students.length === 0 ? (
          <Typography>No students found</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.studentClass}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(student)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(student._id)}>
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
      {/* Edit Student Modal */}
      <Dialog open={editModalOpen} onClose={handleEditCancel}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <TextField
            label="Student ID"
            name="id"
            value={editStudent?.id || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Name"
            name="name"
            value={editStudent?.name || ''}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Class</InputLabel>
            <Select
              name="studentClass"
              value={editStudent?.studentClass || ''}
              onChange={handleEditChange}
            >
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="6">6</MenuItem>
              <MenuItem value="7">7</MenuItem>
            </Select>
          </FormControl>
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
            Are you sure you want to delete this student? This action cannot be undone.
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

export default StudentsListPage;