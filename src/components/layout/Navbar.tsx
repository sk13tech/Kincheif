import React from 'react';
import { ShoppingCart, Menu, X, Leaf, LogOut, User, Package, Home, ShoppingBag, Info, Phone, ChevronRight } from 'lucide-react';
import { getCurrentCustomer, getCartTotal, getSettings, customerLogout } from '../../store';

interface Props { page: string; setPage: (p: string) => void; cartCount: number; cartTotal: number; refreshKey: number; }

export default function Navbar({ page, setPage, cartCount }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const customer = getCurrentCustomer();
  const { subtotal } = getCartTotal();
  const settings = getSettings();
  const nav = (p: string) => { setPage(p); setMenuOpen(false); setProfileOpen(false); };

  return (
    <>
      {settings.announcement && <div className="bg-emerald-600 text-white text-center text-[11px] py-1.5 px-4 font-medium">{settings.announcement}</div>}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => nav('home')} className="flex items-center gap-2 press shrink-0">
            {settings.logoUrl
              ? <img src={settings.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
              : <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Leaf className="w-4 h-4 text-white" /></div>}
            <span className="font-bold text-slate-800 text-[15px] hidden sm:block">{settings.storeName}</span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 bg-slate-50 rounded-full p-0.5">
            {[['home','Home'],['products','Shop'],['about','About'],['contact','Contact']].map(([k,v])=>(
              <button key={k} onClick={()=>nav(k)} className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all press ${page===k?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>{v}</button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            {/* Cart */}
            <button onClick={()=>nav('cart')} className="relative flex items-center gap-1.5 hover:bg-slate-50 rounded-full px-2.5 py-2 press transition-colors">
              <ShoppingCart className="w-[18px] h-[18px] text-slate-600" />
              {subtotal > 0 && <span className="text-[13px] font-semibold text-slate-700 hidden sm:block">₹{subtotal}</span>}
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>

            {/* Profile */}
            {customer ? (
              <div className="relative">
                <button onClick={()=>setProfileOpen(!profileOpen)} className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold press hover:bg-emerald-700 transition-colors">
                  {customer.name?customer.name.charAt(0).toUpperCase():'U'}
                </button>
                {profileOpen && <>
                  <div className="fixed inset-0 z-40" onClick={()=>setProfileOpen(false)} />
                  <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 a-slide-down overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{customer.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{customer.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={()=>nav('orders')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50"><Package className="w-4 h-4"/> My Orders</button>
                      <button onClick={()=>nav('account')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50"><User className="w-4 h-4"/> Account</button>
                    </div>
                    <div className="border-t border-slate-100 py-1">
                      <button onClick={()=>{customerLogout();setProfileOpen(false);nav('home');}} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50"><LogOut className="w-4 h-4"/> Sign Out</button>
                    </div>
                  </div>
                </>}
              </div>
            ) : (
              <button onClick={()=>nav('login')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4 py-1.5 text-[13px] font-semibold press transition-colors">
                <span className="hidden sm:inline">Sign In</span><User className="w-4 h-4 sm:hidden" />
              </button>
            )}

            {/* Mobile menu */}
            <button onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-50 press">
              {menuOpen ? <X className="w-5 h-5 text-slate-600"/> : <Menu className="w-5 h-5 text-slate-600"/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white a-slide-down">
            <div className="px-4 py-3 space-y-0.5">
              {([['home','Home',Home],['products','Shop',ShoppingBag],['about','About',Info],['contact','Contact',Phone]] as [string,string,any][]).map(([k,v,Icon])=>(
                <button key={k} onClick={()=>nav(k)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium press ${page===k?'bg-emerald-50 text-emerald-700':'text-slate-600 hover:bg-slate-50'}`}>
                  <span className="flex items-center gap-2.5"><Icon className="w-4 h-4"/>{v}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-20" />
                </button>
              ))}
              {customer && <>
                <div className="border-t border-slate-100 my-1"/>
                <button onClick={()=>nav('orders')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-slate-600 hover:bg-slate-50 press"><Package className="w-4 h-4"/> My Orders</button>
                <button onClick={()=>nav('account')} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-slate-600 hover:bg-slate-50 press"><User className="w-4 h-4"/> Account</button>
              </>}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
