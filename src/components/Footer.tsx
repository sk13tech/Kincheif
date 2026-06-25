import { useState, useEffect } from 'react';
import { ChevronDown, Leaf } from 'lucide-react';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

interface Props { onNavigate: (p: string) => void; }

export default function Footer({ onNavigate }: Props) {
  const [cfg, setCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setCfg), []);
  const brand = cfg.siteName || '';
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (t: string) => setOpen(p => ({ ...p, [t]: !p[t] }));

  const sections = [
    { title: 'Your Account', links: [
      { label: 'My Profile', action: 'profile' },
      { label: 'Order History', action: 'orders' },
      { label: 'Saved Addresses', action: 'profile' },
    ]},
    { title: 'Help', links: [
      { label: 'Contact Us', action: 'contact' },
      { label: `About ${brand}`, action: 'about' },
    ]},
    { title: 'Legal', links: [
      { label: 'Privacy Policy', action: 'privacy' },
      { label: 'Terms & Conditions', action: 'terms' },
    ]},
  ];

  return (
    <footer className="border-t border-sand-200 bg-sand-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Desktop */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-6 py-10">
          {sections.map(s => (
            <div key={s.title}>
              <h3 className="text-[10px] font-mono uppercase tracking-[.18em] text-ink-400 mb-3">{s.title}</h3>
              <ul className="space-y-1.5">
                {s.links.map(l => (
                  <li key={l.label}><button onClick={() => onNavigate(l.action)} className="text-[12px] text-ink-500 hover:text-ink-800 transition-colors">{l.label}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div className="sm:hidden py-4">
          {sections.map(s => (
            <div key={s.title} className="border-b border-sand-200 last:border-b-0">
              <button onClick={() => toggle(s.title)} className="w-full flex items-center justify-between py-3">
                <span className="text-[13px] font-semibold text-ink-700">{s.title}</span>
                <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform duration-200 ${open[s.title] ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${open[s.title] ? 'max-h-96 pb-3' : 'max-h-0'}`}>
                <ul className="space-y-1.5 pl-1">
                  {s.links.map(l => (
                    <li key={l.label}><button onClick={() => onNavigate(l.action)} className="text-[12px] text-ink-500 hover:text-ink-800 py-0.5">{l.label}</button></li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-sand-200" />
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-[11px] text-ink-400">© {new Date().getFullYear()} {brand} Foods. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('privacy')} className="text-[11px] text-ink-400 hover:text-ink-700">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="text-[11px] text-ink-400 hover:text-ink-700">Terms</button>
            <span className="text-[11px] text-ink-400">India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
