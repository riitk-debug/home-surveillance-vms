import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({ liveSyncDurationCount: 3, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('live');
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        setStatus('offline');
        // Retry after a pause (camera may be rebooting).
        setTimeout(() => {
          if (hls) hls.loadSource(src);
        }, 5000);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari plays HLS natively.
      video.src = src;
      video.addEventListener('loadedmetadata', () => setStatus('live'));
    }

    return () => hls?.destroy();
  }, [src]);

  return (
    <div className="player">
      <video ref={videoRef} muted playsInline controls />
      <span className={`badge ${status}`}>{status}</span>
    </div>
  );
}
