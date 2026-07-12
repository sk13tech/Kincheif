import { useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export default function SearchOverlay({ isOpen, onClose, onSearch }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => ref.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      onClose();
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    onClose();
  };

  return (
    <div className={`search-wrap ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="search-inner">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="M16 16l4.5 4.5" />
            </svg>
            <input
              ref={ref}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="search-input"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  padding: '4px 8px', fontSize: '.72rem', fontWeight: 600,
                  color: 'var(--text-sec)', fontFamily: 'inherit',
                  borderRadius: 6, flexShrink: 0,
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
