import Camera from '../models/Camera.js';
import { decrypt } from '../utils/crypto.js';

const api = () => process.env.MEDIAMTX_API || 'http://localhost:9997';

// Register (or replace) a camera's RTSP source as a MediaMTX path.
export async function addPath(slug, rtspUrl) {
  const body = JSON.stringify({ source: rtspUrl, sourceOnDemand: true });
  const headers = { 'Content-Type': 'application/json' };

  let res = await fetch(`${api()}/v3/config/paths/add/${slug}`, { method: 'POST', headers, body });
  if (res.status === 400 || res.status === 409) {
    // Path may already exist; replace it.
    res = await fetch(`${api()}/v3/config/paths/replace/${slug}`, { method: 'POST', headers, body });
  }
  if (!res.ok) throw new Error(`MediaMTX add path failed (${res.status})`);
}

export async function removePath(slug) {
  const res = await fetch(`${api()}/v3/config/paths/delete/${slug}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`MediaMTX delete path failed (${res.status})`);
}

export async function syncAllCameras() {
  const cameras = await Camera.find({ enabled: true });
  for (const cam of cameras) {
    await addPath(cam.slug, decrypt(cam.rtspUrlEnc));
  }
  console.log(`Synced ${cameras.length} camera(s) to MediaMTX`);
}

export function hlsUrl(slug) {
  const base = process.env.MEDIAMTX_HLS_BASE || 'http://localhost:8888';
  return `${base}/${slug}/index.m3u8`;
}
