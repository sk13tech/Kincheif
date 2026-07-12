import { useRef } from 'react';
import { useReels } from '../lib/useSettings';

function getYTEmbedUrl(url: string): string {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export default function Reels() {
  const items = useReels();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -180 : 180, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <div style={{ padding: '0 16px', marginTop: 8, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap' }}>Videos</h3>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scrollByAmount('left')}
          aria-label="Scroll left"
          style={{
            position: 'absolute',
            left: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 36,
            height: 36,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,.96)',
            boxShadow: '0 4px 12px rgba(0,0,0,.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 2,
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'var(--text)', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => scrollByAmount('right')}
          aria-label="Scroll right"
          style={{
            position: 'absolute',
            right: -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 36,
            height: 36,
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,.96)',
            boxShadow: '0 4px 12px rgba(0,0,0,.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 2,
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'var(--text)', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div ref={trackRef} className="reels-track" style={{ padding: '0 0 4px' }}>
          {items.map((reel, i) => (
            <a
              key={i}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-gpu"
              style={{
                flex: '0 0 160px',
                height: 284,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#000',
                border: '1px solid var(--border)',
                position: 'relative',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              <iframe
                src={getYTEmbedUrl(reel.url)}
                title={`Reel ${i + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: 'rgba(0,0,0,.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: '#fff', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
