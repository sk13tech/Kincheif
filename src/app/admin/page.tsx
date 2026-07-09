"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

type Stats = { totalOrders: number; totalRevenue: string; pendingOrders: number; totalCustomers: number; totalProducts: number };
type OI = { id: number; productName: string; quantity: number; price: string; total: string };
type Order = { id: number; customerName: string | null; customerPhone: string | null; status: string; totalAmount: string; deliveryAddress: string; deliveryCity: string | null; deliveryPincode: string | null; notes: string | null; createdAt: string; items: OI[] };
type Product = { id: number; name: string; description: string | null; price: string; stock: number; active: boolean; featured: boolean; categoryName: string | null; categoryId: number; weight: string | null; image: string | null };
type Customer = { id: number; name: string; phone: string; email: string | null; address: string | null; city: string | null; createdAt: string };
type GiftCard = { id: string; code: string; value: number; used: boolean; createdAt: string };
type Coupon = { id: string; code: string; discount: number; type: "percent" | "flat"; minOrder: number; active: boolean; createdAt: string };

const STS = ["pending","confirmed","processing","out_for_delivery","delivered"];
const SL: Record<string,string> = { pending:"Pending", confirmed:"Confirmed", processing:"Processing", out_for_delivery:"Shipping", delivered:"Delivered", cancelled:"Cancelled" };
const sBg: Record<string,string> = { pending:"bg-yellow-900/30 text-yellow-400 border-yellow-800", confirmed:"bg-blue-900/30 text-blue-400 border-blue-800", processing:"bg-indigo-900/30 text-indigo-400 border-indigo-800", out_for_delivery:"bg-cyan-900/30 text-cyan-400 border-cyan-800", delivered:"bg-green-900/30 text-green-400 border-green-800", cancelled:"bg-red-900/30 text-red-400 border-red-800" };

