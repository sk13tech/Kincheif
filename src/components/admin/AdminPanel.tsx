import { useState, useEffect } from 'react';
import {
  Leaf, ShoppingBag, Package, Clock, CheckCircle, AlertTriangle, Settings, Bell,
  LogOut, Download, IndianRupee, CreditCard, RefreshCw, AlertCircle, ChevronRight,
  XCircle, Plus, Search, Pencil, Trash2, Star, ShieldCheck, Upload, Tag,
  MapPin, LayoutDashboard, Truck, Menu, X, Users,
  Globe, Phone, MessageSquare
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import * as store from '../../store';
import type { Product, CartItem, Customer, Order, OrderStatus, PaymentStatus, StoreSettings, ReplacementStatus, RefundStatus, Coupon } from '../../types';
import { PRESET_TAGS } from '../../types';

interface Props { setPage: (p: string, extra?: any) => void; refresh: () => void; }

export default function AdminPanel({ setPage, refresh }: Props) {
  const [tab, setTab] = useState('dashboard');
  const [, setTick] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());

  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 60000); return () => clearInterval(iv); }, []);
  // Sync fresh data on admin mount
  useEffect(() => { store.syncAll().then(() => setTick(t => t + 1)); }, []);
  // Keep admin pages aligned: on tab change, close overlays and go to top
  useEffect(() => {
    setDrawerOpen(false);
    setShowNotif(false);
    window.scrollTo(0, 0);
  }, [tab]);

  const orders = store.getOrders();
  const products = store.getProducts();
  const customers = store.getCustomers();
  const settings = store.getSettings();
  const duplicates = store.getDuplicateTransactionGroups();

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const shippedOrders = orders.filter(o => o.status === 'out_for_delivery');
  const pendingPayments = orders.filter(o => o.paymentStatus === 'uploaded');
  const pendingReplacements = orders.filter(o => o.replacementStatus === 'requested');
  const pendingRefunds = orders.filter(o => o.refundStatus === 'pending');
  const failedPayments = orders.filter(o => o.paymentStatus === 'failed' && o.status !== 'cancelled');
  const actionCount = pendingOrders.length + confirmedOrders.length + preparingOrders.length + readyOrders.length;
  const notifItems: {key:string;icon:any;cls:string;text:string;sub:string;tab:string}[] = [];
  if (pendingOrders.length > 0) notifItems.push({key:'new_orders',icon:Clock,cls:'text-emerald-500 bg-emerald-50',text:`${pendingOrders.length} new order(s)`,sub:'Needs confirmation',tab:'orders'});
  if (readyOrders.length > 0) notifItems.push({key:'ready',icon:Package,cls:'text-indigo-500 bg-indigo-50',text:`${readyOrders.length} ready to ship`,sub:'Waiting for dispatch',tab:'orders'});
  if (shippedOrders.length > 0) notifItems.push({key:'shipped',icon:Truck,cls:'text-purple-500 bg-purple-50',text:`${shippedOrders.length} out for delivery`,sub:'Mark delivered when done',tab:'orders'});
  if (pendingPayments.length > 0) notifItems.push({key:'payments',icon:CreditCard,cls:'text-amber-500 bg-amber-50',text:`${pendingPayments.length} payment(s) to verify`,sub:'Check payments',tab:'orders'});
  if (pendingReplacements.length > 0) notifItems.push({key:'replacements',icon:RefreshCw,cls:'text-blue-500 bg-blue-50',text:`${pendingReplacements.length} replacement(s)`,sub:'Customer requests',tab:'orders'});
  if (pendingRefunds.length > 0) notifItems.push({key:'refunds',icon:IndianRupee,cls:'text-orange-500 bg-orange-50',text:`${pendingRefunds.length} refund(s) pending`,sub:'Process refunds',tab:'orders'});
  if (duplicates.length > 0) notifItems.push({key:'flagged',icon:AlertTriangle,cls:'text-red-500 bg-red-50',text:`${duplicates.length} flagged TXN`,sub:'Potential fraud',tab:'flagged'});
  if (failedPayments.length > 0) notifItems.push({key:'failed',icon:XCircle,cls:'text-red-500 bg-red-50',text:`${failedPayments.length} failed payment(s)`,sub:'Consider cancelling',tab:'orders'});
  const activeNotifs = notifItems.filter(n => !dismissedNotifs.has(n.key));
  const notifCount = activeNotifs.length;
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const ordersBadge = actionCount + pendingPayments.length + pendingReplacements.length;

  const tabs: [string, string, any][] = [
    ['dashboard', 'Home', LayoutDashboard],
    ['products', 'Items', Package],
    ['orders', 'Orders', ShoppingBag],
    ['promos', 'Promos', Tag],
    ['users', 'Users', Users],
    ['flagged', 'Flags', AlertTriangle],
    ['settings', 'Config', Settings],
  ];

  const navTo = (key: string) => { setTab(key); setDrawerOpen(false); };

  // Shared sidebar content used in both desktop sidebar and mobile drawer
  const SidebarContent = (
    <>
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        {settings.logoUrl ? <img src={settings.logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" /> : <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center"><Leaf className="w-5 h-5" /></div>}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{settings.storeName}</div>
          <div className="text-[10px] text-slate-400">Admin Panel</div>
        </div>
        <button onClick={() => setDrawerOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-5 h-5" /></button>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto min-h-0">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} onClick={() => navTo(key)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all press ${tab === key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="flex items-center gap-3"><Icon className="w-[18px] h-[18px]" />{label}</span>
            {key === 'orders' && ordersBadge > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{ordersBadge}</span>}
            {key === 'flagged' && duplicates.length > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{duplicates.length}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800 shrink-0">
        <button onClick={() => { store.adminLogout(); setPage('home'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 press"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar — fixed, never scrolls with page */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-40 overflow-hidden">
        {SidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && <div className="fixed inset-0 bg-black/50 z-[60] md:hidden a-fade" onClick={() => setDrawerOpen(false)} />}

      {/* Mobile drawer */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-white z-[70] md:hidden flex flex-col transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {SidebarContent}
      </aside>

      {/* Main */}
      <main className="md:ml-64 min-h-screen pb-6 overflow-x-hidden">
        {/* Top bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 md:px-5 py-3 md:py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="md:hidden p-2 -ml-1 hover:bg-slate-100 rounded-xl press">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 capitalize">{tab === 'flagged' ? 'Flagged TXN' : tab}</h1>
          </div>
          <div className="flex items-center gap-2">
            {(tab === 'orders' || tab === 'products') && (
              <button onClick={() => { if (tab === 'orders') store.downloadCSV(store.exportOrdersCSV(), 'orders.csv'); else store.downloadCSV(store.exportProductsCSV(), 'products.csv'); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl press transition-colors">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="relative p-2.5 hover:bg-slate-100 rounded-xl press">
                <Bell className="w-5 h-5 text-slate-500" />
                {notifCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />}
              </button>
              {showNotif && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                  <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border z-50 a-slide-down overflow-hidden">
                    <div className="p-4 border-b font-bold text-sm flex items-center justify-between">
                      <span>Notifications</span>
                      {activeNotifs.length > 0 && <button onClick={() => setDismissedNotifs(new Set(notifItems.map(n => n.key)))} className="text-xs text-slate-400 hover:text-slate-600 press">Mark all read</button>}
                    </div>
                    <div className="divide-y max-h-80 overflow-y-auto">
                      {activeNotifs.map(n => (
                        <NR key={n.key} icon={n.icon} cls={n.cls} text={n.text} sub={n.sub} onClick={() => { setDismissedNotifs(prev => new Set([...prev, n.key])); setTab(n.tab); setShowNotif(false); }} />
                      ))}
                      {activeNotifs.length === 0 && <div className="p-6 text-center text-slate-400 text-sm"><CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-400" />All caught up!</div>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {tab === 'dashboard' && <DashboardTab orders={orders} products={products} customers={customers} revenue={revenue} pendingOrders={pendingOrders} confirmedOrders={confirmedOrders} preparingOrders={preparingOrders} readyOrders={readyOrders} shippedOrders={shippedOrders} pendingPayments={pendingPayments} pendingReplacements={pendingReplacements} failedPayments={failedPayments} setTab={setTab} />}
          {tab === 'products' && <ProductsTab refresh={refresh} setTick={setTick} />}
          {tab === 'orders' && <OrdersTab customers={customers} setTick={setTick} />}
          {tab === 'promos' && <PromosTab setTick={setTick} />}
          {tab === 'users' && <UsersTab />}
          {tab === 'flagged' && <FlaggedTab duplicates={duplicates} />}
          {tab === 'settings' && <SettingsTab settings={settings} refresh={refresh} />}
        </div>
      </main>
    </div>
  );
}

function NR({ icon: Icon, cls, text, sub, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left press">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-700">{text}</p><p className="text-[11px] text-slate-400">{sub}</p></div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}

/* ================================================================
   DASHBOARD
================================================================ */
function DashboardTab({ orders, products, customers, revenue, pendingOrders, confirmedOrders, preparingOrders, readyOrders, shippedOrders, pendingPayments, pendingReplacements, failedPayments, setTab }: any) {
  const delivered = orders.filter((o: Order) => o.status === 'delivered');
  const cancelled = orders.filter((o: Order) => o.status === 'cancelled');
  const nonCancelled = orders.filter((o: Order) => o.status !== 'cancelled');
  const avgOrder = nonCancelled.length ? Math.round(revenue / nonCancelled.length) : 0;
  const recentPendingOrders = [...pendingOrders].sort((a: Order, b: Order) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl">
      <div><h2 className="text-xl font-bold text-slate-800">Dashboard</h2><p className="text-slate-500 text-sm">Business at a glance</p></div>

      {/* Big stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [IndianRupee, 'Revenue', `₹${revenue.toLocaleString()}`, `${orders.length} orders`, 'from-emerald-500 to-emerald-600'],
          [ShoppingBag, 'Orders', orders.length, `${delivered.length} delivered`, 'from-blue-500 to-blue-600'],
          [Clock, 'Pending', pendingOrders.length, 'Needs action', 'from-amber-400 to-amber-500'],
          [Package, 'Products', products.length, 'Active items', 'from-purple-500 to-purple-600'],
        ].map(([Icon, title, value, sub, grad]: any, i) => (
          <div key={i} className={`bg-gradient-to-br ${grad} rounded-2xl p-5 text-white shadow-lg`}>
            <Icon className="w-7 h-7 opacity-80 mb-3" />
            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="text-sm font-semibold mt-1 opacity-90">{title}</p>
            <p className="text-xs opacity-70 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Order pipeline */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">Order Pipeline</h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {[
            ['New', pendingOrders.length, 'bg-amber-50 border-amber-200 text-amber-700'],
            ['Confirmed', confirmedOrders.length, 'bg-blue-50 border-blue-200 text-blue-700'],
            ['Preparing', preparingOrders.length, 'bg-indigo-50 border-indigo-200 text-indigo-700'],
            ['Ready', readyOrders.length, 'bg-purple-50 border-purple-200 text-purple-700'],
            ['Shipped', shippedOrders.length, 'bg-orange-50 border-orange-200 text-orange-700'],
            ['Delivered', delivered.length, 'bg-emerald-50 border-emerald-200 text-emerald-700'],
            ['Replace', pendingReplacements?.length || 0, 'bg-sky-50 border-sky-200 text-sky-700'],
          ].map(([label, val, cls]: any, i) => (
            <button key={i} onClick={() => setTab(i === 6 ? 'orders' : 'orders')} className={`${cls} border rounded-xl p-3 text-center press hover:opacity-80 transition-opacity`}>
              <p className="text-xl font-extrabold">{val}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action alerts */}
      <div className="space-y-2">
        {readyOrders.length > 0 && <AlertCard icon={Truck} bg="bg-purple-50 border-purple-200" iconBg="bg-purple-500" title={`${readyOrders.length} order(s) ready to ship`} sub="Dispatch these orders now" onClick={() => setTab('orders')} />}
        {shippedOrders.length > 0 && <AlertCard icon={Package} bg="bg-orange-50 border-orange-200" iconBg="bg-orange-500" title={`${shippedOrders.length} order(s) out for delivery`} sub="Mark delivered when completed" onClick={() => setTab('orders')} />}
        {pendingOrders.length > 0 && <AlertCard icon={Clock} bg="bg-amber-50 border-amber-200" iconBg="bg-amber-500" title={`${pendingOrders.length} new order(s)`} sub="Confirm these orders" onClick={() => setTab('orders')} />}
        {pendingPayments.length > 0 && <AlertCard icon={CreditCard} bg="bg-yellow-50 border-yellow-200" iconBg="bg-yellow-500" title={`${pendingPayments.length} payment(s) to verify`} sub="Check screenshots" onClick={() => setTab('orders')} />}
        {pendingReplacements?.length > 0 && <AlertCard icon={RefreshCw} bg="bg-blue-50 border-blue-200" iconBg="bg-blue-500" title={`${pendingReplacements.length} replacement(s)`} sub="Review requests" onClick={() => setTab('orders')} />}
        {failedPayments.length > 0 && <AlertCard icon={AlertCircle} bg="bg-red-50 border-red-200" iconBg="bg-red-500" title={`${failedPayments.length} failed payment(s)`} sub="Cancel these orders" onClick={() => setTab('orders')} />}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        {[['Customers', customers.length], ['Avg Order', `₹${avgOrder}`], ['Cancelled', cancelled.length]].map(([l, v]: any, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-800">{v}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{l}</p>
          </div>
        ))}
      </div>

      {/* Replacements moved to Orders → Replacements sub-tab */}
      {pendingReplacements?.length > 0 && (
        <AlertCard icon={RefreshCw} bg="bg-blue-50 border-blue-200" iconBg="bg-blue-500" title={`${pendingReplacements.length} replacement(s) pending`} sub="Go to Orders → Replacements" onClick={() => setTab('orders')} />
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Pending Orders</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Oldest to newest</p>
          </div>
          <button onClick={() => setTab('orders')} className="text-sm text-emerald-600 font-semibold press">View all →</button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {recentPendingOrders.length === 0 ? (
            <div className="p-12 text-center"><ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-200" /><p className="text-slate-400">No pending orders</p></div>
          ) : recentPendingOrders.map((o: Order) => {
            const cust = customers.find((c: Customer) => c.id === o.customerId);
            const cn = cust?.name || o.address?.name || 'Customer';
            return (
              <button key={o.id} onClick={() => setTab('orders')} className="w-full flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 text-left press transition-colors">
                <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">{cn[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{cn}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{o.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">₹{o.total}</p>
                  <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'default'} className="mt-0.5">{o.status.replace(/_/g, ' ')}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-4">
        {[
          ['Add Product', Plus, 'bg-emerald-500 text-white', () => setTab('products')],
          ['All Orders', ShoppingBag, 'bg-blue-500 text-white', () => setTab('orders')],
          ['Export CSV', Download, 'bg-purple-500 text-white', () => store.downloadCSV(store.exportOrdersCSV(), 'orders.csv')],
          ['Settings', Settings, 'bg-slate-700 text-white', () => setTab('settings')],
        ].map(([label, Icon, cls, fn]: any, i) => (
          <button key={i} onClick={fn} className={`${cls} rounded-2xl p-5 text-left press hover:opacity-90 transition-opacity shadow-lg`}>
            <Icon className="w-6 h-6 mb-3 opacity-80" />
            <span className="font-bold text-sm block">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertCard({ icon: Icon, bg, iconBg, title, sub, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full ${bg} border rounded-2xl p-4 flex items-center gap-4 press text-left hover:opacity-90 transition-opacity`}>
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg`}><Icon className="w-5 h-5" /></div>
      <div className="flex-1"><p className="font-bold text-sm text-slate-800">{title}</p><p className="text-xs text-slate-500">{sub}</p></div>
      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
    </button>
  );
}

/* ================================================================
   PRODUCTS
================================================================ */
function ProductsTab({ refresh, setTick }: any) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({ name: '', description: '', price: '', originalPrice: '', stockQty: '20', category: '', weight: '100g', spiceLevel: '0', image: '', images: '', ingredients: '', tags: [] as string[], inStock: true, featured: false });
  const products = store.getProducts().filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setEditProduct(null); setForm({ name: '', description: '', price: '', originalPrice: '', stockQty: '20', category: '', weight: '100g', spiceLevel: '0', image: '', images: '', ingredients: '', tags: [], inStock: true, featured: false }); setShowForm(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setForm({ name: p.name, description: p.description, price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : '', stockQty: String(p.stockQty), category: p.category, weight: p.weight, spiceLevel: String(p.spiceLevel), image: p.image, images: p.images.join(', '), ingredients: p.ingredients.join(', '), tags: [...p.tags], inStock: p.inStock, featured: p.featured }); setShowForm(true); };
  const saveProduct = () => {
    if (!form.name || !form.price || !form.category) return;
    const qty = parseInt(form.stockQty) || 0;
    const p: Product = { id: editProduct?.id || `p_${Date.now()}`, name: form.name, description: form.description, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, image: form.image || '/images/classic-salted.jpg', images: form.images ? form.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [form.image || '/images/classic-salted.jpg'], category: form.category, weight: form.weight, stockQty: qty, inStock: qty > 0, featured: form.featured, spiceLevel: Number(form.spiceLevel), ingredients: form.ingredients ? form.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : [], tags: form.tags, createdAt: editProduct?.createdAt || new Date().toISOString() };
    if (editProduct) store.updateProduct(p); else store.addProduct(p);
    setShowForm(false); setTick((t: number) => t + 1); refresh();
  };
  const toggleTag = (tag: string) => setForm((f: any) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t: string) => t !== tag) : [...f.tags, tag] }));

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const count = await store.importProductsCSV(text);
    if (count > 0) { setTick((t: number) => t + 1); refresh(); }
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        <Button onClick={openAdd} className="shrink-0"><Plus className="w-4 h-4" /> Add</Button>
      </div>
      <div className="flex gap-2 mb-5">
        <button onClick={() => store.downloadCSV(store.exportProductsCSV(), 'products.csv')} className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg press transition-colors">
          <Download className="w-3.5 h-3.5" /> Download CSV
        </button>
        <label className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg press transition-colors cursor-pointer">
          <Upload className="w-3.5 h-3.5" /> Upload CSV
          <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
        </label>
      </div>
      <div className="space-y-2 pb-4">
        {products.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><p className="font-bold text-slate-800 truncate">{p.name}</p>{p.featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}</div>
              <p className="text-xs text-slate-400 mt-0.5">{p.category} • {p.weight}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-bold text-slate-800">₹{p.price}</span>
                {p.originalPrice && <span className="text-xs text-slate-400 line-through">₹{p.originalPrice}</span>}
                <Badge variant={p.stockQty === 0 ? 'error' : p.stockQty <= 5 ? 'warning' : 'success'}>{p.stockQty === 0 ? 'Out' : p.stockQty <= 5 ? `Low (${p.stockQty})` : `${p.stockQty} in stock`}</Badge>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => openEdit(p)} className="p-2.5 hover:bg-slate-100 rounded-xl press"><Pencil className="w-4 h-4 text-slate-400" /></button>
              <button onClick={() => { if (confirm('Delete?')) { store.deleteProduct(p.id); setTick((t: number) => t + 1); } }} className="p-2.5 hover:bg-red-50 rounded-xl press"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Name *</label><input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Description</label><textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Price *</label><input type="number" value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">MRP</label><input type="number" value={form.originalPrice} onChange={e => setForm((f: any) => ({ ...f, originalPrice: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Stock</label><input type="number" value={form.stockQty} onChange={e => setForm((f: any) => ({ ...f, stockQty: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Category *</label><input value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Weight</label><input value={form.weight} onChange={e => setForm((f: any) => ({ ...f, weight: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Spice Level</label><select value={form.spiceLevel} onChange={e => setForm((f: any) => ({ ...f, spiceLevel: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Image URL</label>
              <input value={form.image} onChange={e => setForm((f: any) => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              {form.image && <img src={form.image} alt="" className="w-20 h-20 rounded-xl object-cover mt-2 border" onError={e => (e.target as HTMLElement).style.display = 'none'} onLoad={e => (e.target as HTMLElement).style.display = 'block'} />}
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Gallery (comma-separated URLs)</label>
              <input value={form.images} onChange={e => setForm((f: any) => ({ ...f, images: e.target.value }))} placeholder="url1, url2, url3" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              {form.images && <div className="flex gap-2 mt-2 overflow-x-auto">{form.images.split(',').filter((u: string) => u.trim()).map((u: string, i: number) => <img key={i} src={u.trim()} alt="" className="w-14 h-14 rounded-lg object-cover border shrink-0" onError={e => (e.target as HTMLElement).style.display = 'none'} />)}</div>}
            </div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Ingredients (comma-separated)</label><input value={form.ingredients} onChange={e => setForm((f: any) => ({ ...f, ingredients: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Tags</label><div className="flex flex-wrap gap-2">{PRESET_TAGS.map(t => <button key={t} onClick={() => toggleTag(t)} className={`px-3 py-1 rounded-full text-xs font-medium press ${form.tags.includes(t) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>)}</div></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={e => setForm((f: any) => ({ ...f, featured: e.target.checked }))} className="rounded" /><span className="text-sm">Featured</span></label>
          </div>
          <Button className="w-full" onClick={saveProduct}>{editProduct ? 'Update' : 'Add Product'}</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ================================================================
   ORDERS
================================================================ */
function OrdersTab({ customers, setTick }: any) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [txnCheck, setTxnCheck] = useState('');
  const [txnResult, setTxnResult] = useState<any>(null);
  const [deliverConfirm, setDeliverConfirm] = useState(false);
  const [refundTxnInput, setRefundTxnInput] = useState('');
  const [sortBy, setSortBy] = useState<'newest'|'oldest'|'highest'|'lowest'>('newest');
  const [subTab, setSubTab] = useState<'orders'|'replacements'>('orders');
  const [repFilter, setRepFilter] = useState('all');
  const [cancelConfirmId, setCancelConfirmId] = useState<string|null>(null);

  let orders = store.getOrders();
  // Sort
  if (sortBy === 'newest') orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sortBy === 'oldest') orders.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  else if (sortBy === 'highest') orders.sort((a,b) => b.total - a.total);
  else if (sortBy === 'lowest') orders.sort((a,b) => a.total - b.total);

  if (search) orders = orders.filter((o: Order) => { const c = customers.find((x: Customer) => x.id === o.customerId); return o.id.toLowerCase().includes(search.toLowerCase()) || (c?.name || '').toLowerCase().includes(search.toLowerCase()) || (c?.phone || '').includes(search); });
  if (statusFilter !== 'all') { if (['pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'].includes(statusFilter)) orders = orders.filter((o: Order) => o.status === statusFilter); else orders = orders.filter((o: Order) => o.paymentStatus === statusFilter); }

  const replacementOrders = store.getOrders().filter((o: Order) => o.replacementStatus);

  const updateStatus = (id: string, s: OrderStatus) => { store.updateOrderStatus(id, s); setSelectedOrder(store.getOrder(id) || null); setTick((t: number) => t + 1); };
  const updatePayment = (id: string, s: PaymentStatus) => { store.updatePaymentStatus(id, s); setSelectedOrder(store.getOrder(id) || null); setTick((t: number) => t + 1); };
  const updateReplacement = (id: string, s: ReplacementStatus) => { const o = store.getOrder(id); if (!o) return; o.replacementStatus = s; o.updatedAt = new Date().toISOString(); store.updateOrder(o); setSelectedOrder(store.getOrder(id) || null); setTick((t: number) => t + 1); };
  const updateRefund = (id: string, s: RefundStatus) => { const o = store.getOrder(id); if (!o) return; if (s === 'completed' && !refundTxnInput.trim()) return; o.refundStatus = s; if (s === 'completed') o.refundTxnId = refundTxnInput.trim(); o.updatedAt = new Date().toISOString(); store.updateOrder(o); setSelectedOrder(store.getOrder(id) || null); setTick((t: number) => t + 1); };

  const pills = ['all','pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled'];

  return (
    <div>
      {/* Sub-tabs: Orders / Replacements */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
        <button onClick={() => setSubTab('orders')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all press ${subTab === 'orders' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Orders</button>
        <button onClick={() => setSubTab('replacements')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all press relative ${subTab === 'replacements' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
          Replacements
          {replacementOrders.length > 0 && <span className="ml-1.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{replacementOrders.length}</span>}
        </button>
      </div>

      {subTab === 'replacements' ? (
        /* Replacement list */
        <div>
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {['all','requested','accepted','shipping','completed','rejected'].map(f=>(
              <button key={f} onClick={()=>setRepFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap press ${repFilter===f?'bg-blue-600 text-white':'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>{f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">₹ High→Low</option>
              <option value="lowest">₹ Low→High</option>
            </select>
          </div>
          <div className="space-y-2 pb-4">
            {(()=>{let reps=[...replacementOrders];if(repFilter!=='all')reps=reps.filter(o=>o.replacementStatus===repFilter);if(sortBy==='oldest')reps.sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());else if(sortBy==='highest')reps.sort((a,b)=>b.total-a.total);else if(sortBy==='lowest')reps.sort((a,b)=>a.total-b.total);else reps.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());return reps;})().length === 0 ? (
              <div className="text-center py-12 text-slate-400"><RefreshCw className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No {repFilter==='all'?'':repFilter} replacements</p></div>
            ) : (()=>{let reps=[...replacementOrders];if(repFilter!=='all')reps=reps.filter(o=>o.replacementStatus===repFilter);if(sortBy==='oldest')reps.sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());else if(sortBy==='highest')reps.sort((a,b)=>b.total-a.total);else if(sortBy==='lowest')reps.sort((a,b)=>a.total-b.total);else reps.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());return reps;})().map((o: Order) => {
              const cn = customers.find((c: Customer) => c.id === o.customerId)?.name || o.address?.name || 'Customer';
              const rs = o.replacementStatus!;
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                  <button onClick={() => { setSelectedOrder(store.getOrder(o.id) || o); setDeliverConfirm(false); setRefundTxnInput(o.refundTxnId || ''); setSubTab('orders'); }} className="w-full flex items-center gap-3 mb-3 text-left press">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">{cn[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{cn}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{o.id} • ₹{o.total} • {new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={rs==='completed'?'success':rs==='rejected'?'error':'info'}>{rs}</Badge>
                  </button>
                  {rs !== 'completed' && rs !== 'rejected' && (
                    <div className="flex gap-2 flex-wrap">
                      {(['accepted','shipping','completed','rejected'] as ReplacementStatus[]).filter(s => {
                        if (rs === 'requested') return ['accepted','rejected'].includes(s);
                        if (rs === 'accepted') return s === 'shipping';
                        if (rs === 'shipping') return s === 'completed';
                        return false;
                      }).map(s => (
                        <button key={s} onClick={() => updateReplacement(o.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold press ${s==='rejected'?'bg-red-100 text-red-600 hover:bg-red-200':s==='completed'?'bg-emerald-100 text-emerald-600 hover:bg-emerald-200':'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                          {s === 'shipping' ? 'Ship' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
      /* Orders list */
      <>
      <div className="space-y-3 mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">₹ High→Low</option>
            <option value="lowest">₹ Low→High</option>
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          {pills.map(f => <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap press transition-all ${statusFilter === f ? 'bg-slate-800 text-white shadow' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>{f === 'all' ? 'All' : f === 'out_for_delivery' ? 'Shipped' : f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex gap-2">
          <input value={txnCheck} onChange={e => setTxnCheck(e.target.value)} placeholder="Check TXN ID..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" />
          <Button size="sm" onClick={() => { if (txnCheck.trim()) setTxnResult(store.findOrdersByTxnId(txnCheck.trim())); }}>Check</Button>
        </div>
        {txnResult !== null && <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${txnResult.length === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{txnResult.length === 0 ? <><ShieldCheck className="w-4 h-4" /> Safe to accept</> : <><AlertTriangle className="w-4 h-4" /> Found in {txnResult.length} order(s)</>}</div>}
      </div>

      <div className="space-y-2 pb-4">
        {orders.map((o: Order) => {
          const cust = customers.find((c: Customer) => c.id === o.customerId);
          const custName = cust?.name || o.address?.name || 'Customer';
          return (
            <button key={o.id} onClick={() => { setSelectedOrder(store.getOrder(o.id) || o); setDeliverConfirm(false); setRefundTxnInput(o.refundTxnId || ''); }} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-emerald-300 press transition-all">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">{custName[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-bold text-slate-800 truncate">{custName}</p><span className="text-[10px] font-mono text-slate-400">{o.id}</span></div>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item(s)</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-lg text-slate-800">₹{o.total}</p>
                  <div className="flex gap-1 justify-end mt-0.5">
                    <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'default'}>{o.status === 'out_for_delivery' ? 'shipped' : o.status}</Badge>
                    <Badge variant={o.paymentStatus === 'verified' ? 'success' : o.paymentStatus === 'failed' ? 'error' : 'warning'}>{o.paymentStatus}</Badge>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {orders.length === 0 && <div className="text-center py-16 text-slate-400">No orders found</div>}
      </div>

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `Order ${selectedOrder.id}` : 'Order'} size="full">
        {selectedOrder && (() => {
          const o = selectedOrder;
          const cust = customers.find((c: Customer) => c.id === o.customerId);
          const dupes = o.upiTransactionId ? store.findOrdersByTxnId(o.upiTransactionId).filter((x: Order) => x.id !== o.id) : [];
          const isLocked = o.status === 'delivered' || o.status === 'cancelled';

          return (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-mono mb-1">{o.id}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={o.paymentStatus === 'verified' ? 'success' : o.paymentStatus === 'failed' ? 'error' : 'warning'} dot>Payment: {o.paymentStatus}</Badge>
                  <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'default'} dot>{o.status.replace(/_/g, ' ')}</Badge>
                  {o.couponDiscount && <Badge variant="info" dot>Coupon: {o.couponCode} -₹{o.couponDiscount}</Badge>}
                  {o.refundStatus && <Badge variant={o.refundStatus === 'completed' ? 'success' : 'warning'} dot>Refund: {o.refundStatus}</Badge>}
                </div>
                <p className="text-xs text-slate-400 mt-2">{new Date(o.createdAt).toLocaleString()}</p>
              </div>

              {o.couponDiscount && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm font-semibold text-blue-800">Coupon {o.couponCode} discount</p>
                  <p className="text-xs text-blue-600 mt-1">Customer saved ₹{o.couponDiscount} on this order</p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-sm text-slate-700 mb-2">Items</h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y">
                  {o.items.map((item: CartItem) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-4">
                      <img src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0"><p className="font-semibold text-slate-800">{item.product.name}</p><p className="text-xs text-slate-400">{item.product.weight} • Qty: {item.quantity}</p></div>
                      <p className="font-bold text-slate-800 shrink-0">₹{item.product.price * item.quantity}</p>
                    </div>
                  ))}
                  {o.couponDiscount && <div className="flex justify-between px-4 py-3 bg-blue-50 text-blue-700 text-sm font-semibold"><span>Coupon {o.couponCode} discount</span><span>-₹{o.couponDiscount}</span></div>}
                  <div className="flex justify-between p-4 bg-slate-50 font-bold text-slate-800"><span>Total</span><span>₹{o.total}</span></div>
                </div>
              </div>

              {dupes.length > 0 && (
                <div className="border-2 border-red-300 bg-red-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Duplicate Transaction ID!</p>
                  <p className="text-xs text-red-600 font-mono mt-1 mb-3">{o.upiTransactionId}</p>
                  <div className="space-y-2">
                    {[o, ...dupes].map((d: Order) => (
                      <div key={d.id} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                        <div><p className="text-xs font-mono text-red-600 font-bold">{d.id}</p><p className="text-xs text-red-500">₹{d.total}</p></div>
                        <div className="flex gap-1"><Badge variant={d.status === 'delivered' ? 'success' : d.status === 'cancelled' ? 'error' : d.status === 'pending' ? 'warning' : 'default'}>{d.status.replace(/_/g, ' ')}</Badge><Badge variant={d.paymentStatus === 'verified' ? 'success' : d.paymentStatus === 'failed' ? 'error' : 'warning'}>{d.paymentStatus}</Badge></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-sm text-slate-800 mb-3">Payment Status</h4>
                {isLocked ? <Badge variant={o.paymentStatus === 'verified' ? 'success' : 'default'}>{o.paymentStatus} (locked)</Badge> : (
                  <div className="flex gap-2 flex-wrap">{(['pending','uploaded','verified','failed'] as PaymentStatus[]).map(s => <button key={s} onClick={() => updatePayment(o.id, s)} className={`px-4 py-2 rounded-xl text-xs font-bold press transition-all ${o.paymentStatus === s ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{s}</button>)}</div>
                )}
                {o.upiTransactionId && (
                  <div className="mt-3 flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">TXN ID</p><code className="text-sm font-mono font-bold">{o.upiTransactionId}</code></div>
                    {dupes.length === 0 ? <Badge variant="success"><ShieldCheck className="w-3.5 h-3.5" /> OK</Badge> : <Badge variant="error">DUPLICATE</Badge>}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-sm text-slate-800 mb-3">Delivery Status</h4>
                {o.paymentStatus === 'failed' && o.status !== 'cancelled' ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-medium">Payment failed — only cancel action is allowed</p>
                    <p className="text-xs text-red-500 mt-1">Verify payment first if you want to continue processing.</p>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {(['pending','confirmed','preparing','ready','out_for_delivery','delivered'] as OrderStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === 'delivered') { setDeliverConfirm(true); return; }
                          updateStatus(o.id, s);
                        }}
                        disabled={o.status === 'cancelled' || o.status === 'delivered'}
                        className={`px-4 py-2 rounded-full text-xs font-bold press transition-all ${o.status === s ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} ${(o.status === 'cancelled' || o.status === 'delivered') ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {s === 'out_for_delivery' ? 'shipped' : s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Admin-only delivery failure actions */}
                {o.status !== 'delivered' && o.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Actions</p>
                    {cancelConfirmId === o.id ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-sm text-red-700 font-medium mb-2">Cancel this order and mark delivery failed?</p>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            const ord = store.getOrder(o.id); if (!ord) return;
                            ord.status = 'cancelled'; ord.updatedAt = new Date().toISOString();
                            if (ord.paymentStatus === 'verified' || ord.paymentStatus === 'uploaded') ord.refundStatus = 'pending';
                            store.updateOrder(ord); setSelectedOrder(store.getOrder(o.id) || null);
                            setTick((t: number) => t + 1); setCancelConfirmId(null);
                          }} className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 text-white press hover:bg-red-700">Yes, Cancel</button>
                          <button onClick={() => setCancelConfirmId(null)} className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 press hover:bg-slate-200">No</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setCancelConfirmId(o.id)} className="px-4 py-2 rounded-full text-xs font-bold press bg-red-100 text-red-600 hover:bg-red-200">
                          delivery failed
                        </button>
                        {o.refundStatus && <span className="px-4 py-2 rounded-full text-xs font-bold bg-orange-100 text-orange-600">refund in 5-7 working days</span>}
                      </div>
                    )}
                  </div>
                )}

                {deliverConfirm && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                    <p className="font-bold text-amber-800 text-xs mb-2">Mark as delivered?</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { updateStatus(o.id, 'delivered'); setDeliverConfirm(false); }}>Yes</Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeliverConfirm(false)}>No</Button>
                    </div>
                  </div>
                )}
              </div>

              {o.paymentStatus === 'failed' && o.status !== 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-bold text-red-700 text-sm mb-2"><AlertCircle className="w-4 h-4 inline mr-1" />Payment Failed</p>
                  {cancelConfirmId === `pf_${o.id}` ? (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="danger" onClick={() => { store.cancelOrder(o.id); setSelectedOrder(store.getOrder(o.id) || null); setTick((t: number) => t + 1); setCancelConfirmId(null); }}>Yes, Cancel</Button>
                      <Button size="sm" variant="ghost" onClick={() => setCancelConfirmId(null)}>No</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => setCancelConfirmId(`pf_${o.id}`)}><XCircle className="w-4 h-4" /> Cancel Order</Button>
                  )}
                </div>
              )}

              {o.status === 'cancelled' && o.refundStatus && (
                <div className={`rounded-xl p-4 border ${o.refundStatus === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                  <h4 className="font-bold text-sm mb-2">Refund</h4>
                  {o.refundStatus === 'completed' ? <><Badge variant="success" dot>Completed</Badge>{o.refundTxnId && <code className="block text-xs mt-1 font-mono">{o.refundTxnId}</code>}</> : (
                    <><div className="flex gap-2 flex-wrap mb-3">{(['pending','processed','completed'] as RefundStatus[]).map(s => <button key={s} onClick={() => updateRefund(o.id, s)} className={`px-4 py-2 rounded-xl text-xs font-bold press ${o.refundStatus === s ? 'bg-orange-500 text-white' : 'bg-white text-slate-500'}`}>{s}</button>)}</div>
                    <input value={refundTxnInput} onChange={e => setRefundTxnInput(e.target.value)} placeholder="Refund TXN ID (required)" className="w-full px-3 py-2 bg-white border rounded-lg text-sm" /></>
                  )}
                </div>
              )}

              {o.replacementStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-blue-800 mb-2 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Replacement</h4>
                  <div className="flex gap-2 flex-wrap">{(['requested','accepted','shipping','completed','rejected'] as ReplacementStatus[]).map(s => <button key={s} onClick={() => updateReplacement(o.id, s)} className={`px-4 py-2 rounded-xl text-xs font-bold press ${o.replacementStatus === s ? 'bg-blue-500 text-white' : 'bg-white text-slate-500'}`}>{s === 'shipping' ? 'Re-shipping' : s}</button>)}</div>
                </div>
              )}

              {/* Payment screenshot removed */}

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Customer</h4>
                <p className="text-sm font-medium text-slate-800">{cust?.name || o.address?.name || 'N/A'} • {cust?.phone || o.address?.phone || ''}</p>
                <p className="text-sm text-slate-500 mt-1">{o.address.address}, {o.address.city} - {o.address.pincode}</p>
              </div>

              {o.notes && <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Notes</p><p className="text-sm text-slate-700">{o.notes}</p></div>}
            </div>
          );
        })()}
      </Modal>
      </>
      )}
    </div>
  );
}

/* ================================================================
   PROMOS — Coupon management
================================================================ */
function PromosTab({ setTick }: any) {
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', type: 'percent' as 'percent' | 'flat', value: '', minOrder: '0', maxDiscount: '', maxUses: '0', perUser: '1', validFrom: '', validUntil: '', description: '', active: true });
  const coupons = store.getCoupons();

  const openAdd = () => {
    setEditCoupon(null);
    const now = new Date(); const later = new Date(now.getTime() + 30 * 86400000);
    setForm({ code: '', type: 'percent', value: '', minOrder: '0', maxDiscount: '', maxUses: '0', perUser: '1', validFrom: now.toISOString().slice(0, 10), validUntil: later.toISOString().slice(0, 10), description: '', active: true });
    setShowForm(true);
  };
  const openEdit = (c: Coupon) => {
    setEditCoupon(c);
    setForm({ code: c.code, type: c.type, value: String(c.value), minOrder: String(c.minOrder), maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '', maxUses: String(c.maxUses), perUser: String(c.perUser), validFrom: c.validFrom.slice(0, 10), validUntil: c.validUntil.slice(0, 10), description: c.description, active: c.active });
    setShowForm(true);
  };
  const save = async () => {
    if (!form.code || !form.value) return;
    const c: Coupon = {
      id: editCoupon?.id || `cpn_${Date.now()}`, code: form.code.toUpperCase().trim(), type: form.type,
      value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      maxUses: Number(form.maxUses) || 0, usedCount: editCoupon?.usedCount || 0, perUser: Number(form.perUser) || 0,
      validFrom: new Date(form.validFrom).toISOString(), validUntil: new Date(form.validUntil + 'T23:59:59').toISOString(),
      active: form.active, description: form.description, createdAt: editCoupon?.createdAt || new Date().toISOString(),
    };
    await store.saveCoupon(c); setShowForm(false); setTick((t: number) => t + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Tag className="w-5 h-5 text-purple-500" /> Promotions</h2><p className="text-sm text-slate-500 mt-0.5">Manage coupon codes</p></div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> New Coupon</Button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200"><Tag className="w-10 h-10 mx-auto mb-3 text-slate-200" /><p className="text-slate-400">No coupons yet</p><button onClick={openAdd} className="mt-3 text-sm text-emerald-600 font-semibold press">Create your first coupon</button></div>
      ) : (
        <div className="space-y-2 pb-4">
          {coupons.map(c => {
            const expired = new Date(c.validUntil) < new Date();
            const exhausted = c.maxUses > 0 && c.usedCount >= c.maxUses;
            return (
              <div key={c.id} className={`bg-white border rounded-2xl p-4 ${!c.active || expired || exhausted ? 'opacity-60 border-slate-200' : 'border-purple-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold">{c.code}</code>
                    {!c.active && <Badge variant="default">Inactive</Badge>}
                    {expired && <Badge variant="error">Expired</Badge>}
                    {exhausted && <Badge variant="warning">Used up</Badge>}
                    {c.active && !expired && !exhausted && <Badge variant="success" dot>Active</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 hover:bg-slate-100 rounded-lg press"><Pencil className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={() => { if (confirm('Delete coupon?')) { store.deleteCoupon(c.id); setTick((t: number) => t + 1); } }} className="p-2 hover:bg-red-50 rounded-lg press"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 font-medium">{c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}{c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}</p>
                <p className="text-xs text-slate-400 mt-1">Min order: ₹{c.minOrder} • Used: {c.usedCount}/{c.maxUses || '∞'} • Valid: {new Date(c.validFrom).toLocaleDateString()} – {new Date(c.validUntil).toLocaleDateString()}</p>
                {c.description && <p className="text-xs text-slate-500 mt-1">{c.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editCoupon ? 'Edit Coupon' : 'New Coupon'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Coupon Code *</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Discount Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"><option value="percent">Percentage (%)</option><option value="flat">Flat Amount (₹)</option></select></div>
            <div><label className="text-xs text-slate-500 mb-1 block">{form.type === 'percent' ? 'Percentage (%)' : 'Amount (₹)'} *</label><input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Min Order (₹)</label><input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            {form.type === 'percent' && <div><label className="text-xs text-slate-500 mb-1 block">Max Discount (₹)</label><input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="No cap" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>}
            <div><label className="text-xs text-slate-500 mb-1 block">Total Uses (0=∞)</label><input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Per User (0=∞)</label><input type="number" value={form.perUser} onChange={e => setForm(f => ({ ...f, perUser: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Valid From</label><input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-xs text-slate-500 mb-1 block">Valid Until</label><input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div className="col-span-2"><label className="text-xs text-slate-500 mb-1 block">Description</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Summer sale - 20% off on all orders" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" /><span className="text-sm">Active</span></label>
          </div>
          <Button className="w-full" onClick={save}>{editCoupon ? 'Update Coupon' : 'Create Coupon'}</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ================================================================
   USERS — Search customers by email, view their orders
================================================================ */
function UsersTab() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await store.searchCustomers(search.trim());
    setResults(res);
    setLoading(false);
  };

  const viewCustomer = async (c: Customer) => {
    setSelectedCustomer(c);
    setLoading(true);
    const orders = await store.getOrdersByCustomerId(c.id);
    setCustomerOrders(orders);
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Customer Lookup</h2>
        <p className="text-sm text-slate-500 mt-1">Search by email, phone or name</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Email, phone or name..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <Button onClick={doSearch} disabled={loading || !search.trim()}>
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />} Search
        </Button>
      </div>

      {/* Results */}
      {searched && !selectedCustomer && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400">No customers found for "{search}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(c => (
                <button key={c.id} onClick={() => viewCustomer(c)} className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-emerald-300 press transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">{c.name || 'No name'}</p>
                      <p className="text-sm text-slate-500">{c.email}</p>
                      {c.phone && <p className="text-xs text-slate-400">+91 {c.phone}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Joined {new Date(c.createdAt).toLocaleDateString()}</p>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Detail with Orders */}
      {selectedCustomer && (
        <div>
          <button onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 press">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to results
          </button>

          {/* Customer Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 shrink-0">
                {(selectedCustomer.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800">{selectedCustomer.name}</p>
                <p className="text-sm text-slate-500">{selectedCustomer.email}</p>
                {selectedCustomer.phone && <p className="text-sm text-slate-400">+91 {selectedCustomer.phone}</p>}
                <p className="text-xs text-slate-400 mt-1">ID: <span className="font-mono">{selectedCustomer.id.slice(0, 16)}...</span></p>
              </div>
            </div>
            {selectedCustomer.addresses.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Saved Addresses</p>
                {selectedCustomer.addresses.map(a => (
                  <div key={a.id} className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">{a.name}</span> — {a.address}, {a.city} - {a.pincode}
                    {a.isDefault && <Badge variant="success" className="ml-2 text-[10px]">Default</Badge>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Orders */}
          <h3 className="font-bold text-slate-800 mb-3">Orders ({customerOrders.length})</h3>
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : customerOrders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-200" />
              <p className="text-sm text-slate-400">No orders from this customer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customerOrders.map(o => (
                <div key={o.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">{o.id}</span>
                    <span className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {o.items.slice(0, 3).map((item: CartItem, i: number) => (
                        <img key={i} src={item.product.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ))}
                      <span className="text-sm text-slate-600">{o.items.length} item(s)</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">₹{o.total}</p>
                      <div className="flex gap-1 justify-end mt-0.5">
                        <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'default'}>{o.status.replace(/_/g, ' ')}</Badge>
                        <Badge variant={o.paymentStatus === 'verified' ? 'success' : o.paymentStatus === 'failed' ? 'error' : 'warning'}>{o.paymentStatus}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   FLAGGED
================================================================ */
function FlaggedTab({ duplicates }: any) {
  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Flagged Transactions</h2><p className="text-sm text-slate-500 mt-1">Duplicate UPI transaction IDs</p></div>
      {duplicates.length === 0 ? (
        <div className="text-center py-20"><ShieldCheck className="w-14 h-14 mx-auto mb-4 text-emerald-300" /><h3 className="font-bold text-lg text-slate-800">All Clear</h3><p className="text-slate-400 mt-1">No duplicates found</p></div>
      ) : (
        <div className="space-y-4 pb-4">{duplicates.map((g: any) => (
          <div key={g.txnId} className="border-2 border-red-200 rounded-2xl overflow-hidden">
            <div className="bg-red-50 px-5 py-3 flex items-center justify-between"><div><p className="font-bold text-red-700">Duplicate TXN</p><code className="text-xs font-mono text-red-600">{g.txnId}</code></div><Badge variant="error">{g.orders.length} orders</Badge></div>
            <div className="divide-y">{g.orders.map((o: Order) => {
              const c = store.getCustomers().find((x: Customer) => x.id === o.customerId);
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-slate-400">{o.id}</p>
                    <p className="font-medium text-slate-700 truncate">{c?.name || 'N/A'} • {c?.phone || ''}</p>
                    <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-800">₹{o.total}</p>
                    <div className="flex gap-1 justify-end mt-1 flex-wrap">
                      <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : o.status === 'pending' ? 'warning' : 'default'}>{o.status.replace(/_/g, ' ')}</Badge>
                      <Badge variant={o.paymentStatus === 'verified' ? 'success' : o.paymentStatus === 'failed' ? 'error' : 'warning'}>{o.paymentStatus}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

/* ================================================================
   SETTINGS
================================================================ */
function SettingsTab({ settings, refresh }: any) {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [saved, setSaved] = useState(false);
  const save = () => { store.saveSettings(form); setSaved(true); refresh(); setTimeout(() => setSaved(false), 2000); };
  const f = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));
  const fSocial = (k: string, v: string) => setForm((s: any) => ({ ...s, socialLinks: { ...s.socialLinks, [k]: v } }));
  const inp = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="max-w-2xl space-y-4 pb-4">
      {[
        ['Store Information', Globe, 'text-emerald-600', [['Store Name', 'storeName', 'input'], ['Tagline', 'tagline', 'input'], ['Description', 'description', 'textarea'], ['Logo URL', 'logoUrl', 'logo']]],
        ['Contact', Phone, 'text-blue-600', [['Phone', 'phone', 'input'], ['Email', 'email', 'input'], ['Address', 'address', 'input'], ['City', 'city', 'input']]],
        ['Payment', CreditCard, 'text-purple-600', [['UPI ID', 'upiId', 'input'], ['UPI Name', 'upiName', 'input'], ['Free Delivery Min (₹)', 'minFreeDelivery', 'number'], ['Delivery Fee (₹)', 'deliveryFee', 'number']]],
        ['Social & Marketing', MessageSquare, 'text-pink-600', [['Instagram URL', 'socialLinks.instagram', 'social-instagram'], ['WhatsApp', 'socialLinks.whatsapp', 'social-whatsapp'], ['Announcement', 'announcement', 'input']]],
      ].map(([title, Icon, iconCls, fields]: any, si) => (
        <div key={si} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3"><Icon className={`w-5 h-5 ${iconCls}`} /><h3 className="font-bold text-slate-800">{title}</h3></div>
          <div className="p-5 space-y-3">
            {fields.map(([label, key, type]: any) => (
              <div key={key}>
                <label className="text-xs text-slate-500 font-medium mb-1 block">{label}</label>
                {type === 'textarea' ? <textarea value={(form as any)[key] || ''} onChange={e => f(key, e.target.value)} rows={2} className={inp} />
                : type === 'number' ? <input type="number" value={(form as any)[key] || ''} onChange={e => f(key, Number(e.target.value))} className={inp} />
                : type === 'logo' ? <><input value={(form as any)[key] || ''} onChange={e => f(key, e.target.value)} placeholder="https://..." className={inp} />{form.logoUrl && <img src={form.logoUrl} alt="" className="w-10 h-10 rounded-lg mt-2 object-cover border" onError={e => (e.target as HTMLElement).style.display = 'none'} />}</>
                : key.startsWith('socialLinks.') ? <input value={form.socialLinks[key.split('.')[1] as keyof typeof form.socialLinks] || ''} onChange={e => fSocial(key.split('.')[1], e.target.value)} className={inp} />
                : <input value={(form as any)[key] || ''} onChange={e => f(key, e.target.value)} className={inp} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={save} size="lg" className="w-full">{saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Settings'}</Button>
    </div>
  );
}
