import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';

const router = Router();

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });
}

// The first account becomes admin. After that, only an admin can create users.
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = credsSchema.parse(req.body);
    const count = await User.countDocuments();

    if (count > 0) {
      // Require an admin token for any registration after the first
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      let caller;
      try {
        caller = token ? jwt.verify(token, process.env.JWT_SECRET) : null;
      } catch {
        caller = null;
      }
      if (!caller) return res.status(401).json({ error: 'Registration is closed. Ask an admin.' });
      if (caller.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    }

    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already in use' });

    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: count === 0 ? 'admin' : 'viewer',
    });
    res.status(201).json({ token: sign(user), user: { id: user.id, email, role: user.role } });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors[0].message });
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credsSchema.parse(req.body);
    const user = await User.findOne({ email });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: sign(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: 'Invalid email or password' });
    next(e);
  }
});

export default router;
