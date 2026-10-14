import { useEffect, useState } from 'react';
import { api } from '../api.js';
import VideoPlayer from '../components/VideoPlayer.jsx';

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', location: '', rtspUrl: '' });

  const load = () =>
    api
      .listCameras()
      .then(setCameras)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addCamera(form);
      setForm({ name: '', location: '', rtspUrl: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this camera?')) return;
    try {
      await api.deleteCamera(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {error && <p className="error">{error}</p>}

      <form className="card add" onSubmit={add}>
        <h2>Add camera</h2>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input
          placeholder="rtsp://user:pass@192.168.1.50:554/stream1"
          value={form.rtspUrl}
          onChange={(e) => setForm({ ...form, rtspUrl: e.target.value })}
          required
        />
        <button type="submit">Add</button>
      </form>

      <div className="grid">
        {cameras.map((cam) => (
          <div className="card" key={cam.id}>
            <div className="card-head">
              <div>
                <strong>{cam.name}</strong>
                {cam.location && <span className="muted"> · {cam.location}</span>}
              </div>
              <button className="danger" onClick={() => remove(cam.id)}>Remove</button>
            </div>
            <VideoPlayer src={cam.hlsUrl} />
          </div>
        ))}
        {cameras.length === 0 && <p className="muted">No cameras yet. Add one above (admin only).</p>}
      </div>
    </>
  );
}
