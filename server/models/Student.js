import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true }, // Real-world student ID (e.g., "S001")
    name: { type: String, required: true },
    studentClass: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Student', StudentSchema);