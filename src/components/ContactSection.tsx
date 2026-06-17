import { Mail, Phone, MapPin, Clock, Send, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { saveContact, subscribeSiteConfig, type SiteConfig } from '../lib/firebase';
import { sanitize, sanitizeEmail, checkRateLimit, isHoneypotTriggered, markFormOpen, isSubmissionTooFast } from '../lib/security';

const FORM_ID = 'contact';
const topics = ['General Inquiry', 'Order Issue', 'Product Question', 'Shipping & Delivery', 'Returns & Refunds', 'Partnership', 'Other'];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0] });
  const [honey, setHoney] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cfg, setCfg] = useState<SiteConfig>({});

  useEffect(() => { markFormOpen(FORM_ID); }, []);
  useEffect(() => subscribeSiteConfig(setCfg), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isHoneypotTriggered(honey)) return;
    if (isSubmissionTooFast(FORM_ID, 2000)) { setError('Please slow down.'); return; }
    if (!checkRateLimit('contact', 3, 300000)) { setError('Too many submissions. Try again later.'); return; }
    const clean = { name: sanitize(form.name), email: sanitizeEmail(form.email), message: `[${form.topic}] Contact request from ${sanitize(form.name)}` };
    if (!clean.name || !clean.email) { setError('Please fill all fields correctly.'); return; }
    await saveContact(clean);
    setSent(true); setForm({ name: '', email: '', topic: topics[0] });
    setTimeout(() => setSent(false), 3000);
    markFormOpen(FORM_ID);
  };

  // Read contact details from Firebase config (admin-editable)
  const info = [
    { icon: Phone, label: 'Phone', value: cfg.contactPhone || '+91 98765 43210' },
    { icon: Mail, label: 'Email', value: cfg.contactEmail || 'hello@purehomefoods.com' },
    { icon: MapPin, label: 'Address', value: [cfg.contactAddress, cfg.contactCity].filter(Boolean).join(', ') || 'Homemade Kitchen, India' },
    { icon: Clock, label: 'Hours', value: cfg.contactHours || 'Mon - Sat, 9 AM - 7 PM' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="h-px bg-gradient-to-r from-transparent via-sand-300 to-transparent mb-14" />
      <div className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-mono uppercase tracking-[.2em] text-ink-400 mb-1.5">Contact</p>
          <h2 className="font-serif text-xl sm:text-2xl text-ink-900">Contact Us</h2>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-2.5">
          {info.map(c => (
            <div key={c.label} className="flex items-center gap-3 rounded-lg border border-sand-200 bg-white p-3">
              <div className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-ink-500 flex-shrink-0"><c.icon className="h-3.5 w-3.5" /></div>
              <div><p className="text-[9px] font-mono uppercase tracking-[.12em] text-ink-400">{c.label}</p><p className="text-[12px] font-semibold text-ink-700">{c.value}</p></div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <form onSubmit={submit} className="rounded-lg border border-sand-200 bg-white p-5 space-y-3">
            <div className="absolute -left-[9999px]" aria-hidden="true" tabIndex={-1}>
              <input type="text" name="website" value={honey} onChange={e => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={100}
                className="w-full rounded-lg border border-sand-300 bg-sand-50 px-3 py-2.5 text-[13px] outline-none focus:bg-white focus:border-ink-400 focus:ring-1 focus:ring-ink-200" />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" maxLength={254}
                className="w-full rounded-lg border border-sand-300 bg-sand-50 px-3 py-2.5 text-[13px] outline-none focus:bg-white focus:border-ink-400 focus:ring-1 focus:ring-ink-200" />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[.12em] text-ink-400 mb-1">Topic</label>
              <div className="relative">
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-sand-300 bg-sand-50 px-3 py-2.5 text-[13px] outline-none focus:bg-white focus:border-ink-400 focus:ring-1 focus:ring-ink-200 pr-10">
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>
            </div>
            {error && <p className="text-[11px] text-accent-red font-medium">{error}</p>}
            <button type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 py-3 text-[13px] font-semibold tracking-wide text-sand-50 hover:bg-ink-800 active:scale-[0.97]">
              {sent ? <><Check className="h-4 w-4" /> Sent</> : <><Send className="h-4 w-4" /> Send Message</>}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
