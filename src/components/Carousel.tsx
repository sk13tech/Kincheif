import { useState, useEffect, useRef } from 'react';
import { db, firebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

interface Slide {
  id: string;
  imageUrl: string;
  order: number;
  title?: string;
  description?: string;
}

const fallback: Slide[] = [
  {
    id: 'carousel1',
    imageUrl: 'https://images.pexels.com/photos/8887011/pexels-photo-8887011.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    order: 1,
    title: 'Festive Mithai & Sweets Showcase',
    description: 'Authentic handcrafted sweets · Flat 20% OFF on Party Boxes',
  },
  {
    id: 'carousel2',
    imageUrl: 'https://images.pexels.com/photos/13871293/pexels-photo-13871293.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    order: 2,
    title: 'Fresh Bakery Morning Specials',
    description: 'Warm croissants, cookies & pastries delivered straight to your door',
  },
  {
    id: 'carousel3',
    imageUrl: 'https://images.pexels.com/photos/14048839/pexels-photo-14048839.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    order: 3,
    title: 'Gourmet Desserts & Combo Packs',
    description: 'Use code WELCOME20 for up to ₹500 discount on your first order',
  },
];

const greys = ['#ccc', '#bbb', '#aaa'];

function normalizeSlide(id: string, data: Record<string, unknown>): Slide {
  return {
    id,
    imageUrl: String(data.imageUrl ?? data.link ?? ''),
    order: Number(data.order ?? 0) || 0,
    title: String(data.title ?? ''),
    description: String(data.description ?? data.subtitle ?? ''),
  };
}

export default function Carousel() {
  const [slides, setSlides] = useState<Slide[]>(fallback);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  // Safe Firestore subscription
  useEffect(() => {
    if (!firebaseConfigured) return;
    const q = query(collection(db, 'carousel'), orderBy('order'));
    const unsub = onSnapshot(q, (snap) => {
      const items: Slide[] = [];
      snap.forEach((d) => items.push(normalizeSlide(d.id, d.data() as Record<string, unknown>)));
      if (items.length > 0) {
        setSlides(items.slice(0, 3));
        setCurrent((prev) => Math.min(prev, Math.max(0, items.length - 1)));
      }
    }, () => {});
    return unsub;
  }, []);

  // Safer auto-advance every 3 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  // Scroll to current slide after current changes
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[current] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - 16, behavior: 'smooth' });
  }, [current]);

  const goTo = (i: number) => {
    if (i < 0 || i >= slides.length) return;
    setCurrent(i);
  };

  if (slides.length === 0) return null;

  return (
    <div
      style={{ marginBottom: 16 }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} className="carousel-track">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="card-gpu"
            onClick={() => goTo(i)}
            style={{
              flex: '0 0 calc(100% - 32px)',
              scrollSnapAlign: 'center',
              height: 200,
              borderRadius: 14,
              background: greys[i % greys.length],
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              border: '1px solid var(--border)',
            }}
          >
            {s.imageUrl && (
              <img
                src={s.imageUrl}
                alt={s.title || `Slide ${i + 1}`}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
            {(s.title || s.description) && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 50%, rgba(0,0,0,0) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '16px 18px',
                }}
              >
                {s.title && <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{s.title}</div>}
                {s.description && <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.86)', lineHeight: 1.4 }}>{s.description}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: current === i ? 18 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              background: current === i ? 'var(--icon)' : 'var(--border)',
              cursor: 'pointer',
              padding: 0,
              transition: 'width .25s, background .25s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
