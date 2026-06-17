import { useState, useCallback, useEffect } from 'react';
import { CartProvider } from './store/CartContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ProductProvider } from './store/ProductContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CartSidebar from './components/CartSidebar';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccess from './components/OrderSuccess';
import OrdersPage from './components/OrdersPage';
import ProfilePage from './components/ProfilePage';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import LegalPage from './components/LegalPages';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AdminPanel from './components/AdminPanel';
import type { Product } from './types';

type Page = 'home' | 'shop' | 'about' | 'contact' | 'product' | 'checkout' | 'order-success' | 'orders' | 'privacy' | 'terms' | 'profile' | '_admin';

const validPages: Page[] = ['home', 'shop', 'about', 'contact', 'orders', 'privacy', 'terms', 'profile', '_admin'];

function getInitialPage(): Page {
  const hash = window.location.hash.replace('#', '') as Page;
  return validPages.includes(hash) ? hash : 'home';
}

function AppContent() {
  const [page, setPage] = useState<Page>(getInitialPage);
  const [product, setProduct] = useState<Product | null>(null);
  const [orderId, setOrderId] = useState('');
  const [search, setSearch] = useState('');
  const { user: _u } = useAuth(); void _u;

  const go = useCallback((p: string) => {
    const pg = p as Page;
    setPage(pg);
    if (pg !== 'shop') setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (validPages.includes(pg)) window.location.hash = pg === 'home' ? '' : pg;
  }, []);

  const viewProduct = useCallback((p: Product) => { setProduct(p); setPage('product'); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const doSearch = useCallback((q: string) => { setSearch(q); setPage('shop'); window.location.hash = 'shop'; }, []);

  const orderPlaced = useCallback((id: string) => { setOrderId(id); setPage('order-success'); window.location.hash = ''; }, []);

  // CartSidebar handles login + consent itself, then calls this
  const goCheckout = useCallback(() => {
    go('checkout');
  }, [go]);

  // Hash change listener for browser back/forward
  useEffect(() => {
    const h = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (validPages.includes(hash)) setPage(hash);
      else setPage('home');
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const showFooter = ['home', 'shop', 'about', 'contact', 'privacy', 'terms'].includes(page);
  const showHeader = page !== 'order-success' && page !== '_admin';

  return (
    <div className="min-h-screen bg-sand-50">
      {showHeader && <Header onNavigate={go} currentPage={page} onSearch={doSearch} />}
      <CartSidebar onCheckout={goCheckout} />

      {page === 'home' && (<><HeroSection onShopNow={() => go('shop')} /><ProductGrid onViewProduct={viewProduct} /><AboutSection /></>)}
      {page === 'shop' && <div className="pt-14"><ProductGrid onViewProduct={viewProduct} searchQuery={search} /></div>}
      {page === 'about' && <div className="pt-14"><AboutSection /></div>}
      {page === 'contact' && <div className="pt-14"><ContactSection /></div>}
      {page === 'orders' && <OrdersPage onBack={() => go('home')} />}
      {page === 'profile' && <ProfilePage onBack={() => go('home')} />}
      {page === 'privacy' && <LegalPage type="privacy" onBack={() => go('home')} />}
      {page === 'terms' && <LegalPage type="terms" onBack={() => go('home')} />}
      {page === 'product' && product && <ProductDetail product={product} onBack={() => go('shop')} />}
      {page === 'checkout' && <CheckoutPage onBack={() => go('shop')} onOrderPlaced={orderPlaced} />}
      {page === 'order-success' && <OrderSuccess orderId={orderId} onGoHome={() => go('home')} onViewOrders={() => go('orders')} />}
      {page === '_admin' && <AdminPanel onBack={() => go('home')} />}

      {showFooter && <Footer onNavigate={go} />}
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
