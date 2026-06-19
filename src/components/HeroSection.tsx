import { ArrowRight, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

interface HeroProps { onShopNow: () => void; }

export default function HeroSection({ onShopNow }: HeroProps) {
  const [cfg, setCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setCfg), []);

  const title = cfg.heroTitle || 'Pure. Homemade. Delicious.';
  const subtitle = cfg.heroSubtitle || 'Authentic recipes passed down through generations. No chemicals, no preservatives — just real food made with care in our kitchen.';
  const badge = cfg.heroBadge || 'Natural Ingredients';
  const heroImage = cfg.heroImage || 'https://images.pexels.com/photos/8287244/pexels-photo-8287244.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=640';

  return (
    <section className="relative pt-14">
      <div className="h-px bg-gradient-to-r from-transparent via-sand-400 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-green/30 bg-accent-green/5 px-3 py-1 mb-6">
              <Leaf className="h-3 w-3 text-accent-green" />
              <span className="text-[10px] font-mono uppercase tracking-[.12em] text-accent-green">{badge}</span>
            </div>

            <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-ink-900">
              {title.split('.').map((part, i, arr) => (
                <span key={i}>
                  {i === 0 ? <em>{part.trim()}</em> : i === arr.length - 1 ? (
                    <span className="relative">
                      {part.trim()}
                      <svg className="absolute -bottom-1 left-0 w-full h-2 text-accent-yellow/40" viewBox="0 0 200 8" preserveAspectRatio="none">
                        <path d="M0 7 Q50 0 100 5 Q150 2 200 6" stroke="currentColor" strokeWidth="3" fill="none" />
                      </svg>
                    </span>
                  ) : ` ${part.trim()}`}
                  {i < arr.length - 1 ? '. ' : '.'}
                </span>
              ))}
            </h1>

            <p className="mt-5 text-[15px] text-ink-500 max-w-md leading-relaxed">{subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <button onClick={onShopNow}
                className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-2.5 text-[13px] font-semibold tracking-wide text-sand-50 shadow-sm hover:bg-ink-800 active:scale-[0.97]">
                Browse Products <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button onClick={onShopNow}
                className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-6 py-2.5 text-[13px] font-semibold tracking-wide text-ink-700 hover:border-ink-400 hover:shadow-sm active:scale-[0.97]">
                View Bestsellers
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="relative hidden lg:block">
            <div className="relative aspect-[4/5] max-w-sm mx-auto">
              <div className="absolute inset-0 rounded-2xl border border-sand-300 rotate-3 bg-sand-100" />
              <div className="absolute inset-0 rounded-2xl border border-sand-300 -rotate-2 bg-sand-200/50" />
              <img src={heroImage} alt="Products" className="relative rounded-2xl border border-sand-300 object-cover w-full h-full" loading="eager" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-sand-300 to-transparent" />
    </section>
  );
}
