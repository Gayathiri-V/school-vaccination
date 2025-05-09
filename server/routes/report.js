import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const report = await Student.aggregate([
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
                date: 1,
                vaccineId: 1,
                name: 1
              },
            },
          ],
          as: 'drives',
        },
      },
    ]);

    console.log('Report generated:', {
      recordCount: report.length,
      sample: report.slice(0, 5),
    });

    res.json(report);
  } catch (err) {
    console.error('Error generating report:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;