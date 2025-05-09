import mongoose from 'mongoose';

const VaccinationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Vaccination', VaccinationSchema);