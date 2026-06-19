import { useState, useEffect, useCallback } from 'react';
import { Leaf, Heart, Award, Users, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

export default function AboutSection() {
  const [siteCfg, setSiteCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setSiteCfg), []);
  const brandName = siteCfg.siteName || 'PureHome';
  const vals = [
    { icon: Leaf, title: '100% Natural', desc: 'Free from chemicals and preservatives. Every ingredient is nature-sourced.', bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200/60', iconBg: 'bg-emerald-100 text-emerald-600' },
    { icon: Heart, title: 'Made with Love', desc: 'Small-batch, handcrafted using traditional family recipes across generations.', bg: 'from-rose-50 to-pink-50', border: 'border-rose-200/60', iconBg: 'bg-rose-100 text-rose-500' },
    { icon: Award, title: 'Quality First', desc: 'Finest ingredients with strict hygiene standards at every step.', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200/60', iconBg: 'bg-amber-100 text-amber-600' },
    { icon: Users, title: 'Farm to Table', desc: 'Direct sourcing from local farmers, supporting sustainable communities.', bg: 'from-blue-50 to-sky-50', border: 'border-blue-200/60', iconBg: 'bg-blue-100 text-blue-500' },
  ];

  const reviews = [
    { name: 'Priya Sharma', loc: 'Mumbai', text: 'The mango pickle tastes exactly like my grandmother used to make. Pure nostalgia in a jar!', avatar: 'PS' },
    { name: 'Rahul Verma', loc: 'Delhi', text: 'Finally found honey that is actually raw and unprocessed. My family loves the forest honey!', avatar: 'RV' },
    { name: 'Anita Patel', loc: 'Ahmedabad', text: "The turmeric powder has amazing color and aroma. You can tell it's truly pure.", avatar: 'AP' },
    { name: 'Suresh Kumar', loc: 'Bengaluru', text: "Ordered the masala chai blend. Absolutely incredible! Best chai I've ever had at home.", avatar: 'SK' },
    { name: 'Meera Joshi', loc: 'Pune', text: 'Love the strawberry jam! No artificial taste at all. My kids love it on their toast.', avatar: 'MJ' },
  ];

  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(0);

  const next = useCallback(() => { setDir(1); setCur(p => (p + 1) % reviews.length); }, [reviews.length]);
  const prev = useCallback(() => { setDir(-1); setCur(p => (p - 1 + reviews.length) % reviews.length); }, [reviews.length]);

  useEffect(() => { const t = setInterval(next, 5000); return () => clearInterval(t); }, [next]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="h-px bg-gradient-to-r from-transparent via-sand-300 to-transparent mb-14" />

      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-mono uppercase tracking-[.2em] text-ink-400 mb-1.5">Our Values</p>
          <h2 className="font-serif text-xl sm:text-2xl text-ink-900">Why Choose <em>{brandName}</em>?</h2>
          <p className="mt-2 text-[14px] text-ink-500 max-w-md mx-auto leading-relaxed">
            We believe food should be pure, honest, and full of love.
          </p>
        </motion.div>
      </div>

      {/* Values grid — icons only, no emojis */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vals.map((v, i) => (
          <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className={`group relative rounded-2xl border ${v.border} bg-gradient-to-br ${v.bg} p-5 transition-all hover:shadow-md hover:-translate-y-0.5`}>
            <div className={`h-11 w-11 rounded-xl ${v.iconBg} flex items-center justify-center mb-4`}>
              <v.icon className="h-5 w-5" />
            </div>
            <h3 className="text-[14px] font-bold text-ink-800 mb-1">{v.title}</h3>
            <p className="text-[12px] text-ink-500 leading-relaxed">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Testimonials auto-carousel */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[.2em] text-ink-400 mb-1">Testimonials</p>
          <h3 className="font-serif text-xl text-ink-900">What Our Customers Say</h3>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-sand-200 bg-white px-8 py-8 sm:px-12 sm:py-10 min-h-[200px]">
            <Quote className="absolute top-5 left-5 h-8 w-8 text-sand-200" />

            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div key={cur} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="text-center">
                <div className="flex justify-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-accent-yellow text-accent-yellow" />)}
                </div>
                <p className="text-[15px] text-ink-700 leading-relaxed italic max-w-lg mx-auto">
                  "{reviews[cur].text}"
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ink-200 to-ink-300 flex items-center justify-center text-[11px] font-bold text-white">
                    {reviews[cur].avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-semibold text-ink-800">{reviews[cur].name}</p>
                    <p className="text-[10px] font-mono uppercase tracking-[.1em] text-ink-400">{reviews[cur].loc}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-9 w-9 rounded-full border border-sand-200 bg-white shadow-sm flex items-center justify-center text-ink-500 hover:text-ink-800 active:scale-90">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 h-9 w-9 rounded-full border border-sand-200 bg-white shadow-sm flex items-center justify-center text-ink-500 hover:text-ink-800 active:scale-90">
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex justify-center gap-1.5 mt-4">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => { setDir(i > cur ? 1 : -1); setCur(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === cur ? 'w-6 bg-ink-600' : 'w-1.5 bg-sand-300'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
