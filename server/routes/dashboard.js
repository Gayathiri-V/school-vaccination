import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const data = await Student.aggregate([
      // Step 1: Get all students
      {
        $lookup: {
          from: 'vaccinations',
          localField: '_id',
          foreignField: 'studentId',
          as: 'vaccinations',
        },
      },
      // Step 2: Join with vaccines
      {
        $lookup: {
          from: 'vaccines',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          as: 'vaccines',
        },
      },
      // Step 3: Join with drives
      {
        $lookup: {
          from: 'drives',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                date: 1,
                vaccineId: 1,
                totalDoses: 1,
                availableDoses: 1,
                applicableClasses: 1,
                enabled: 1,
              },
            },
          ],
          as: 'drives',
        },
      },
      // Step 4: Join with vaccinations for drive details
      {
        $lookup: {
          from: 'vaccinations',
          pipeline: [
            {
              $project: {
                driveId: 1,
              },
            },
          ],
          as: 'allVaccinations',
        },
      },
    ]);

    console.log('Dashboard data generated:', {
      recordCount: data.length,
      sample: data.slice(0, 5),
    });

    res.json(data);
  } catch (err) {
    console.error('Error generating dashboard data:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;