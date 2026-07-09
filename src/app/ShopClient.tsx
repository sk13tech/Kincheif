"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ProductData, CategoryData, SiteConfig } from "@/lib/data";
import { auth, googleProvider, firestore } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

type SizeOption = { label: string; price: number };
type CartItem = { product: ProductData; quantity: number; selectedSize: string; sizePrice: number };
type Order = { id: string; status: string; totalAmount: number; createdAt: string; items: { name: string; quantity: number; total: number }[] };

/* ── Icons ── */
const ic = "w-[22px] h-[22px]";
const is = { fill: "none" as const, stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const SunI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-2.05-6.95L18.36 5.64M5.64 18.36l-1.41 1.41M18.36 18.36l1.41 1.41M5.64 5.64L4.22 4.22"/></svg>;
const MoonI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>;
const MenuI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const XI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M18 6L6 18M6 6l12 12"/></svg>;
const SrchI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><circle cx="11.5" cy="11.5" r="9.5"/><path d="M18.5 18.5L22 22"/></svg>;
const BagI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M7.5 7.67V6.7c0-2.25 1.81-4.46 4.06-4.67a4.5 4.5 0 014.94 4.48v1.38"/><path d="M9 22h6c4.02 0 4.74-1.61 4.95-3.57l.75-6C20.97 9.99 20.27 8 16 8H8c-4.27 0-4.97 1.99-4.7 4.43l.75 6C4.26 20.39 4.98 22 9 22z"/><path d="M15.495 12h.01M8.495 12h.01"/></svg>;
const HomeI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M12 18V15"/><path d="M10.07 2.82L3.14 8.37c-.78.62-1.28 1.93-1.11 2.91l1.33 7.96c.24 1.42 1.6 2.57 3.04 2.57h11.2c1.43 0 2.8-1.16 3.04-2.57l1.33-7.96c.16-.98-.34-2.29-1.11-2.91l-6.93-5.54c-1.07-.86-2.8-.86-3.86-.01z"/></svg>;
const PkgI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M3.17 7.44L12 12.55l8.77-5.08M12 21.61v-9.07"/><path d="M9.93 2.48L4.59 5.45c-1.21.67-2.2 2.35-2.2 3.73v5.65c0 1.38.99 3.06 2.2 3.73l5.34 2.97c1.14.63 3.01.63 4.15 0l5.34-2.97c1.21-.67 2.2-2.35 2.2-3.73V9.18c0-1.38-.99-3.06-2.2-3.73l-5.34-2.97c-1.15-.64-3.01-.64-4.15 0z"/></svg>;
const OutI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M8.9 7.56c.31-3.6 2.16-5.07 6.21-5.07h.13c4.47 0 6.26 1.79 6.26 6.26v6.52c0 4.47-1.79 6.26-6.26 6.26h-.13c-4.02 0-5.87-1.45-6.2-4.99"/><path d="M15 12H3.62M5.85 8.65L2.5 12l3.35 3.35"/></svg>;
const BackI = () => <svg className={ic} viewBox="0 0 24 24" {...is}><path d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"/></svg>;
const ChL = () => <svg className="w-5 h-5" viewBox="0 0 24 24" {...is} strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>;
const ChR = () => <svg className="w-5 h-5" viewBox="0 0 24 24" {...is} strokeWidth={2}><path d="M9 19l7-7-7-7"/></svg>;
const Mn = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14"/></svg>;
const Pl = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const GoogleG = () => <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;

const banners = [
  { img: "/images/banner1.jpg", title: "Crispy Fresh Chips", sub: "Handmade & sun-dried. Order your favorites today." },
  { img: "/images/banner2.jpg", title: "Premium Biscuits", sub: "Butter cookies, cream wafers & more delivered fresh." },
  { img: "/images/hero-bg.jpg", title: "New Arrivals", sub: "Explore our latest snack collection." },
];

export default function ShopClient({ initialProducts, initialCategories }: { initialProducts: ProductData[]; initialCategories: CategoryData[] }) {
  const [dark, setDark] = useState(false);
  const [navO, setNavO] = useState(false);
  const [navV, setNavV] = useState(false);
  const [selCat, setSelCat] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchO, setSearchO] = useState(false);
  // Firestore-sourced data (overrides PG props if loaded)
  const [fsProducts, setFsProducts] = useState<ProductData[] | null>(null);
  const [fsCategories, setFsCategories] = useState<CategoryData[] | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ siteName: "KinChief", sitePhone: "+91 98765 43210", siteEmail: "hello@kinchief.com", siteAddr: "Main Street, Your City", freeDelMin: "500" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartO, setCartO] = useState(false);
  const [cartV, setCartV] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [uName, setUName] = useState("");
  const [uAvatar, setUAvatar] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [detail, setDetail] = useState<ProductData | null>(null);
  const [loginO, setLoginO] = useState(false);
  const [loginV, setLoginV] = useState(false);
  const [aLoad, setALoad] = useState(false);
  const [aErr, setAErr] = useState("");
  const [coO, setCoO] = useState(false);
  const [coAddr, setCoAddr] = useState(""); const [coCity, setCoCity] = useState(""); const [coPin, setCoPin] = useState(""); const [coNotes, setCoNotes] = useState(""); const [coErr, setCoErr] = useState(""); const [coLoad, setCoLoad] = useState(false); const [done, setDone] = useState(false);
  const [ordO, setOrdO] = useState(false); const [orders, setOrders] = useState<Order[]>([]);
  const [slide, setSlide] = useState(0);
  const [showCount, setShowCount] = useState(10);
  const [touchX, setTouchX] = useState(0);

  const openNav = () => { setNavO(true); requestAnimationFrame(() => requestAnimationFrame(() => setNavV(true))); };
  const closeNav = () => { setNavV(false); setTimeout(() => setNavO(false), 300); };
  const openCart = () => { setCartO(true); requestAnimationFrame(() => requestAnimationFrame(() => setCartV(true))); };
  const closeCart = () => { setCartV(false); setTimeout(() => setCartO(false), 300); };
  const openLogin = () => { setLoginO(true); setAErr(""); requestAnimationFrame(() => requestAnimationFrame(() => setLoginV(true))); };
  const closeLogin = () => { setLoginV(false); setTimeout(() => setLoginO(false), 300); };

  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggleDark = () => { const n = !dark; setDark(n); document.documentElement.classList.toggle("dark", n); localStorage.setItem("theme", n ? "dark" : "light"); };

  // Load user session + cart + Firestore data
  useEffect(() => {
    const t = localStorage.getItem("token"); const u = localStorage.getItem("user");
    if (t && u) {
      try { const p = JSON.parse(u); setLoggedIn(true); setUName(p.name || ""); setUAvatar(p.avatar || ""); setUEmail(p.email || ""); } catch {}
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()).then(d => {
        if (d.error) { localStorage.removeItem("token"); localStorage.removeItem("user"); setLoggedIn(false); return; }
        if (d.name) setUName(d.name); if (d.avatar) setUAvatar(d.avatar); if (d.email) setUEmail(d.email);
        if (d.address) setCoAddr(d.address); if (d.city) setCoCity(d.city); if (d.pincode) setCoPin(d.pincode);
      }).catch(() => {});
    }
    try { const c = localStorage.getItem("cart"); if (c) setCart(JSON.parse(c)); } catch {}

    // Load products, categories, config from Firestore
    (async () => {
      try {
        // Site config
        const cfgSnap = await getDoc(doc(firestore, "config", "settings"));
        if (cfgSnap.exists()) setSiteConfig(cfgSnap.data() as SiteConfig);

        // Products from Firestore
        const pSnap = await getDocs(query(collection(firestore, "products")));
        if (pSnap.size > 0) {
          const cats: Record<number, string> = {};
          // Categories
          const cSnap = await getDocs(collection(firestore, "categories"));
          const fsCats: CategoryData[] = [];
          cSnap.forEach(d => { const data = d.data(); const cat = { id: data.pgId || parseInt(d.id) || 0, name: data.name, description: data.description || null, image: data.image || null }; fsCats.push(cat); cats[cat.id] = cat.name; });
          if (fsCats.length > 0) setFsCategories(fsCats);

          const fsProd: ProductData[] = [];
          pSnap.forEach(d => { const data = d.data(); if (data.active === false) return; fsProd.push({ id: data.pgId || parseInt(d.id) || Math.random() * 100000 | 0, name: data.name || "", description: data.description || null, price: String(data.price || "0"), image: data.image || null, images: data.images || null, sizes: data.sizes || null, categoryId: data.categoryId || 1, categoryName: cats[data.categoryId] || data.categoryName || null, stock: data.stock ?? 99, unit: data.unit || "packet", weight: data.weight || null, featured: data.featured || false }); });
          if (fsProd.length > 0) setFsProducts(fsProd);
        }
      } catch {} // Silently fallback to PG props
    })();
  }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { const iv = setInterval(() => setSlide(s => (s + 1) % banners.length), 5000); return () => clearInterval(iv); }, []);

  /* ── Firebase Google Auth ── */
  const handleGoogle = useCallback(async () => {
    setALoad(true); setAErr("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const r = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential: idToken }) });
      const d = await r.json();
      if (!r.ok) { setAErr(d.error || "Failed"); setALoad(false); return; }
      localStorage.setItem("token", d.token); localStorage.setItem("user", JSON.stringify(d.user));
      setLoggedIn(true); setUName(d.user.name); setUAvatar(d.user.avatar || ""); setUEmail(d.user.email || ""); closeLogin(); setALoad(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.includes("popup-closed") || msg.includes("cancelled")) { setALoad(false); return; }
      setAErr(msg.includes("auth/") ? "Google Sign-In failed. Check Firebase config." : msg);
      setALoad(false);
    }
  }, []);

  const parseSizes = (s: string | null): SizeOption[] => {
    if (!s) return [];
    return s.split(",").map(p => { const [label, price] = p.split(":"); return { label, price: parseFloat(price) }; });
  };

  const addWithSize = useCallback((p: ProductData, size: string, sizePrice: number) => {
    setCart(prev => {
      const e = prev.find(c => c.product.id === p.id && c.selectedSize === size);
      if (e) return prev.map(c => c.product.id === p.id && c.selectedSize === size ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { product: p, quantity: 1, selectedSize: size, sizePrice }];
    });
  }, []);

  const add = useCallback((p: ProductData) => {
    const sizes = parseSizes(p.sizes);
    const sz = sizes.length > 0 ? sizes[0] : { label: p.weight || "default", price: parseFloat(p.price) };
    addWithSize(p, sz.label, sz.price);
  }, [addWithSize]);

  const updQ = useCallback((id: number, d: number, size?: string) => {
    setCart(prev => prev.map(c => {
      if (c.product.id === id && (!size || c.selectedSize === size)) {
        const n = c.quantity + d;
        return n <= 0 ? null : { ...c, quantity: n };
      }
      return c;
    }).filter(Boolean) as CartItem[]);
  }, []);

  const total = cart.reduce((s, c) => s + c.sizePrice * c.quantity, 0);
  const count = cart.reduce((s, c) => s + c.quantity, 0);
  const qty = (id: number) => cart.filter(c => c.product.id === id).reduce((s, c) => s + c.quantity, 0);
  // Use Firestore data if loaded, otherwise fallback to PG props
  const activeProducts = fsProducts || initialProducts;
  const activeCategories = fsCategories || initialCategories;
  const freeDelMinVal = parseInt(siteConfig.freeDelMin) || 500;
  const filtered = activeProducts.filter(p => { if (selCat && p.categoryId !== selCat) return false; if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false; return true; });

  /* ── Place order — Firestore first, API fallback ── */
  const placeOrder = async () => {
    if (!coAddr.trim()) { setCoErr("Address required"); return; }
    setCoLoad(true); setCoErr("");
    const deliveryFee = total >= freeDelMinVal ? 0 : 40;
    const orderData = {
      userEmail: uEmail || "guest", userName: uName || "Guest",
      items: cart.map(c => ({ name: c.product.name, size: c.selectedSize, price: c.sizePrice, qty: c.quantity, total: c.sizePrice * c.quantity, productId: c.product.id })),
      totalAmount: total + deliveryFee, subtotal: total, deliveryFee,
      deliveryAddress: coAddr, city: coCity, pincode: coPin, notes: coNotes,
      status: "pending",
    };
    try {
      // Primary: Firestore
      await addDoc(collection(firestore, "orders"), { ...orderData, createdAt: serverTimestamp() });
      // Secondary: API (PostgreSQL backup)
      const t = localStorage.getItem("token");
      if (t) {
        try { await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify({ items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })), deliveryAddress: coAddr, deliveryCity: coCity, deliveryPincode: coPin, notes: coNotes }) }); } catch {}
      }
      setCart([]); localStorage.removeItem("cart"); setCoO(false); closeCart(); setDone(true); setCoLoad(false);
    } catch {
      // Fallback: API only
      const t = localStorage.getItem("token");
      if (!t) { setCoErr("Please sign in first"); setCoLoad(false); return; }
      try {
        const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify({ items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })), deliveryAddress: coAddr, deliveryCity: coCity, deliveryPincode: coPin, notes: coNotes }) });
        const d = await r.json(); if (!r.ok) { setCoErr(d.error || "Failed"); setCoLoad(false); return; }
        setCart([]); localStorage.removeItem("cart"); setCoO(false); closeCart(); setDone(true); setCoLoad(false);
      } catch { setCoErr("Error placing order"); setCoLoad(false); }
    }
  };

  /* ── Load orders from Firestore ── */
  const loadOrders = async () => {
    if (!uEmail) { // fallback to API
      const t = localStorage.getItem("token"); if (!t) return;
      const r = await fetch("/api/orders", { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      if (Array.isArray(d)) setOrders(d.map((o: Record<string, unknown>) => ({ id: String(o.id), status: String(o.status), totalAmount: parseFloat(String(o.totalAmount)), createdAt: String(o.createdAt), items: (o.items as Array<Record<string, unknown>>).map((i) => ({ name: String(i.productName), quantity: Number(i.quantity), total: parseFloat(String(i.total)) })) })));
      setOrdO(true); return;
    }
    try {
      const q2 = query(collection(firestore, "orders"), where("userEmail", "==", uEmail), orderBy("createdAt", "desc"));
      const snap = await getDocs(q2);
      const list: Order[] = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: d.orderId ? String(d.orderId) : doc.id.slice(0, 6),
          status: d.status || "pending",
          totalAmount: d.totalAmount || 0,
          createdAt: d.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          items: (d.items || []).map((i: Record<string, unknown>) => ({ name: String(i.name), quantity: Number(i.qty || i.quantity), total: Number(i.total) })),
        };
      });
      setOrders(list);
    } catch {
      // Fallback to API
      const t = localStorage.getItem("token"); if (!t) { setOrdO(true); return; }
      const r = await fetch("/api/orders", { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      if (Array.isArray(d)) setOrders(d.map((o: Record<string, unknown>) => ({ id: String(o.id), status: String(o.status), totalAmount: parseFloat(String(o.totalAmount)), createdAt: String(o.createdAt), items: (o.items as Array<Record<string, unknown>>).map((i) => ({ name: String(i.productName), quantity: Number(i.quantity), total: parseFloat(String(i.total)) })) })));
    }
    setOrdO(true);
  };

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setLoggedIn(false); setUName(""); setUAvatar(""); setUEmail(""); closeNav(); };

  const sL: Record<string, string> = { pending: "Pending", confirmed: "Confirmed", processing: "Processing", out_for_delivery: "Shipping", delivered: "Delivered", cancelled: "Cancelled" };
  const sC: Record<string, string> = { pending: "bg-wa2 text-wa", confirmed: "bg-ac2 text-ac", processing: "bg-ac2 text-ac", out_for_delivery: "bg-ac2 text-ac", delivered: "bg-ok2 text-ok", cancelled: "bg-no2 text-no" };
  const inp = "w-full px-3.5 py-3 bg-bg2 border border-bd rounded-xl text-sm text-tx placeholder:text-tx2 focus:outline-none focus:border-ac transition";

  const Overlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}><div className="absolute inset-0 overlay-bg" /><div className="relative bg-bg rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-bd shadow-2xl" onClick={e => e.stopPropagation()}>{children}</div></div>
  );

  /* ═══ PRODUCT DETAIL ═══ */
  const [detailImg, setDetailImg] = useState(0);
  const [detailSize, setDetailSize] = useState<SizeOption | null>(null);

  if (detail) {
    const allImages = detail.images ? detail.images.split(",").filter(Boolean) : (detail.image ? [detail.image] : ["/images/hero.jpg"]);
    const sizes = parseSizes(detail.sizes);
    const activeSize = detailSize || (sizes.length > 0 ? sizes[0] : { label: detail.weight || "Standard", price: parseFloat(detail.price) });
    const price = activeSize.price;
    const fakeOld = Math.round(price * 1.25);
    const discount = Math.round(((fakeOld - price) / fakeOld) * 100);
    const q = cart.filter(c => c.product.id === detail.id).reduce((s, c) => s + c.quantity, 0);
    const goBack = () => { setDetail(null); setDetailImg(0); setDetailSize(null); };
    return (
      <div className="min-h-screen bg-bg pb-24">
        <header className="sticky top-0 z-50 bg-bg border-b border-bd">
          <div className="max-w-3xl mx-auto px-4 h-[56px] flex items-center justify-between">
            <button onClick={goBack} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition"><BackI /></button>
            <span className="text-[15px] font-bold text-tx">Product Details</span>
            <button onClick={openCart} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition relative"><BagI />{count > 0 && <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-ac text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">{count}</span>}</button>
          </div>
        </header>
        <div className="max-w-3xl mx-auto">
          <div className="px-4 pt-4">
            <div className="rounded-2xl overflow-hidden bg-bg2 border border-bd relative"
              onTouchStart={e => setTouchX(e.touches[0].clientX)}
              onTouchEnd={e => { const diff = touchX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { if (diff > 0) setDetailImg(i => (i + 1) % allImages.length); else setDetailImg(i => (i - 1 + allImages.length) % allImages.length); } }}>
              <img src={allImages[detailImg] || "/images/hero.jpg"} alt={detail.name} className="w-full aspect-[4/3] object-cover" />
              {detail.featured && <span className="absolute top-3 left-3 bg-ac text-white text-[11px] font-bold px-3 py-1 rounded-lg">Bestseller</span>}
              {discount > 0 && <span className="absolute top-3 right-3 bg-no text-white text-[11px] font-bold px-3 py-1 rounded-lg">-{discount}%</span>}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-sb pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setDetailImg(i)} className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition ${i === detailImg ? "border-ac" : "border-bd hover:border-tx2"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="px-5 pt-4">
            <div className="flex items-center gap-1.5 text-[12px] text-tx2 mb-3">
              <button onClick={goBack} className="hover:text-ac transition">Home</button><span>/</span>
              <button onClick={() => { const cid = detail.categoryId; goBack(); setSelCat(cid); }} className="hover:text-ac transition">{detail.categoryName}</button>
            </div>
            <h1 className="text-[20px] sm:text-[24px] font-black text-tx leading-snug">{detail.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <svg key={i} className={`w-4 h-4 ${i <= 4 ? "text-wa" : "text-bd"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
              <span className="text-[12px] text-tx2">4.0 (128 reviews)</span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-4">
              <span className="text-[28px] font-black text-tx">₹{price.toFixed(0)}</span>
              <span className="text-[15px] text-tx2 line-through">₹{fakeOld}</span>
              {discount > 0 && <span className="text-[12px] font-bold text-ok bg-ok2 px-2 py-0.5 rounded-md">{discount}% off</span>}
            </div>
            <p className="text-[11px] text-tx2 mt-0.5">Inclusive of all taxes</p>
            {detail.description && <p className="text-[14px] text-tx2 leading-relaxed mt-4">{detail.description}</p>}
            {sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-[12px] font-bold text-tx uppercase tracking-wider mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(sz => (
                    <button key={sz.label} onClick={() => setDetailSize(sz)} className={`px-4 py-2.5 rounded-xl text-[13px] font-medium border-2 transition ${activeSize.label === sz.label ? "border-ac text-ac bg-ac2" : "border-bd text-tx2 hover:border-tx2"}`}>
                      {sz.label} — <span className="font-bold">₹{sz.price.toFixed(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 pt-5 border-t border-bd">
              {detail.stock === 0 ? (
                <div className="bg-no2 border border-no/20 rounded-xl p-4 text-center"><p className="text-[14px] font-bold text-no">Currently out of stock</p></div>
              ) : (
                <div className="space-y-3">
                  {q > 0 ? (
                    <>
                      <div className="flex items-center justify-between bg-bg2 border border-bd rounded-xl p-1">
                        <button onClick={() => updQ(detail.id, -1, activeSize.label)} className="w-12 h-12 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg transition"><Mn /></button>
                        <span className="text-[18px] font-black text-tx">{q}</span>
                        <button onClick={() => addWithSize(detail, activeSize.label, activeSize.price)} className="w-12 h-12 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg transition"><Pl /></button>
                      </div>
                      <button onClick={() => { goBack(); openCart(); }} className="w-full bg-ac text-white text-[14px] font-medium py-3 rounded-xl hover:opacity-90 transition">View Cart — ₹{total.toFixed(0)} ({count} items)</button>
                    </>
                  ) : (
                    <button onClick={() => addWithSize(detail, activeSize.label, activeSize.price)} className="w-full bg-ac text-white text-[15px] font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition">Add to Cart — ₹{activeSize.price.toFixed(0)}</button>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 divide-y divide-bd border-t border-bd">
              <details className="group py-4" open><summary className="flex items-center justify-between cursor-pointer list-none"><span className="text-[14px] font-bold text-tx">Product Details</span><svg className="w-5 h-5 text-tx2 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></summary><div className="mt-3 space-y-2"><div className="flex justify-between text-[13px] py-1.5"><span className="text-tx2">Category</span><span className="font-medium text-tx">{detail.categoryName}</span></div><div className="flex justify-between text-[13px] py-1.5"><span className="text-tx2">Available Sizes</span><span className="font-medium text-tx">{sizes.map(s => s.label).join(", ") || detail.weight || "Standard"}</span></div><div className="flex justify-between text-[13px] py-1.5"><span className="text-tx2">Unit</span><span className="font-medium text-tx capitalize">{detail.unit}</span></div><div className="flex justify-between text-[13px] py-1.5"><span className="text-tx2">SKU</span><span className="font-medium text-tx">KC-{String(detail.id).padStart(4, "0")}</span></div></div></details>
              <details className="group py-4" open><summary className="flex items-center justify-between cursor-pointer list-none"><span className="text-[14px] font-bold text-tx">Shipping & Delivery</span><svg className="w-5 h-5 text-tx2 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></summary><div className="mt-3 space-y-2 text-[13px] text-tx2 leading-relaxed"><p>Free delivery on orders above ₹500</p><p>Same-day delivery for orders placed before 2 PM</p><p>Delivery available across your city</p></div></details>
              <details className="group py-4" open><summary className="flex items-center justify-between cursor-pointer list-none"><span className="text-[14px] font-bold text-tx">Returns & Refunds</span><svg className="w-5 h-5 text-tx2 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg></summary><div className="mt-3 space-y-2 text-[13px] text-tx2 leading-relaxed"><p>Easy returns within 24 hours of delivery</p><p>Full refund if product is damaged or incorrect</p><p>Contact support for any issues</p></div></details>
            </div>
            <div className="h-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-bg border-b border-bd">
        <div className="max-w-5xl mx-auto px-4 h-[56px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={openNav} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition"><MenuI /></button>
            <span className="text-[20px] font-black tracking-tight text-tx select-none cursor-pointer" onClick={() => { setSelCat(null); setSearch(""); }}>{siteConfig.siteName}</span>
          </div>
          <div className="hidden md:flex flex-1 max-w-sm mx-6"><div className="relative w-full"><div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tx2"><SrchI /></div><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-11 pr-4 py-2.5 bg-bg2 border border-bd rounded-2xl text-[14px] text-tx placeholder:text-tx2 focus:outline-none focus:border-ac focus:shadow-[0_0_0_3px] focus:shadow-ac/10 transition" /></div></div>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearchO(!searchO)} className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition"><SrchI /></button>
            <button onClick={toggleDark} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition">{dark ? <SunI /> : <MoonI />}</button>
            <button onClick={openCart} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition relative"><BagI />{count > 0 && <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-ac text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">{count}</span>}</button>
            {loggedIn ? <button onClick={openNav} className="hidden lg:flex w-10 h-10 rounded-xl items-center justify-center overflow-hidden border border-bd">{uAvatar ? <img src={uAvatar} alt="" className="w-full h-full object-cover" /> : <span className="text-ac text-sm font-bold">{uName?.[0] || "U"}</span>}</button>
            : <button onClick={openLogin} className="hidden lg:flex items-center gap-1.5 text-[13px] font-medium text-tx2 hover:text-ac px-3 py-2 rounded-xl hover:bg-bg2 transition">Sign in</button>}
          </div>
        </div>
        {searchO && <div className="md:hidden px-4 pb-2.5"><div className="relative"><div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tx2"><SrchI /></div><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-11 pr-4 py-2.5 bg-bg2 border border-bd rounded-2xl text-[14px] text-tx placeholder:text-tx2 focus:outline-none focus:border-ac transition" /></div></div>}
      </header>

      {/* SIDEBAR */}
      {navO && <div className="fixed inset-0 z-[100]" onClick={closeNav}>
        <div className={`absolute inset-0 overlay-bg backdrop-anim ${navV ? "open" : ""}`} />
        <aside className={`absolute left-0 top-0 bottom-0 w-[280px] bg-bg border-r border-bd flex flex-col shadow-2xl sidebar-panel ${navV ? "open" : ""}`} onClick={e => e.stopPropagation()}>
          <div className="h-[56px] px-4 flex items-center justify-between border-b border-bd"><span className="text-[17px] font-black text-tx">{siteConfig.siteName}</span><button onClick={closeNav} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2"><XI /></button></div>
          {loggedIn && <div className="p-4 border-b border-bd flex items-center gap-3"><div className="w-10 h-10 rounded-full overflow-hidden border border-bd bg-bg2 flex items-center justify-center shrink-0">{uAvatar ? <img src={uAvatar} alt="" className="w-full h-full object-cover" /> : <span className="text-ac font-bold">{uName?.[0]}</span>}</div><div className="min-w-0"><p className="text-[14px] font-bold text-tx truncate">{uName}</p><p className="text-[11px] text-tx2">Customer</p></div></div>}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            <button onClick={() => { setSelCat(null); setSearch(""); closeNav(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-tx2 hover:text-ac hover:bg-ac2 transition"><HomeI />Home</button>
            {loggedIn && <button onClick={() => { closeNav(); setTimeout(loadOrders, 350); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-tx2 hover:text-ac hover:bg-ac2 transition"><PkgI />My Orders</button>}
            {!loggedIn && <button onClick={() => { closeNav(); setTimeout(openLogin, 350); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-tx2 hover:text-ac hover:bg-ac2 transition"><svg className={ic} viewBox="0 0 24 24" {...is}><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM20.59 22c0-3.87-3.85-7-8.59-7s-8.59 3.13-8.59 7"/></svg>Sign In with Google</button>}
            <div className="pt-4 pb-1 px-3"><p className="text-[10px] font-bold text-tx2 uppercase tracking-[0.15em]">Categories</p></div>
            {activeCategories.map(c => <button key={c.id} onClick={() => { setSelCat(c.id); closeNav(); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition ${selCat === c.id ? "text-ac bg-ac2" : "text-tx2 hover:text-ac hover:bg-ac2"}`}><PkgI />{c.name}</button>)}
          </nav>
          <div className="p-2 border-t border-bd space-y-0.5">
            <button onClick={toggleDark} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-tx2 hover:bg-bg2 transition">{dark ? <SunI /> : <MoonI />}{dark ? "Light mode" : "Dark mode"}</button>
            {loggedIn && <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-no hover:bg-no2 transition"><OutI />Sign out</button>}
            <Link href="/admin/login" onClick={closeNav} className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-tx2 hover:bg-bg2 transition"><PkgI />Admin</Link>
            <div className="pt-3 mt-1 border-t border-bd flex flex-wrap gap-x-4 gap-y-1 px-3 pb-1">
              <Link href="/terms" onClick={closeNav} className="text-[12px] text-tx2 hover:text-ac transition">Terms</Link>
              <Link href="/privacy" onClick={closeNav} className="text-[12px] text-tx2 hover:text-ac transition">Privacy</Link>
              <Link href="/contact" onClick={closeNav} className="text-[12px] text-tx2 hover:text-ac transition">Contact</Link>
            </div>
          </div>
        </aside>
      </div>}

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* CAROUSEL — sliding translateX effect */}
        {!search && !selCat && (
          <section className="mt-4 relative rounded-2xl overflow-hidden border border-bd"
            onTouchStart={e => setTouchX(e.touches[0].clientX)}
            onTouchEnd={e => { const diff = touchX - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { if (diff > 0) setSlide(s => (s + 1) % banners.length); else setSlide(s => (s - 1 + banners.length) % banners.length); } }}>
            <div className="relative h-[200px] sm:h-[260px] md:h-[320px]">
              <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${slide * 100}%)`, width: `${banners.length * 100}%` }}>
                {banners.map((b, i) => (
                  <div key={i} className="relative shrink-0 h-full" style={{ width: `${100 / banners.length}%` }}>
                    <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                      <h2 className="text-white text-xl sm:text-3xl font-black leading-tight mb-1.5">{b.title}</h2>
                      <p className="text-white/70 text-[13px] sm:text-[15px] max-w-sm">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setSlide(s => (s - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bg/70 dark:bg-card/70 flex items-center justify-center text-tx2 hover:text-tx border border-bd shadow transition"><ChL /></button>
            <button onClick={() => setSlide(s => (s + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bg/70 dark:bg-card/70 flex items-center justify-center text-tx2 hover:text-tx border border-bd shadow transition"><ChR /></button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">{banners.map((_, i) => <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${i === slide ? "bg-white w-5" : "bg-white/40 w-2"}`} />)}</div>
          </section>
        )}

        {/* PILLS */}
        <section className="mt-5 flex gap-2 overflow-x-auto hide-sb pb-1">
          <button onClick={() => { setSelCat(null); setShowCount(10); }} className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-medium border transition ${!selCat ? "bg-tx text-bg border-tx" : "bg-bg text-tx2 border-bd hover:border-tx2 dark:bg-bg2"}`}>All</button>
          {activeCategories.map(c => <button key={c.id} onClick={() => { setSelCat(selCat === c.id ? null : c.id); setShowCount(10); }} className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-medium border transition ${selCat === c.id ? "bg-tx text-bg border-tx" : "bg-bg text-tx2 border-bd hover:border-tx2 dark:bg-bg2"}`}>{c.name}</button>)}
        </section>

        {/* GRID — sticky price+add at bottom */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-[16px] font-bold text-tx">{selCat ? activeCategories.find(c => c.id === selCat)?.name || "Products" : "All Products"}</h2><span className="text-[12px] text-tx2 font-medium">{filtered.length} items</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.slice(0, showCount).map(p => { const q2 = qty(p.id); return (
              <div key={p.id} className="bg-card rounded-2xl border border-bd overflow-hidden hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition cursor-pointer group flex flex-col" onClick={() => setDetail(p)}>
                <div className="relative aspect-[4/3] bg-bg2 overflow-hidden"><img src={p.image || "/images/hero.jpg"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />{p.weight && <span className="absolute top-2 right-2 bg-bg/80 dark:bg-card/80 text-tx2 text-[10px] px-2 py-0.5 rounded-lg font-medium border border-bd">{p.weight}</span>}</div>
                <div className="p-3.5 flex flex-col flex-1">
                  <p className="text-[10px] text-tx2 font-medium mb-0.5">{p.categoryName}</p>
                  <h3 className="font-bold text-[14px] text-tx leading-snug line-clamp-1">{p.name}</h3>
                  {p.description && <p className="text-[12px] text-tx2 line-clamp-2 mt-1 leading-relaxed">{p.description}</p>}
                  {/* Sticky bottom — price + add */}
                  <div className="flex items-center justify-between mt-auto pt-3" onClick={e => e.stopPropagation()}>
                    <span className="text-[16px] font-black text-tx">₹{parseFloat(p.price).toFixed(0)}</span>
                    {p.stock === 0 ? <span className="text-[10px] text-no font-medium">Sold out</span>
                    : q2 === 0 ? <button onClick={() => add(p)} className="bg-ac text-white text-[12px] font-medium px-4 py-[6px] rounded-xl hover:opacity-90 active:scale-95 transition">Add</button>
                    : <div className="flex items-center border border-bd rounded-xl overflow-hidden bg-bg2"><button onClick={() => updQ(p.id, -1)} className="w-8 h-8 flex items-center justify-center text-tx2 hover:bg-bg"><Mn /></button><span className="w-6 text-center text-[12px] font-bold text-tx">{q2}</span><button onClick={() => updQ(p.id, 1)} className="w-8 h-8 flex items-center justify-center text-tx2 hover:bg-bg"><Pl /></button></div>}
                  </div>
                </div>
              </div>
            ); })}
          </div>
          {filtered.length > showCount && (
            <div className="mt-6 text-center">
              <button onClick={() => setShowCount(c => c + 10)} className="bg-bg2 border border-bd text-tx2 text-[13px] font-medium px-8 py-2.5 rounded-xl hover:border-tx2 hover:text-tx transition">
                Show More ({filtered.length - showCount} remaining)
              </button>
            </div>
          )}
          {filtered.length === 0 && <div className="text-center py-20"><p className="text-4xl mb-3">🔍</p><p className="text-[14px] text-tx2">No products found</p></div>}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-bd bg-bg"><div className="max-w-5xl mx-auto px-4 py-10"><div className="grid grid-cols-2 sm:grid-cols-4 gap-6"><div><h4 className="text-[11px] font-bold text-tx uppercase tracking-[0.12em] mb-3">Shop</h4><ul className="space-y-2.5 text-[13px] text-tx2"><li><button onClick={() => { setSelCat(null); window.scrollTo(0,0); }} className="hover:text-ac transition">All Products</button></li>{activeCategories.map(c => <li key={c.id}><button onClick={() => { setSelCat(c.id); window.scrollTo(0,0); }} className="hover:text-ac transition">{c.name}</button></li>)}</ul></div><div><h4 className="text-[11px] font-bold text-tx uppercase tracking-[0.12em] mb-3">Account</h4><ul className="space-y-2.5 text-[13px] text-tx2"><li><button onClick={() => loggedIn ? loadOrders() : openLogin()} className="hover:text-ac transition">{loggedIn ? "My Orders" : "Sign In"}</button></li><li><button onClick={openCart} className="hover:text-ac transition">Cart{count > 0 && ` (${count})`}</button></li></ul></div><div><h4 className="text-[11px] font-bold text-tx uppercase tracking-[0.12em] mb-3">Legal</h4><ul className="space-y-2.5 text-[13px] text-tx2"><li><Link href="/terms" className="hover:text-ac transition">Terms & Conditions</Link></li><li><Link href="/privacy" className="hover:text-ac transition">Privacy Policy</Link></li><li><Link href="/contact" className="hover:text-ac transition">Contact Us</Link></li></ul></div><div><h4 className="text-[11px] font-bold text-tx uppercase tracking-[0.12em] mb-3">Contact</h4><ul className="space-y-2.5 text-[13px] text-tx2"><li><Link href="/contact" className="hover:text-ac transition">Get in Touch</Link></li><li>{siteConfig.sitePhone}</li><li>{siteConfig.siteEmail}</li></ul></div></div><div className="border-t border-bd mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2"><p className="text-[12px] text-tx2">© 2025 {siteConfig.siteName}. All rights reserved.</p><Link href="/admin/login" className="text-[12px] text-tx2 hover:text-ac transition">Admin →</Link></div></div></footer>

      {/* CART */}
      {(() => {
        const mrpTotal = cart.reduce((s, c) => s + Math.round(c.sizePrice * 1.25) * c.quantity, 0);
        const discountAmt = mrpTotal - total;
        const deliveryFee = total >= freeDelMinVal ? 0 : 40;
        const billTotal = total + deliveryFee;
        return cartO ? <div className="fixed inset-0 z-[100]" onClick={closeCart}><div className={`absolute inset-0 overlay-bg backdrop-anim ${cartV ? "open" : ""}`} /><div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-bg border-l border-bd flex flex-col shadow-2xl cart-panel ${cartV ? "open" : ""}`} onClick={e => e.stopPropagation()}>
          <div className="h-[56px] px-4 flex items-center justify-between border-b border-bd"><h2 className="text-[15px] font-bold text-tx">Cart{count > 0 && <span className="text-tx2 ml-1.5 text-[13px] font-normal">({count} items)</span>}</h2><button onClick={closeCart} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2"><XI /></button></div>
          {cart.length === 0 ? <div className="flex-1 flex items-center justify-center"><p className="text-[14px] text-tx2">Your cart is empty</p></div> : <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {cart.map(item => <div key={`${item.product.id}_${item.selectedSize}`} className="flex items-center gap-3 border-b border-bd pb-3 last:border-0 last:pb-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-bg2 border border-bd"><img src={item.product.image || "/images/hero.jpg"} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-tx truncate">{item.product.name}</p><p className="text-[11px] text-tx2 mt-0.5">{item.selectedSize}</p><p className="text-[13px] font-bold text-tx mt-0.5">₹{item.sizePrice.toFixed(0)}</p></div>
                <div className="flex items-center border border-bd rounded-xl bg-bg2 overflow-hidden shrink-0">
                  <button onClick={() => updQ(item.product.id, -1, item.selectedSize)} className="w-8 h-8 flex items-center justify-center text-tx2 hover:bg-bg"><Mn /></button>
                  <span className="w-6 text-center text-[12px] font-bold text-tx">{item.quantity}</span>
                  <button onClick={() => updQ(item.product.id, 1, item.selectedSize)} className="w-8 h-8 flex items-center justify-center text-tx2 hover:bg-bg"><Pl /></button>
                </div>
              </div>)}
            </div>
            <div className="border-t border-bd p-4">
              <p className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-2">Price Details</p>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between"><span className="text-tx2">Total MRP</span><span className="text-tx">₹{mrpTotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-tx2">Discount</span><span className="text-ok font-medium">-₹{discountAmt.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-tx2">Delivery</span><span className={deliveryFee === 0 ? "text-ok font-medium" : "text-tx"}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
              </div>
              <div className="border-t border-bd mt-3 pt-3 flex justify-between items-center"><span className="text-[14px] font-bold text-tx">Total Amount</span><span className="text-[18px] font-black text-tx">₹{billTotal.toFixed(0)}</span></div>
              <div className="mt-3">{loggedIn ? <button onClick={() => { closeCart(); setTimeout(() => setCoO(true), 300); }} className="w-full bg-ac text-white py-3 rounded-xl text-[14px] font-medium hover:opacity-90 transition">Place Order</button> : <button onClick={() => { closeCart(); setTimeout(openLogin, 300); }} className="w-full bg-ac text-white py-3 rounded-xl text-[14px] font-medium hover:opacity-90 transition">Sign in to checkout</button>}</div>
              {deliveryFee > 0 && <p className="text-[11px] text-tx2 text-center mt-2">Add ₹{(freeDelMinVal - total).toFixed(0)} more for free delivery</p>}
            </div>
          </>}
        </div></div> : null;
      })()}

      {/* LOGIN */}
      {loginO && <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={closeLogin}><div className={`absolute inset-0 overlay-bg backdrop-anim ${loginV ? "open" : ""}`} /><div className={`relative bg-bg rounded-2xl w-full max-w-[360px] mx-4 border border-bd shadow-2xl modal-panel ${loginV ? "open" : ""}`} onClick={e => e.stopPropagation()}><button onClick={closeLogin} className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition z-10"><XI /></button><div className="p-8 text-center"><h2 className="text-[22px] font-black text-tx mb-1">Welcome</h2><p className="text-[13px] text-tx2 mb-8">Sign in to place orders to place orders and track deliveries.</p><button onClick={handleGoogle} disabled={aLoad} className="w-full flex items-center justify-center gap-3 bg-bg border-2 border-bd text-tx text-[14px] font-medium py-3.5 rounded-xl hover:bg-bg2 hover:border-tx2 transition active:scale-[0.98] disabled:opacity-50">{aLoad ? <div className="w-5 h-5 border-2 border-bd border-t-ac rounded-full animate-spin" /> : <><GoogleG />Continue with Google</>}</button>{aErr && <p className="text-[12px] text-no bg-no2 p-3 rounded-xl mt-4 border border-no/20 text-left">{aErr}</p>}<p className="text-[11px] text-tx2 mt-6 leading-relaxed">By signing in, you agree to our <Link href="/terms" className="text-ac hover:underline" onClick={e => e.stopPropagation()}>Terms</Link> and <Link href="/privacy" className="text-ac hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.</p></div></div></div>}

      {/* CHECKOUT */}
      {(() => {
        const coMrp = cart.reduce((s, c) => s + Math.round(c.sizePrice * 1.25) * c.quantity, 0);
        const coDisc = coMrp - total;
        const coDel = total >= freeDelMinVal ? 0 : 40;
        const coBill = total + coDel;
        return coO ? <Overlay onClose={() => setCoO(false)}><div className="px-5 py-3.5 border-b border-bd flex items-center justify-between"><h2 className="text-[15px] font-bold text-tx">Checkout</h2><button onClick={() => setCoO(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2"><XI /></button></div><div className="p-5 space-y-4"><div><label className="block text-[12px] font-medium text-tx2 mb-1.5">Delivery Address *</label><textarea value={coAddr} onChange={e => setCoAddr(e.target.value)} rows={2} className={inp} placeholder="Full address" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-[12px] font-medium text-tx2 mb-1.5">City</label><input value={coCity} onChange={e => setCoCity(e.target.value)} className={inp} placeholder="City" /></div><div><label className="block text-[12px] font-medium text-tx2 mb-1.5">Pincode</label><input value={coPin} onChange={e => setCoPin(e.target.value)} className={inp} placeholder="Pincode" /></div></div><div><label className="block text-[12px] font-medium text-tx2 mb-1.5">Notes</label><input value={coNotes} onChange={e => setCoNotes(e.target.value)} className={inp} placeholder="Special instructions" /></div>
          <div className="bg-bg2 rounded-xl p-4 border border-bd">
            <p className="text-[11px] font-bold text-tx2 uppercase tracking-wider mb-2">Price Details</p>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between"><span className="text-tx2">Total MRP ({count} items)</span><span className="text-tx">₹{coMrp.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className="text-tx2">Discount on MRP</span><span className="text-ok font-medium">-₹{coDisc.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className="text-tx2">Delivery Charge</span><span className={coDel === 0 ? "text-ok font-medium" : "text-tx"}>{coDel === 0 ? "Free" : `₹${coDel}`}</span></div>
            </div>
            <div className="border-t border-bd mt-3 pt-3 flex justify-between items-center"><span className="text-[14px] font-bold text-tx">Total Amount</span><span className="text-[18px] font-black text-tx">₹{coBill.toFixed(0)}</span></div>
          </div>
          {coErr && <p className="text-[12px] text-no bg-no2 p-3 rounded-xl border border-no/20">{coErr}</p>}</div><div className="sticky bottom-0 bg-bg p-4 border-t border-bd"><button onClick={placeOrder} disabled={coLoad} className="w-full bg-ac text-white py-3 rounded-xl text-[14px] font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">{coLoad ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Placing...</> : `Place Order · ₹${coBill.toFixed(0)}`}</button></div></Overlay> : null;
      })()}

      {done && <Overlay onClose={() => setDone(false)}><div className="p-10 text-center"><div className="w-16 h-16 bg-ok2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-ok/20"><svg className="w-8 h-8 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg></div><h3 className="text-xl font-black text-tx mb-1">Order Placed!</h3><p className="text-[14px] text-tx2 mb-6">We&apos;re preparing your order.</p><button onClick={() => setDone(false)} className="bg-ac text-white text-[14px] font-medium px-7 py-2.5 rounded-xl hover:opacity-90 transition">Continue Shopping</button></div></Overlay>}

      {ordO && <Overlay onClose={() => setOrdO(false)}><div className="px-5 py-3.5 border-b border-bd flex items-center justify-between"><h2 className="text-[15px] font-bold text-tx">My Orders</h2><button onClick={() => setOrdO(false)} className="w-9 h-9 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2"><XI /></button></div><div className="p-4 space-y-3">{orders.length === 0 ? <p className="text-center text-[14px] text-tx2 py-12">No orders yet</p> : orders.map(o => <div key={o.id} className="bg-bg2 rounded-xl p-4 border border-bd"><div className="flex items-center justify-between mb-2"><div><p className="text-[13px] font-bold text-tx">Order #{o.id}</p><p className="text-[11px] text-tx2">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div><span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${sC[o.status] || ""}`}>{sL[o.status] || o.status}</span></div>{o.items.map((i, idx) => <div key={idx} className="flex justify-between text-[12px] py-0.5"><span className="text-tx2">{i.name} x{i.quantity}</span><span className="font-medium text-tx">₹{i.total.toFixed(0)}</span></div>)}<div className="border-t border-bd mt-2 pt-2 flex justify-between"><span className="text-[12px] text-tx2">Total</span><span className="text-[14px] font-black text-tx">₹{o.totalAmount.toFixed(0)}</span></div></div>)}</div></Overlay>}
    </div>
  );
}
