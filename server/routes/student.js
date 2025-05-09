import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/students/get-all
router.get('/get-all', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/students/create
router.post('/create', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { id, name, studentClass } = req.body;
    if (!id || !name || !studentClass) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['5', '6', '7'].includes(studentClass)) {
      return res.status(400).json({ message: 'Student class must be 5, 6, or 7' });
    }
    const student = new Student({ id, name, studentClass });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/students/bulk
router.post('/bulk', async (req, res) => {
  try {
    const students = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Invalid student data' });
    }
    for (const student of students) {
      if (!student.id || !student.name || !student.studentClass) {
        return res.status(400).json({ message: 'All fields are required for each student' });
      }
      if (!['5', '6', '7'].includes(student.studentClass)) {
        return res.status(400).json({ message: `Invalid class for student ${student.id}: class must be 5, 6, or 7` });
      }
    }
    await Student.insertMany(students);
    res.json({ message: 'Students uploaded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/students/update/:id
router.put('/update/:id', async (req, res) => {
  try {
    const { id, name, studentClass } = req.body;
    if (!id || !name || !studentClass) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['5', '6', '7'].includes(studentClass)) {
      return res.status(400).json({ message: 'Student class must be 5, 6, or 7' });
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { id, name, studentClass },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/students/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;