import express from 'express';
import helmet from "helmet";
import morgan from "morgan";
import cors from 'cors'
import bodyParser from 'body-parser';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import driveRoutes from './routes/drive.js';
import vaccineRoutes from './routes/vaccine.js';
import vaccinationRoutes from './routes/vaccination.js';
import reportRoutes from './routes/report.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors(corsOptions))
app.options('/', cors());
app.use(bodyParser.json());


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const [totalStudents, vaccinatedStudents, upcomingDrives] = await Promise.all([
      mongoose.model('Student').countDocuments(),
      mongoose.model('Student').countDocuments({ vaccinationStatus: 'Vaccinated' }),
      mongoose.model('Drive').find({
        date: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);
    res.json({ totalStudents, vaccinatedStudents, upcomingDrives });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});