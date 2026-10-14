import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import Camera from '../models/Camera.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { encrypt } from '../utils/crypto.js';
import { addPath, removePath, hlsUrl } from '../services/mediamtx.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1).max(60),
  location: z.string().max(100).optional().default(''),
  rtspUrl: z.string().regex(/^rtsps?:\/\//i, 'Must be an rtsp:// or rtsps:// URL'),
});

const publicCamera = (c) => ({
  id: c.id,
  name: c.name,
  location: c.location,
  enabled: c.enabled,
  hlsUrl: hlsUrl(c.slug),
  createdAt: c.createdAt,
});

router.get('/', async (_req, res, next) => {
  try {
    const cameras = await Camera.find().sort({ createdAt: 1 });
    res.json(cameras.map(publicCamera));
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, location, rtspUrl } = createSchema.parse(req.body);
    const slug = `cam-${crypto.randomBytes(5).toString('hex')}`;

    // Register with the media server first so we don't store a camera that can't stream.
    await addPath(slug, rtspUrl);

    const camera = await Camera.create({ name, location, slug, rtspUrlEnc: encrypt(rtspUrl) });
    res.status(201).json(publicCamera(camera));
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors[0].message });
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const camera = await Camera.findById(req.params.id);
    if (!camera) return res.status(404).json({ error: 'Camera not found' });
    await removePath(camera.slug).catch((e) => console.warn(e.message));
    await camera.deleteOne();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
