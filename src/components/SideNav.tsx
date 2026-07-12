import { useState } from 'react';
import { User } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  siteName: string;
  user: User | null;
  isLoggedIn: boolean;
  authWorking: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function SideNav({ isOpen, onClose, onNavigate, siteName, user, isLoggedIn, authWorking, onLogin, onLogout }: Props) {
  const [openSub, setOpenSub] = useState<string | null>(null);

  const toggle = (key: string) => setOpenSub(prev => prev === key ? null : key);
  const go = (page: string) => (e: React.MouseEvent) => { e.preventDefault(); onNavigate(page); };

  const handleAuth = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isLoggedIn) await onLogout();
      else onLogin();
    } catch { }
  };

  return (
    <>
      <div className={`nav-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <nav className={`nav-panel ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'var(--header-h)', padding: '0 8px 0 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>{siteName}</span>
          <button className="h-btn" aria-label="Close" onClick={onClose}><svg viewBox="0 0 24 24"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg></button>
        </div>

        {user && (
          <div style={{ padding: '10px 18px 6px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginBottom: 2 }}>Signed in as</div>
            <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email || 'Google user'}</div>
          </div>
        )}

        <div style={{ padding: '6px 8px', flex: 1 }}>
          <a href="#" className="nav-link" onClick={go('home')}><svg viewBox="0 0 24 24"><path d="M12 18V15" /><path d="M10.07 2.82L3.14 8.37C2.36 8.99 1.86 10.3 2.03 11.28L3.36 19.24C3.6 20.66 4.96 21.81 6.4 21.81H17.6C19.03 21.81 20.4 20.65 20.64 19.24L21.97 11.28C22.13 10.3 21.63 8.99 20.86 8.37L13.93 2.83C12.86 1.97 11.13 1.97 10.07 2.82Z" /></svg><span>Home</span></a>
          <a href="#" className="nav-link" onClick={go('wishlist')}><svg viewBox="0 0 24 24"><path d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 014.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12z" /></svg><span>Wishlist</span></a>
          {isLoggedIn && <a href="#" className="nav-link" onClick={go('orders')}><svg viewBox="0 0 24 24"><path d="M3.17 7.44L12 12.55l8.77-5.08" /><path d="M12 21.61v-9.07" /><path d="M9.93 2.48L4.59 5.44C3.38 6.11 2.39 7.79 2.39 9.17v5.65c0 1.38.99 3.06 2.2 3.73l5.34 2.97c1.14.63 3.01.63 4.15 0l5.34-2.97c1.21-.67 2.2-2.35 2.2-3.73V9.17c0-1.38-.99-3.06-2.2-3.73l-5.34-2.97c-1.15-.62-3.01-.62-4.15.01z" /></svg><span>Orders</span></a>}

          <div>
            <button className="nav-link" onClick={() => toggle('s1')}><svg viewBox="0 0 24 24"><path d="M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z" /><path d="M8 2H17C19 2 20 3 20 5V6.38" /></svg><span style={{ flex: 1 }}>Sub menu</span><svg viewBox="0 0 24 24" className={`sub-arrow ${openSub === 's1' ? 'open' : ''}`}><path d="M19.92 8.95L13.4 15.47C12.63 16.24 11.37 16.24 10.6 15.47L4.08 8.95" /></svg></button>
            <div className={`sub-list ${openSub === 's1' ? 'open' : ''}`}><div style={{ marginLeft: 36, borderLeft: '1.5px solid var(--border)', padding: '2px 0 2px 8px' }}><a href="#" className="sub-item">Sub-menu 01</a><a href="#" className="sub-item">Sub-menu 02</a><a href="#" className="sub-item">Sub-menu 03</a><a href="#" className="sub-item">Sub-menu 04</a></div></div>
          </div>
          <div>
            <button className="nav-link" onClick={() => toggle('s2')}><svg viewBox="0 0 24 24"><path d="M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z" /><path d="M8 2H17C19 2 20 3 20 5V6.38" /></svg><span style={{ flex: 1 }}>Sub menu</span><svg viewBox="0 0 24 24" className={`sub-arrow ${openSub === 's2' ? 'open' : ''}`}><path d="M19.92 8.95L13.4 15.47C12.63 16.24 11.37 16.24 10.6 15.47L4.08 8.95" /></svg></button>
            <div className={`sub-list ${openSub === 's2' ? 'open' : ''}`}><div style={{ marginLeft: 36, borderLeft: '1.5px solid var(--border)', padding: '2px 0 2px 8px' }}><a href="#" className="sub-item">Sub-menu 05</a><a href="#" className="sub-item">Sub-menu 06</a><a href="#" className="sub-item">Sub-menu 07</a><a href="#" className="sub-item">Sub-menu 08</a></div></div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', padding: '6px 8px 8px' }}>
          {isLoggedIn && <a href="#" className="nav-link" onClick={go('profile')}><svg viewBox="0 0 24 24"><path d="M12.12 12.78a.96.96 0 00-.24 0 3.27 3.27 0 01-3.16-3.27c0-1.81 1.46-3.28 3.28-3.28a3.276 3.276 0 01.12 6.55zM18.74 19.38A9.934 9.934 0 0112 22c-2.6 0-4.96-.99-6.74-2.62.1-.94.7-1.86 1.77-2.58 2.74-1.82 7.22-1.82 9.94 0 1.07.72 1.67 1.64 1.77 2.58z" /><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" /></svg><span>Profile</span></a>}
          <a href="#" className="nav-link" onClick={go('about')}><svg viewBox="0 0 24 24"><path d="M9.16 10.87C9.06 10.86 8.94 10.86 8.83 10.87C6.45 10.79 4.56 8.84 4.56 6.44C4.56 3.99 6.54 2 9 2C11.45 2 13.44 3.99 13.44 6.44C13.43 8.84 11.54 10.79 9.16 10.87Z" /><path d="M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11" /><path d="M4.16 14.56C1.74 16.18 1.74 18.82 4.16 20.43C6.91 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.92 12.73 4.16 14.56Z" /><path d="M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14" /></svg><span>About</span></a>
          <a href="#" className="nav-link" onClick={go('contact')}><svg viewBox="0 0 24 24"><path d="M12 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V11.5" /><path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" /><path d="M19.21 14.77L15.67 18.31C15.53 18.45 15.4 18.71 15.37 18.9L15.18 20.25C15.11 20.74 15.45 21.08 15.94 21.01L17.29 20.82C17.48 20.79 17.75 20.66 17.88 20.52L21.42 16.98C22.03 16.37 22.32 15.66 21.42 14.76C20.53 13.87 19.82 14.16 19.21 14.77Z" /><path d="M18.7 15.28C19 16.36 19.84 17.2 20.92 17.5" /></svg><span>Contact</span></a>

          <a href="#" className="nav-link" onClick={handleAuth}>
            <svg viewBox="0 0 24 24"><path d="M20.283 10.356h-8.327v3.451h4.792c-.207 1.123-.84 2.074-1.792 2.709v2.258h2.908c1.702-1.567 2.683-3.874 2.683-6.592 0-.636-.057-1.249-.164-1.826z" /><path d="M11.956 21c2.43 0 4.467-.806 5.956-2.226l-2.908-2.258c-.806.54-1.836.86-3.048.86-2.342 0-4.324-1.581-5.032-3.706H3.916v2.332C5.398 18.91 8.423 21 11.956 21z" /><path d="M6.924 13.67a5.996 5.996 0 010-3.34V8.998H3.916a9.044 9.044 0 000 8.004l3.008-2.332z" /><path d="M11.956 6.624c1.321 0 2.506.454 3.438 1.345l2.581-2.581C16.419 3.84 14.382 3 11.956 3 8.423 3 5.398 5.09 3.916 8.998L6.924 11.33c.708-2.125 2.69-3.706 5.032-3.706z" /></svg>
            <span>{authWorking ? 'Please wait...' : isLoggedIn ? 'Logout' : 'Login with Google'}</span>
          </a>
        </div>
      </nav>
    </>
  );
}
