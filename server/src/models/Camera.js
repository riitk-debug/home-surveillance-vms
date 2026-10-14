import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // URL-safe id used as the MediaMTX path name
    slug: { type: String, required: true, unique: true },
    location: { type: String, default: '' },
    // AES-256-GCM encrypted RTSP URL (never sent to the client)
    rtspUrlEnc: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Camera', cameraSchema);
