import { useEffect, useState } from 'react';

export default function ScrollProgressButton() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const next = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(next);
      setVisible(scrollTop > 120);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 70,
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity .2s ease, transform .2s ease, visibility .2s ease',
        background: `conic-gradient(#0b57cf ${progress}%, var(--border) ${progress}% 100%)`,
        boxShadow: '0 10px 18px rgba(0,0,0,.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#0b57cf',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          style={{
            width: 18,
            height: 18,
            fill: 'none',
            stroke: '#fff',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            display: 'block',
          }}
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </span>
    </button>
  );
}
