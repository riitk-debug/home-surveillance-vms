import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import cameraRoutes from './routes/cameras.js';
import { syncAllCameras } from './services/mediamtx.js';

const required = ['MONGO_URI', 'JWT_SECRET', 'CAMERA_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/cameras', cameraRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const port = process.env.PORT || 4000;

await mongoose.connect(process.env.MONGO_URI);
console.log('MongoDB connected');

app.listen(port, () => console.log(`API listening on :${port}`));

// Re-register all cameras with MediaMTX on startup (it forgets runtime paths on restart).
syncAllCameras().catch((e) => console.warn('MediaMTX sync skipped:', e.message));
