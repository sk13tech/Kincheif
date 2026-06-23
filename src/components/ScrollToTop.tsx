import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 z-40 h-9 w-9 inline-flex items-center justify-center rounded-full border border-sand-300 bg-white text-ink-600 shadow-md shadow-ink-900/5 transition-all hover:bg-sand-50 hover:border-ink-400 active:scale-90">
          <ChevronUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
