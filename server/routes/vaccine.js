import express from 'express';
import Vaccine from '../models/Vaccine.js';

const router = express.Router();

// GET /api/vaccines/get-all
router.get('/get-all', async (req, res) => {
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/vaccines/create
router.post('/create', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const vaccine = new Vaccine({ name, description });
    await vaccine.save();
    res.status(201).json(vaccine);
  } catch (err) {
    console.error('Error creating vaccine:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/vaccines/update/:id
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const vaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }
    res.json(vaccine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/vaccines/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const vaccine = await Vaccine.findByIdAndDelete(req.params.id);
    if (!vaccine) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }
    res.json({ message: 'Vaccine deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;