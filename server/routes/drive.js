import express from 'express';
import Drive from '../models/Drive.js';
import Vaccination from '../models/Vaccination.js';

const router = express.Router();

// GET /api/drives/get-all
router.get('/get-all', async (req, res) => {
  try {
    const drives = await Drive.find()
      .populate('vaccineId', 'name')
      .sort({ date: 1 });
    // Compute availableDoses for each drive
    const drivesWithAvailableDoses = await Promise.all(
      drives.map(async (drive) => {
        const vaccinationCount = await Vaccination.countDocuments({ driveId: drive._id });
        const availableDoses = Math.max(0, drive.totalDoses - vaccinationCount);
        return {
          ...drive.toObject(),
          availableDoses,
        };
      })
    );
    res.json(drivesWithAvailableDoses);
  } catch (err) {
    console.error('Error fetching drives:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/drives/get/:id
router.get('/get/:id', async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate('vaccineId', 'name');
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    const vaccinationCount = await Vaccination.countDocuments({ driveId: drive._id });
    const availableDoses = Math.max(0, drive.totalDoses - vaccinationCount);
    res.json({ ...drive.toObject(), availableDoses });
  } catch (err) {
    console.error('Error fetching drive:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/drives/create
router.post('/create', async (req, res) => {
  try {
    const { name, date, vaccineId, totalDoses, enabled, applicableClasses } = req.body;
    if (!name || !date || !vaccineId || totalDoses == null) {
      return res.status(400).json({ message: 'Name, date, vaccine, and total doses are required' });
    }
    const drive = new Drive({
      name,
      date,
      vaccineId,
      totalDoses: parseInt(totalDoses),
      enabled: enabled ?? true,
      applicableClasses: applicableClasses ? applicableClasses.split(',').map(c => c.trim()) : [],
    });
    await drive.save();
    res.status(201).json({ ...drive.toObject(), availableDoses: drive.totalDoses });
  } catch (err) {
    console.error('Error creating drive:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/drives/update/:id
router.put('/update/:id', async (req, res) => {
  try {
    const { name, date, vaccineId, totalDoses, enabled, applicableClasses } = req.body;
    if (!name || !date || !vaccineId || totalDoses == null) {
      return res.status(400).json({ message: 'Name, date, vaccine, and total doses are required' });
    }
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    drive.name = name;
    drive.date = date;
    drive.vaccineId = vaccineId;
    drive.totalDoses = parseInt(totalDoses);
    drive.enabled = enabled ?? drive.enabled;
    drive.applicableClasses = applicableClasses ? applicableClasses.split(',').map(c => c.trim()) : drive.applicableClasses;
    await drive.save();
    const vaccinationCount = await Vaccination.countDocuments({ driveId: drive._id });
    const availableDoses = Math.max(0, drive.totalDoses - vaccinationCount);
    res.json({ ...drive.toObject(), availableDoses });
  } catch (err) {
    console.error('Error updating drive:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/drives/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    res.json({ message: 'Drive deleted' });
  } catch (err) {
    console.error('Error deleting drive:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;