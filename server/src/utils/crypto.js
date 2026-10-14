import crypto from 'node:crypto';

// AES-256-GCM. Stored format: iv:tag:ciphertext (all hex).
function key() {
  const k = Buffer.from(process.env.CAMERA_KEY || '', 'hex');
  if (k.length !== 32) throw new Error('CAMERA_KEY must be 64 hex characters (32 bytes)');
  return k;
}

export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString('hex')).join(':');
}

export function decrypt(payload) {
  const [iv, tag, enc] = payload.split(':').map((h) => Buffer.from(h, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