/* ── SVG Icons (22px, Median UI style) ── */
const ic = "w-[22px] h-[22px]";
const is = { fill: "none" as const, stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const DashI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M22 10.9V4.1C22 2.6 21.36 2 19.77 2h-4.04c-1.59 0-2.23.6-2.23 2.1v6.8c0 1.5.64 2.1 2.23 2.1h4.04c1.59 0 2.23-.6 2.23-2.1zM22 19.9v-2.8c0-1.5-.64-2.1-2.23-2.1h-4.04c-1.59 0-2.23.6-2.23 2.1v2.8c0 1.5.64 2.1 2.23 2.1h4.04c1.59 0 2.23-.6 2.23-2.1zM10.5 13.1V19.9c0 1.5-.64 2.1-2.23 2.1H4.23C2.64 22 2 21.4 2 19.9v-6.8c0-1.5.64-2.1 2.23-2.1h4.04c1.59 0 2.23.6 2.23 2.1zM10.5 4.1v2.8c0 1.5-.64 2.1-2.23 2.1H4.23C2.64 9 2 8.4 2 6.9V4.1C2 2.6 2.64 2 4.23 2h4.04c1.59 0 2.23.6 2.23 2.1z"/></svg>;
const OrderI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M3.17 7.44L12 12.55l8.77-5.08M12 21.61v-9.07"/><path d="M9.93 2.48L4.59 5.45c-1.21.67-2.2 2.35-2.2 3.73v5.65c0 1.38.99 3.06 2.2 3.73l5.34 2.97c1.14.63 3.01.63 4.15 0l5.34-2.97c1.21-.67 2.2-2.35 2.2-3.73V9.18c0-1.38-.99-3.06-2.2-3.73l-5.34-2.97c-1.15-.64-3.01-.64-4.15 0z"/></svg>;
const ProdI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M3.01 11.22V15.71c0 4.49 1.8 6.29 6.29 6.29h5.39c4.49 0 6.29-1.8 6.29-6.29V11.22"/><path d="M12 12c1.83 0 3.18-1.49 3-3.32L14.34 2H9.67L9 8.68c-.18 1.83 1.17 3.32 3 3.32z"/><path d="M18.31 12c2.02 0 3.5-1.64 3.3-3.65l-.28-2.75C20.97 3.35 20.17 2 17.35 2H14.3l.68 7.01c.17 1.65 1.68 2.99 3.33 2.99zM5.64 12c1.65 0 3.16-1.34 3.3-2.99L9.32 5.6 9.62 2H6.58C3.76 2 2.96 3.35 2.6 5.6l-.27 2.75C2.13 10.36 3.62 12 5.64 12zM12 17c-1.66 0-2.49.83-2.49 2.49V22h4.98v-2.51C14.49 17.83 13.66 17 12 17z"/></svg>;
const GiftI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M19.97 10H3.97v8c0 3 1 4 4 4h8c3 0 4-1 4-4v-8z"/><path d="M21.5 7v1c0 1.1-.53 2-2 2h-15c-1.53 0-2-.9-2-2V7c0-1.1.47-2 2-2h15c1.47 0 2 .9 2 2z"/><path d="M11.64 5H6.12c-.47-.53-.41-1.35.13-1.82l1.26-1.1c.56-.49 1.43-.49 1.99 0l2.14 1.87V5zM17.84 5h-5.52V3.05l2.14-1.87c.56-.49 1.43-.49 1.99 0l1.26 1.1c.55.47.61 1.29.13 1.82z"/><path d="M8.94 10v5.14c0 .8.86 1.3 1.54.88l1.08-.67a.94.94 0 01.97 0l1.02.64c.67.42 1.54-.07 1.54-.87V10H8.94z"/></svg>;
const CoupI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M19.5 12.5c0-1.77 1.42-3.23 3.17-3.5V7c0-3-1.5-4-4-4H5.33c-2.5 0-4 1-4 4v1.75c1.75.27 3.17 1.73 3.17 3.5 0 1.77-1.42 3.23-3.17 3.5V18c0 3 1.5 4 4 4h13.34c2.5 0 4-1 4-4v-2c-1.75-.27-3.17-1.73-3.17-3.5z"/><path d="M10 4v3.5M10 16.5V20M10 12.83V11.17"/></svg>;
const SetI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8.68a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06c.5.5 1.21.67 1.82.33h.08A1.65 1.65 0 0010 3.09V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.08a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const UsrI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM20.59 22c0-3.87-3.85-7-8.59-7s-8.59 3.13-8.59 7"/></svg>;
const MenuIC = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const XIC = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M18 6L6 18M6 6l12 12"/></svg>;
const PlusI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M12 5v14M5 12h14"/></svg>;
const TrashI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M21 5.98c-3.33-.33-6.68-.5-10.02-.5-1.98 0-3.96.1-5.94.3L3 5.98M8.5 4.97l.22-1.31C8.88 2.71 9 2 10.69 2h2.62c1.69 0 1.82.75 1.97 1.67l.22 1.3"/><path d="M18.85 9.14l-.65 10.07C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14M10.33 16.5h3.33M9.5 12.5h5"/></svg>;
const CopyI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M16 12.9v4.2c0 3.5-1.4 4.9-4.9 4.9H6.9C3.4 22 2 20.6 2 17.1v-4.2C2 9.4 3.4 8 6.9 8h4.2c3.5 0 4.9 1.4 4.9 4.9z"/><path d="M22 6.9v4.2c0 3.5-1.4 4.9-4.9 4.9H16v-3.1C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2h4.2C20.6 2 22 3.4 22 6.9z"/></svg>;
const OutIC = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M8.9 7.56c.31-3.6 2.16-5.07 6.21-5.07h.13c4.47 0 6.26 1.79 6.26 6.26v6.52c0 4.47-1.79 6.26-6.26 6.26h-.13c-4.02 0-5.87-1.45-6.2-4.99"/><path d="M15 12H3.62M5.85 8.65L2.5 12l3.35 3.35"/></svg>;

const genCode = (len: number) => { const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; let r = ""; for (let i = 0; i < len; i++) r += c[Math.floor(Math.random() * c.length)]; return r; };

export default function AdminDashboard() {
  const router = useRouter();
  type Tab = "dash"|"orders"|"products"|"giftcards"|"coupons"|"settings";
  const [tab, setTab] = useState<Tab>("dash");
  const [sideOpen, setSideOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exp, setExp] = useState<number | null>(null);

  // Products form
  const [showAddProd, setShowAddProd] = useState(false);
  const [pName, setPName] = useState(""); const [pDesc, setPDesc] = useState(""); const [pPrice, setPPrice] = useState(""); const [pStock, setPStock] = useState("50"); const [pCat, setPCat] = useState("1"); const [pWeight, setPWeight] = useState(""); const [pImg, setPImg] = useState("");

  // Gift cards & Coupons (local state — would be Firestore in production)
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [gcValue, setGcValue] = useState("100");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cpCode, setCpCode] = useState(""); const [cpDiscount, setCpDiscount] = useState("10"); const [cpType, setCpType] = useState<"percent"|"flat">("percent"); const [cpMin, setCpMin] = useState("0");

  // Settings
  const [siteName, setSiteName] = useState("KinChief");
  const [sitePhone, setSitePhone] = useState("+91 98765 43210");
  const [siteEmail, setSiteEmail] = useState("hello@kinchief.com");
  const [siteAddr, setSiteAddr] = useState("Main Street, Your City");
  const [freeDelMin, setFreeDelMin] = useState("500");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const syncToFirestore = async () => {
    setSyncing(true); setSyncMsg("");
    try {
      const r = await fetch("/api/sync-firestore");
      const data = await r.json();
      if (!r.ok) { setSyncMsg("Failed to fetch data"); setSyncing(false); return; }
      // Sync categories
      for (const cat of data.categories) {
        await setDoc(doc(firestore, "categories", String(cat.pgId)), cat);
      }
      // Sync products
      for (const prod of data.products) {
        await setDoc(doc(firestore, "products", String(prod.pgId)), prod);
      }
      setSyncMsg(`Synced ${data.products.length} products & ${data.categories.length} categories`);
    } catch (e) {
      setSyncMsg("Sync error: " + (e instanceof Error ? e.message : "unknown"));
    }
    setSyncing(false);
  };

  const gt = useCallback(() => { const t = localStorage.getItem("adminToken"); if (!t) { router.push("/admin/login"); return null; } return t; }, [router]);

  const fd = useCallback(async () => {
    const t = gt(); if (!t) return;
    const h = { Authorization: `Bearer ${t}` };
    try {
      const [sr, or, pr, cr] = await Promise.all([fetch("/api/admin/stats", { headers: h }), fetch("/api/admin/orders", { headers: h }), fetch("/api/admin/products", { headers: h }), fetch("/api/admin/customers", { headers: h })]);
      if (sr.status === 403) { localStorage.removeItem("adminToken"); router.push("/admin/login"); return; }
      const [s, o, p, c] = await Promise.all([sr.json(), or.json(), pr.json(), cr.json()]);
      setStats(s); if (Array.isArray(o)) setOrders(o); if (Array.isArray(p)) setProducts(p); if (Array.isArray(c)) setCustomers(c); setLoading(false);
    } catch { setLoading(false); }
  }, [gt, router]);

  useEffect(() => { fd(); }, [fd]);

  // Load from Firestore
  const loadFirestore = useCallback(async () => {
    try {
      // Settings
      const settingsSnap = await getDoc(doc(firestore, "config", "settings"));
      if (settingsSnap.exists()) {
        const d = settingsSnap.data();
        if (d.siteName) setSiteName(d.siteName); if (d.sitePhone) setSitePhone(d.sitePhone);
        if (d.siteEmail) setSiteEmail(d.siteEmail); if (d.siteAddr) setSiteAddr(d.siteAddr);
        if (d.freeDelMin) setFreeDelMin(String(d.freeDelMin));
      }
      // Gift cards
      const gcSnap = await getDocs(query(collection(firestore, "giftcards"), orderBy("createdAt", "desc")));
      setGiftCards(gcSnap.docs.map(d => ({ id: d.id, ...d.data() } as GiftCard)));
      // Coupons
      const cpSnap = await getDocs(query(collection(firestore, "coupons"), orderBy("createdAt", "desc")));
      setCoupons(cpSnap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
    } catch {}
  }, []);
  useEffect(() => { loadFirestore(); }, [loadFirestore]);

  // ── Order status update (API + Firestore)
  const us = async (id: number, s: string) => {
    const t = gt(); if (!t) return;
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify({ orderId: id, status: s }) });
    // Also update in Firestore if order doc exists
    try { const q2 = query(collection(firestore, "orders")); const snap = await getDocs(q2); snap.docs.forEach(d => { if (d.data().orderId === id) updateDoc(doc(firestore, "orders", d.id), { status: s }); }); } catch {}
    fd();
  };

  // ── Product add (API + Firestore)
  const addProd = async () => {
    const t = gt(); if (!t || !pName || !pPrice) return;
    const body = { name: pName, description: pDesc || null, price: pPrice, stock: parseInt(pStock) || 50, categoryId: parseInt(pCat), weight: pWeight || null, image: pImg || null };
    await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify(body) });
    // Mirror to Firestore
    try { await addDoc(collection(firestore, "products"), { ...body, active: true, featured: false, createdAt: serverTimestamp() }); } catch {}
    setPName(""); setPDesc(""); setPPrice(""); setPStock("50"); setPWeight(""); setPImg(""); setShowAddProd(false); fd();
  };

  // ── Product delete (API + Firestore)
  const delProd = async (id: number) => {
    const t = gt(); if (!t) return;
    await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify({ id, active: false }) });
    fd();
  };

  // ── Gift card CRUD (Firestore)
  const createGiftCard = async () => {
    const data = { code: genCode(15), value: parseInt(gcValue) || 100, used: false, createdAt: new Date().toISOString() };
    try {
      const ref = await addDoc(collection(firestore, "giftcards"), { ...data, createdAt: serverTimestamp() });
      setGiftCards(prev => [{ id: ref.id, ...data }, ...prev]);
    } catch {
      // Fallback local
      setGiftCards(prev => [{ id: genCode(8), ...data }, ...prev]);
    }
  };
  const delGiftCard = async (id: string) => {
    try { await deleteDoc(doc(firestore, "giftcards", id)); } catch {}
    setGiftCards(prev => prev.filter(g => g.id !== id));
  };

  // ── Coupon CRUD (Firestore)
  const createCoupon = async () => {
    if (!cpCode) return;
    const data = { code: cpCode.toUpperCase(), discount: parseFloat(cpDiscount) || 10, type: cpType, minOrder: parseFloat(cpMin) || 0, active: true, createdAt: new Date().toISOString() };
    try {
      const ref = await addDoc(collection(firestore, "coupons"), { ...data, createdAt: serverTimestamp() });
      setCoupons(prev => [{ id: ref.id, ...data }, ...prev]);
    } catch {
      setCoupons(prev => [{ id: genCode(8), ...data }, ...prev]);
    }
    setCpCode("");
  };
  const delCoupon = async (id: string) => {
    try { await deleteDoc(doc(firestore, "coupons", id)); } catch {}
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  // ── Settings (Firestore)
  const saveSettings = async () => {
    const data = { siteName, sitePhone, siteEmail, siteAddr, freeDelMin };
    try { await setDoc(doc(firestore, "config", "settings"), data); } catch {}
    setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
  };

  const logout = () => { localStorage.removeItem("adminToken"); router.push("/admin/login"); };
  const copyText = (t: string) => { navigator.clipboard.writeText(t).catch(() => {}); };

  const inp = "w-full px-3.5 py-3 bg-[#222] border border-[#333] rounded-xl text-[14px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#1a8a6a] transition";

  if (loading) return <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center"><div className="w-9 h-9 border-[2.5px] border-[#333] border-t-[#1a8a6a] rounded-full animate-spin" /></div>;

  const navItems: { k: Tab; l: string; icon: React.ReactNode; badge?: number }[] = [
    { k: "dash", l: "Dashboard", icon: <DashI /> },
    { k: "orders", l: "Orders", icon: <OrderI />, badge: stats?.pendingOrders },
    { k: "products", l: "Products", icon: <ProdI /> },
    { k: "giftcards", l: "Gift Cards", icon: <GiftI /> },
    { k: "coupons", l: "Coupons", icon: <CoupI /> },
    { k: "settings", l: "Settings", icon: <SetI /> },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e0e0e0] flex">
      {/* ═══ SIDEBAR (desktop always, mobile overlay) ═══ */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#141414] border-r border-[#222] flex flex-col z-50 transition-transform lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-[56px] px-5 flex items-center justify-between border-b border-[#222] shrink-0">
          <span className="text-[17px] font-black text-white tracking-tight">KinChief</span>
          <button onClick={() => setSideOpen(false)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#888] hover:bg-[#222]"><XIC /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(n => (
            <button key={n.k} onClick={() => { setTab(n.k); setSideOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition ${tab === n.k ? "bg-[#1a8a6a]/15 text-[#1a8a6a]" : "text-[#888] hover:text-white hover:bg-[#1c1c1c]"}`}>
              {n.icon}
              <span className="flex-1 text-left">{n.l}</span>
              {n.badge !== undefined && n.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#222] space-y-1 shrink-0">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#888] hover:text-white hover:bg-[#1c1c1c] transition"><ProdI />View Store</Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-400 hover:bg-red-900/20 transition"><OutIC />Logout</button>
        </div>
      </aside>
      {sideOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 min-w-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 bg-[#0e0e0e] border-b border-[#222] lg:hidden">
          <div className="px-4 h-[56px] flex items-center gap-3">
            <button onClick={() => setSideOpen(true)} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#888] hover:bg-[#1c1c1c]"><MenuIC /></button>
            <span className="text-[15px] font-bold text-white">{navItems.find(n => n.k === tab)?.l}</span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          {/* ═══ DASHBOARD ═══ */}
          {tab === "dash" && stats && (
            <div className="space-y-6">
              <h2 className="text-[20px] font-bold text-white">Dashboard</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { l: "Orders", v: stats.totalOrders, icon: <OrderI /> },
                  { l: "Revenue", v: `₹${parseFloat(stats.totalRevenue).toFixed(0)}`, icon: <ProdI /> },
                  { l: "Pending", v: stats.pendingOrders, icon: <DashI /> },
                  { l: "Customers", v: stats.totalCustomers, icon: <UsrI /> },
                ].map(s => (
                  <div key={s.l} className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a]">
                    <div className="text-[#555] mb-2">{s.icon}</div>
                    <p className="text-2xl font-black text-white">{s.v}</p>
                    <p className="text-[12px] text-[#888] font-medium mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white mb-3">Recent Orders</h3>
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center justify-between hover:border-[#444] transition">
                      <div className="flex items-center gap-4"><span className="w-10 h-10 bg-[#222] rounded-xl flex items-center justify-center text-[13px] font-bold text-[#888]">#{o.id}</span><div><p className="text-[14px] font-medium text-white">{o.customerName}</p><p className="text-[11px] text-[#666]">{new Date(o.createdAt).toLocaleString("en-IN")}</p></div></div>
                      <div className="flex items-center gap-3"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${sBg[o.status] || ""}`}>{SL[o.status]}</span><span className="text-[15px] font-black text-white">₹{parseFloat(o.totalAmount).toFixed(0)}</span></div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-center text-[14px] text-[#666] py-12">No orders yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* ═══ ORDERS ═══ */}
          {tab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-white">Orders <span className="text-[#888] text-[14px] font-normal">({orders.length})</span></h2>
              {orders.map(o => (
                <div key={o.id} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden hover:border-[#444] transition">
                  <button onClick={() => setExp(exp === o.id ? null : o.id)} className="w-full p-4 text-left">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3"><span className="w-10 h-10 bg-[#222] rounded-xl flex items-center justify-center text-[13px] font-bold text-[#888] shrink-0">#{o.id}</span><div><p className="text-[14px] font-medium text-white">{o.customerName}</p><p className="text-[11px] text-[#555] mt-0.5">{new Date(o.createdAt).toLocaleString("en-IN")}</p></div></div>
                      <div className="text-right shrink-0"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${sBg[o.status] || ""}`}>{SL[o.status]}</span><p className="text-[16px] font-black text-white mt-1">₹{parseFloat(o.totalAmount).toFixed(0)}</p></div>
                    </div>
                  </button>
                  {exp === o.id && (
                    <div className="border-t border-[#2a2a2a] px-4 pb-4">
                      <div className="mt-3 space-y-1.5">{o.items.map(i => <div key={i.id} className="flex justify-between text-[13px] bg-[#222] rounded-lg px-3 py-2 border border-[#333]"><span className="text-[#999]">{i.productName} x{i.quantity}</span><span className="font-medium text-white">₹{parseFloat(i.total).toFixed(0)}</span></div>)}</div>
                      <p className="text-[12px] text-[#888] mt-3">{o.deliveryAddress}{o.deliveryCity && `, ${o.deliveryCity}`}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {STS.map(s => <button key={s} onClick={() => us(o.id, s)} disabled={o.status === s} className={`px-3 py-2 rounded-xl text-[11px] font-bold transition ${o.status === s ? "bg-[#1a8a6a] text-white" : "bg-[#222] text-[#888] border border-[#333] hover:text-white"}`}>{SL[s]}</button>)}
                        <button onClick={() => us(o.id, "cancelled")} disabled={o.status === "cancelled"} className={`px-3 py-2 rounded-xl text-[11px] font-bold ${o.status === "cancelled" ? "bg-red-600 text-white" : "bg-red-900/20 text-red-400 border border-red-800/50"}`}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══ PRODUCTS — Add + Delete ═══ */}
          {tab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-white">Products <span className="text-[#888] text-[14px] font-normal">({products.length})</span></h2>
                <button onClick={() => setShowAddProd(!showAddProd)} className="flex items-center gap-2 bg-[#1a8a6a] text-white text-[13px] font-medium px-4 py-2 rounded-xl hover:opacity-90 transition"><PlusI />Add Product</button>
              </div>
              {showAddProd && (
                <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a] space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="block text-[12px] text-[#888] mb-1">Name *</label><input value={pName} onChange={e => setPName(e.target.value)} className={inp} placeholder="Product name" /></div>
                    <div><label className="block text-[12px] text-[#888] mb-1">Price *</label><input value={pPrice} onChange={e => setPPrice(e.target.value)} className={inp} placeholder="30.00" /></div>
                  </div>
                  <div><label className="block text-[12px] text-[#888] mb-1">Description</label><input value={pDesc} onChange={e => setPDesc(e.target.value)} className={inp} placeholder="Product description" /></div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><label className="block text-[12px] text-[#888] mb-1">Stock</label><input value={pStock} onChange={e => setPStock(e.target.value)} className={inp} placeholder="50" /></div>
                    <div><label className="block text-[12px] text-[#888] mb-1">Weight</label><input value={pWeight} onChange={e => setPWeight(e.target.value)} className={inp} placeholder="100g" /></div>
                    <div><label className="block text-[12px] text-[#888] mb-1">Category ID</label><input value={pCat} onChange={e => setPCat(e.target.value)} className={inp} placeholder="1" /></div>
                  </div>
                  <div><label className="block text-[12px] text-[#888] mb-1">Image URL</label><input value={pImg} onChange={e => setPImg(e.target.value)} className={inp} placeholder="/images/chips-cat.jpg" /></div>
                  <div className="flex gap-2"><button onClick={addProd} className="bg-[#1a8a6a] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition">Save Product</button><button onClick={() => setShowAddProd(false)} className="text-[#888] text-[13px] font-medium px-5 py-2.5 rounded-xl bg-[#222] border border-[#333] hover:text-white transition">Cancel</button></div>
                </div>
              )}
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className={`bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center gap-4 hover:border-[#444] transition ${!p.active ? "opacity-30" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-[#222] border border-[#333] overflow-hidden shrink-0">{p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#555]"><ProdI /></div>}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-white truncate">{p.name}</p>
                      <p className="text-[11px] text-[#666]">{p.categoryName}{p.weight && ` · ${p.weight}`} · Stock: {p.stock}</p>
                    </div>
                    <span className="text-[15px] font-black text-[#1a8a6a] shrink-0">₹{parseFloat(p.price).toFixed(0)}</span>
                    <button onClick={() => { if (confirm("Delete this product?")) delProd(p.id); }} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#666] hover:text-red-400 hover:bg-red-900/20 transition shrink-0"><TrashI /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ GIFT CARDS ═══ */}
          {tab === "giftcards" && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-white">Gift Cards</h2>
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a] flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[120px]"><label className="block text-[12px] text-[#888] mb-1">Value (₹)</label><input value={gcValue} onChange={e => setGcValue(e.target.value)} className={inp} placeholder="100" /></div>
                <button onClick={createGiftCard} className="flex items-center gap-2 bg-[#1a8a6a] text-white text-[13px] font-medium px-5 py-3 rounded-xl hover:opacity-90 transition"><GiftI />Generate Card</button>
              </div>
              <div className="space-y-2">
                {giftCards.map(gc => (
                  <div key={gc.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center gap-4 hover:border-[#444] transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-mono font-bold text-white tracking-wider">{gc.code}</p>
                      <p className="text-[11px] text-[#666] mt-0.5">Value: ₹{gc.value} · {gc.used ? "Used" : "Active"} · {new Date(gc.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <button onClick={() => copyText(gc.code)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition" title="Copy"><CopyI /></button>
                    <button onClick={() => delGiftCard(gc.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#666] hover:text-red-400 hover:bg-red-900/20 transition"><TrashI /></button>
                  </div>
                ))}
                {giftCards.length === 0 && <p className="text-center text-[14px] text-[#555] py-12">No gift cards created yet</p>}
              </div>
            </div>
          )}

          {/* ═══ COUPONS ═══ */}
          {tab === "coupons" && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-white">Coupons</h2>
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a] space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="block text-[12px] text-[#888] mb-1">Code *</label><input value={cpCode} onChange={e => setCpCode(e.target.value)} className={inp} placeholder="SAVE20" /></div>
                  <div><label className="block text-[12px] text-[#888] mb-1">Discount</label><input value={cpDiscount} onChange={e => setCpDiscount(e.target.value)} className={inp} placeholder="10" /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="block text-[12px] text-[#888] mb-1">Type</label><select value={cpType} onChange={e => setCpType(e.target.value as "percent"|"flat")} className={inp}><option value="percent">Percentage (%)</option><option value="flat">Flat (₹)</option></select></div>
                  <div><label className="block text-[12px] text-[#888] mb-1">Min Order (₹)</label><input value={cpMin} onChange={e => setCpMin(e.target.value)} className={inp} placeholder="0" /></div>
                </div>
                <button onClick={createCoupon} className="flex items-center gap-2 bg-[#1a8a6a] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition"><CoupI />Create Coupon</button>
              </div>
              <div className="space-y-2">
                {coupons.map(cp => (
                  <div key={cp.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center gap-4 hover:border-[#444] transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-mono font-bold text-white">{cp.code}</p>
                      <p className="text-[11px] text-[#666] mt-0.5">{cp.type === "percent" ? `${cp.discount}% off` : `₹${cp.discount} off`}{cp.minOrder > 0 && ` · Min ₹${cp.minOrder}`} · {new Date(cp.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <button onClick={() => copyText(cp.code)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition" title="Copy"><CopyI /></button>
                    <button onClick={() => delCoupon(cp.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#666] hover:text-red-400 hover:bg-red-900/20 transition"><TrashI /></button>
                  </div>
                ))}
                {coupons.length === 0 && <p className="text-center text-[14px] text-[#555] py-12">No coupons created yet</p>}
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === "settings" && (
            <div className="space-y-4">
              <h2 className="text-[20px] font-bold text-white">Settings</h2>
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a] space-y-4">
                <div><label className="block text-[12px] text-[#888] mb-1">Site Name</label><input value={siteName} onChange={e => setSiteName(e.target.value)} className={inp} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="block text-[12px] text-[#888] mb-1">Phone</label><input value={sitePhone} onChange={e => setSitePhone(e.target.value)} className={inp} /></div>
                  <div><label className="block text-[12px] text-[#888] mb-1">Email</label><input value={siteEmail} onChange={e => setSiteEmail(e.target.value)} className={inp} /></div>
                </div>
                <div><label className="block text-[12px] text-[#888] mb-1">Address</label><input value={siteAddr} onChange={e => setSiteAddr(e.target.value)} className={inp} /></div>
                <div><label className="block text-[12px] text-[#888] mb-1">Free Delivery Min Order (₹)</label><input value={freeDelMin} onChange={e => setFreeDelMin(e.target.value)} className={inp} placeholder="500" /></div>
                <div className="flex items-center gap-3">
                  <button onClick={saveSettings} className="flex items-center gap-2 bg-[#1a8a6a] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition"><SetI />Save Settings</button>
                  {settingsSaved && <span className="text-[13px] text-green-400 font-medium">Saved!</span>}
                </div>
              </div>
              {/* Sync DB to Firestore */}
              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-[#2a2a2a] space-y-3">
                <h3 className="text-[15px] font-bold text-white">Sync Database → Firestore</h3>
                <p className="text-[12px] text-[#888] leading-relaxed">Push all products and categories from the database to Firestore so the store reads from Firebase. Run this once after setup or when you update products via the API.</p>
                <button onClick={syncToFirestore} disabled={syncing} className="flex items-center gap-2 bg-[#333] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl hover:bg-[#444] transition disabled:opacity-50">
                  {syncing ? <><div className="w-4 h-4 border-2 border-[#666] border-t-white rounded-full animate-spin" />Syncing...</> : <><OrderI />Sync Now</>}
                </button>
                {syncMsg && <p className="text-[12px] text-green-400">{syncMsg}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
