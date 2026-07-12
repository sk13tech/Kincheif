import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Carousel from './components/Carousel';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import Reels from './components/Reels';
import ScrollProgressButton from './components/ScrollProgressButton';
import ConsentModal from './components/ConsentModal';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ShippingPage from './pages/ShippingPage';
import RefundPage from './pages/RefundPage';
import { useCart } from './lib/useCart';
import { useGoogleAuth } from './lib/useAuth';
import { useWishlist } from './lib/useWishlist';
import { useOrders } from './lib/useOrders';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [page, setPageRaw] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState('');

  const cart = useCart();
  const authData = useGoogleAuth();
  const wishlist = useWishlist(authData.user);
  const orders = useOrders(authData.user);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── Browser history navigation ──
  const setPage = useCallback((newPage: string) => {
    setPageRaw(prev => {
      if (prev !== newPage) {
        window.history.pushState({ page: newPage }, '', `#${newPage}`);
      }
      return newPage;
    });
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    // Set initial state
    window.history.replaceState({ page: 'home' }, '', '#home');

    const onPop = (e: PopStateEvent) => {
      const target = e.state?.page || 'home';
      setPageRaw(target);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  const showBottomExtras = page === 'home';

  const requestLogin = () => {
    setConsentError('');
    setShowConsent(true);
  };

  const confirmLogin = async () => {
    setConsentError('');
    if (!consentChecked) {
      setConsentError('Please accept Terms of use and Privacy policy before login.');
      return;
    }
    setShowConsent(false);
    await authData.login();
  };

  const closeConsent = () => {
    setShowConsent(false);
    setConsentError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(p => !p)}
        onNavigate={setPage}
        cart={cart}
        orders={orders}
        wishlist={wishlist}
        onSearch={setSearchQuery}
        user={authData.user}
        isLoggedIn={authData.isLoggedIn}
        authWorking={authData.working}
        onLogin={requestLogin}
        onLogout={authData.logout}
      />

      <div style={{ flex: 1 }}>
        {page === 'home' && (
          <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 16 }}>
            {!searchQuery && <Carousel />}
            <ProductGrid cart={cart} searchQuery={searchQuery} wishlist={wishlist} isLoggedIn={authData.isLoggedIn} onLoginClick={requestLogin} />
          </div>
        )}
        {page === 'about' && <AboutPage />}
        {page === 'contact' && <ContactPage />}
        {page === 'wishlist' && <WishlistPage wishlist={wishlist} cart={cart} />}
        {page === 'orders' && <OrdersPage orders={orders} />}
        {page === 'profile' && <ProfilePage user={authData.user} />}
        {page === 'terms' && <TermsPage />}
        {page === 'privacy' && <PrivacyPage />}
        {page === 'shipping' && <ShippingPage />}
        {page === 'refund' && <RefundPage />}
      </div>

      {showBottomExtras && (
        <>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}><Reels /></div>
          <Footer onNavigate={setPage} />
        </>
      )}

      <ConsentModal
        isOpen={showConsent}
        checked={consentChecked}
        error={consentError}
        onCheckedChange={v => { setConsentChecked(v); if (v) setConsentError(''); }}
        onClose={closeConsent}
        onConfirm={confirmLogin}
        onNavigate={setPage}
      />

      <ScrollProgressButton />
    </div>
  );
}
