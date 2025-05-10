import express from 'express';
import Vaccination from '../models/Vaccination.js';
import Drive from '../models/Drive.js';

const router = express.Router();

// GET /api/vaccinations/get-all
router.get('/get-all', async (req, res) => {
  try {
    const vaccinations = await Vaccination.find()
      .populate('studentId', 'id name studentClass')
      .populate({
        path: 'driveId',
        select: 'name date vaccineId',
        populate: { path: 'vaccineId', select: 'name' },
      });
    res.json(vaccinations);
  } catch (err) {
    console.error('Error fetching all vaccinations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/vaccinations/by-drive/:driveId
router.get('/by-drive/:driveId', async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ driveId: req.params.driveId })
      .populate('studentId', 'id name studentClass')
      .populate({
        path: 'driveId',
        select: 'name date vaccineId',
        populate: { path: 'vaccineId', select: 'name' },
      });
    console.log('Vaccinations fetched:', vaccinations.map(v => ({
      _id: v._id,
      driveId: v.driveId?._id,
      vaccineName: v.driveId?.vaccineId?.name || 'Missing',
    })));
    res.json(vaccinations);
  } catch (err) {
    console.error('Error fetching vaccinations by drive:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/vaccinations/by-vaccine/:vaccineId
router.get('/by-vaccine/:vaccineId', async (req, res) => {
  try {
    const drives = await Drive.find({ vaccineId: req.params.vaccineId }).select('_id');
    const driveIds = drives.map(drive => drive._id);
    const vaccinations = await Vaccination.find({ driveId: { $in: driveIds } })
      .populate('studentId', 'id name studentClass')
      .populate({
        path: 'driveId',
        select: 'name date vaccineId',
        populate: { path: 'vaccineId', select: 'name' },
      });
    res.json(vaccinations);
  } catch (err) {
    console.error('Error fetching vaccinations by vaccine:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/vaccinations/create
router.post('/create', async (req, res) => {
  try {
    const { studentId, driveId } = req.body;
    if (!studentId || !driveId) {
      return res.status(400).json({ message: 'Student and drive are required' });
    }
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    if (!drive.enabled) {
      return res.status(400).json({ message: 'Cannot add vaccination to a disabled drive' });
    }
    const vaccinationCount = await Vaccination.countDocuments({ driveId });
    if (vaccinationCount >= drive.totalDoses) {
      return res.status(400).json({ message: 'No doses available for this drive' });
    }
    // Check if student has already received this vaccine
    const vaccineId = drive.vaccineId;
    const drivesWithSameVaccine = await Drive.find({ vaccineId }).select('_id');
    const driveIds = drivesWithSameVaccine.map(d => d._id);
    const existingVaccination = await Vaccination.findOne({
      studentId,
      driveId: { $in: driveIds },
    });
    if (existingVaccination) {
      return res.status(400).json({ message: 'Student already vaccinated with this vaccine' });
    }
    const vaccination = new Vaccination({ studentId, driveId });
    await vaccination.save();
    res.status(201).json(vaccination);
  } catch (err) {
    console.error('Error creating vaccination:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/vaccinations/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination not found' });
    }
    res.json({ message: 'Vaccination deleted' });
  } catch (err) {
    console.error('Error deleting vaccination:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;