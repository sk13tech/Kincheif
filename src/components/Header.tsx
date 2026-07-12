import { useState, useEffect } from 'react';
import SideNav from './SideNav';
import SearchOverlay from './SearchOverlay';
import CartPanel from './CartPanel';
import { useSite } from '../lib/useSettings';
import { CartActions } from '../lib/useCart';
import { OrderActions } from '../lib/useOrders';
import { WishlistActions } from '../lib/useWishlist';
import { User } from 'firebase/auth';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onNavigate: (page: string) => void;
  cart: CartActions;
  orders: OrderActions;
  wishlist: WishlistActions;
  onSearch: (q: string) => void;
  user: User | null;
  isLoggedIn: boolean;
  authWorking: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ darkMode, toggleDarkMode, onNavigate, cart, orders, onSearch, user, isLoggedIn, authWorking, onLogin, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const site = useSite();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 2);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen || cartOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, searchOpen, cartOpen]);

  const nav = (page: string) => { onNavigate(page); setMenuOpen(false); window.scrollTo(0, 0); };
  const handleSearch = (q: string) => { onSearch(q); if (q) nav('home'); };
  const siteName = site?.name || 'Median UI';

  return (
    <>
      <header className="card-gpu" style={{ position: 'sticky', top: 0, zIndex: 50, height: 'var(--header-h)', background: 'var(--bg)', borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="h-btn" aria-label="Menu" onClick={() => setMenuOpen(true)}><div className="ham"><span /><span /><span /></div></button>
            <a href="#" onClick={e => { e.preventDefault(); nav('home'); }} style={{ marginLeft: 4, fontSize: '1.08rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.01em' }}>{siteName}</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button className="h-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M16 16l4.5 4.5" /></svg>
            </button>
            <button className="h-btn" aria-label="Theme" onClick={toggleDarkMode}>
              {darkMode ? <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
                : <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
            </button>
            <button className="h-btn" aria-label="Cart" onClick={() => setCartOpen(true)} style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24"><path d="M7.5 7.67V6.7c0-2.25 1.81-4.46 4.06-4.67a4.5 4.5 0 014.94 4.48v1.38" /><path d="M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22z" /><path d="M15.5 12h.01" /><path d="M8.5 12h.01" /></svg>
              {cart.totalQty > 0 && <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, background: '#e74c3c', color: '#fff', fontSize: '.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', lineHeight: 1 }}>{cart.totalQty}</span>}
            </button>
          </div>
        </div>
      </header>
      <SideNav isOpen={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={nav} siteName={siteName} user={user} isLoggedIn={isLoggedIn} authWorking={authWorking} onLogin={onLogin} onLogout={onLogout} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} />
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} orders={orders} isLoggedIn={isLoggedIn} onLoginClick={onLogin} user={user} />
    </>
  );
}
