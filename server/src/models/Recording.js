import mongoose from 'mongoose';

// Phase 3: one document per recorded video segment.
const recordingSchema = new mongoose.Schema(
  {
    camera: { type: mongoose.Schema.Types.ObjectId, ref: 'Camera', required: true, index: true },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date },
    filePath: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recordingSchema.index({ camera: 1, startedAt: -1 });

export default mongoose.model('Recording', recordingSchema);
