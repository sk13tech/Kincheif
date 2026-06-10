import { Leaf, MessageCircle, Mail, Phone, MapPin, Globe, Camera } from 'lucide-react';
import { getSettings } from '../../store';

interface Props { setPage: (p: string) => void; }

export default function Footer({ setPage }: Props) {
  const s = getSettings();
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {s.logoUrl ? (
                <img src={s.logoUrl} alt={s.storeName} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-white text-lg">{s.storeName}</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">{s.description}</p>
            <div className="flex gap-3">
              {s.socialLinks.instagram && <a href={s.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"><Camera className="w-4 h-4" /></a>}
              {s.socialLinks.facebook && <a href={s.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"><Globe className="w-4 h-4" /></a>}
              {s.socialLinks.whatsapp && <a href={`https://wa.me/${s.socialLinks.whatsapp}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"><MessageCircle className="w-4 h-4" /></a>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[['home', 'Home'], ['products', 'All Products'], ['about', 'About Us'], ['contact', 'Contact']].map(([k, v]) => (
                <button key={k} onClick={() => setPage(k)} className="block text-sm text-slate-400 hover:text-white transition-colors">{v}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <div className="space-y-2">
              <button onClick={() => setPage('about')} className="block text-sm text-slate-400 hover:text-white transition-colors">Our Story</button>
              <button onClick={() => setPage('contact')} className="block text-sm text-slate-400 hover:text-white transition-colors">Contact Us</button>
              <button onClick={() => setPage('terms')} className="block text-sm text-slate-400 hover:text-white transition-colors">Terms & Conditions</button>
              <button onClick={() => setPage('privacy')} className="block text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => setPage('admin-login')} className="block text-sm text-slate-500 hover:text-slate-300 transition-colors mt-4">Admin</button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" />{s.phone}</div>
              <div className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" />{s.email}</div>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{s.address}, {s.city}</div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {s.storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
