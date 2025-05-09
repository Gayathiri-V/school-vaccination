import mongoose from 'mongoose';

const DriveSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    vaccineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vaccine', required: true },
    totalDoses: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
    applicableClasses: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Drive', DriveSchema);