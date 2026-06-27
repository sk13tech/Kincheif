import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Menu, X, Search, LogOut, User as UserIcon, Package } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps { onNavigate: (p: string) => void; currentPage: string; onSearch: (q: string) => void; }

export default function Header({ onNavigate, currentPage, onSearch }: HeaderProps) {
  const { totalItems, toggleCart } = useCart();
  const { user, login, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [agreed, setAgreed] = useState(!!localStorage.getItem('purehome_consent'));
  const [siteCfg, setSiteCfg] = useState<SiteConfig>({});

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => subscribeSiteConfig(setSiteCfg), []);

  const nav = [
    { label: 'Home', page: 'home' }, { label: 'Shop', page: 'shop' },
    { label: 'Orders', page: 'orders' }, { label: 'About', page: 'about' }, { label: 'Contact', page: 'contact' },

  ];

  const submit = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { onSearch(q.trim()); onNavigate('shop'); setSearchOpen(false); } };

  const handleLogin = useCallback(() => {
    if (!localStorage.getItem('purehome_consent')) { setShowConsent(true); return; }
    login();
  }, [login]);

  const doConsentLogin = () => {
    if (!agreed) return;
    localStorage.setItem('purehome_consent', 'true');
    setShowConsent(false);
    login();
  };

  const logoIcon = siteCfg.logoUrl || '';
  const logoFull = siteCfg.logoTextUrl || '';
  const siteName = siteCfg.siteName || '';

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-sand-50/92 backdrop-blur-md border-b border-sand-300/50' : 'bg-transparent'}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 active:opacity-70 flex-shrink-0">
              {logoIcon ? <img src={logoIcon} alt={siteName} className="h-8 w-8 rounded-lg object-contain sm:hidden" /> : <div className="h-8 w-8 rounded-lg bg-sand-200 animate-pulse sm:hidden" />}
              {logoFull ? <img src={logoFull} alt={siteName} className="h-8 object-contain hidden sm:block" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div className="h-8 w-24 rounded-lg bg-sand-200 animate-pulse hidden sm:block" />}
              {siteName && <span className="font-serif text-lg italic font-semibold text-ink-900 tracking-tight hidden sm:hidden">{siteName}</span>}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {nav.map(n => (
                <button key={n.page} onClick={() => onNavigate(n.page)}
                  className={`px-4 py-1.5 rounded-full text-[13px] tracking-wide font-medium transition-all ${n.page === '_admin' ? 'text-accent-red hover:bg-accent-red/5' : currentPage === n.page ? 'bg-ink-900 text-sand-50' : 'text-ink-600 hover:text-ink-900 hover:bg-sand-200/60'}`}>
                  {n.label}
                </button>
              ))}
            </nav>

            {/* Right actions — always right-aligned */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">
              <button onClick={() => setSearchOpen(!searchOpen)} className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-500 hover:bg-sand-200/60 active:scale-95">
                <Search className="h-[18px] w-[18px]" />
              </button>
              <button onClick={toggleCart} className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-500 hover:bg-sand-200/60 active:scale-95">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {totalItems > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] flex items-center justify-center rounded-full bg-accent-red text-[9px] font-bold text-white">{totalItems > 99 ? '99+' : totalItems}</motion.span>}
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-300 bg-sand-100 overflow-hidden hover:border-sand-400 active:scale-95">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon className="h-4 w-4 text-ink-500" />}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute right-0 top-full mt-1.5 z-20 w-52 rounded-lg bg-white border border-sand-200 shadow-lg py-1">
                          <div className="px-3 py-2 border-b border-sand-100">
                            <p className="text-[12px] font-semibold text-ink-800 truncate">{user.displayName || 'User'}</p>
                            <p className="text-[10px] text-ink-400 truncate font-mono">{user.email}</p>
                          </div>
                          <button onClick={() => { onNavigate('profile'); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-ink-600 hover:bg-sand-50"><UserIcon className="h-3.5 w-3.5" /> Profile</button>
                          <button onClick={() => { onNavigate('orders'); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-ink-600 hover:bg-sand-50"><Package className="h-3.5 w-3.5" /> My Orders</button>
                          <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-accent-red hover:bg-sand-50"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={handleLogin} className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-700 hover:border-ink-400 hover:shadow-sm active:scale-[0.97]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Sign in
                </button>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-500 hover:bg-sand-200/60 md:hidden active:scale-95">
                {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-sand-200/50">
              <form onSubmit={submit} className="mx-auto max-w-md px-4 py-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" autoFocus className="w-full rounded-lg border border-sand-300 bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-ink-400 focus:ring-1 focus:ring-ink-200" />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-sand-50 border-l border-sand-200 shadow-xl">
              <div className="flex h-14 items-center justify-between px-5 border-b border-sand-200">
                <span className="text-[13px] font-semibold text-ink-800 tracking-wide uppercase">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-sand-200/60"><X className="h-[18px] w-[18px] text-ink-500" /></button>
              </div>
              <nav className="p-3 space-y-0.5">
                {nav.map(n => (
                  <button key={n.page} onClick={() => { onNavigate(n.page); setMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-[13px] font-medium ${n.page === '_admin' ? 'text-accent-red hover:bg-accent-red/5' : currentPage === n.page ? 'bg-ink-900 text-sand-50' : 'text-ink-600 hover:bg-sand-200/60'}`}>{n.label}</button>
                ))}
              </nav>
              {!user && (
                <div className="px-3 mt-2">
                  <button onClick={() => { handleLogin(); setMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-sand-300 bg-white px-3 py-3 text-[12px] font-medium text-ink-700 hover:border-ink-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Consent Modal */}
      <AnimatePresence>
        {showConsent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowConsent(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] mx-auto max-w-sm rounded-2xl bg-white border border-sand-200 shadow-2xl p-6">
              <h3 className="font-serif text-lg text-ink-900 mb-2">Before you sign in</h3>
              <p className="text-[12px] text-ink-500 leading-relaxed mb-4">Please review and agree to our policies.</p>
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-ink-900" />
                <span className="text-[12px] text-ink-600 leading-relaxed">
                  I agree to the{' '}<button onClick={() => onNavigate('privacy')} className="underline text-accent-blue">Privacy Policy</button>{' '}and{' '}<button onClick={() => onNavigate('terms')} className="underline text-accent-blue">Terms & Conditions</button>
                </span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowConsent(false)} className="flex-1 rounded-full border border-sand-300 py-2.5 text-[12px] font-semibold text-ink-600">Cancel</button>
                <button onClick={doConsentLogin} disabled={!agreed} className="flex-1 rounded-full bg-ink-900 py-2.5 text-[12px] font-semibold text-sand-50 disabled:opacity-40">Continue</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
