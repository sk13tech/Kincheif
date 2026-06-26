import { CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props { orderId: string; onGoHome: () => void; onViewOrders: () => void; }

export default function OrderSuccess({ orderId, onGoHome, onViewOrders }: Props) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(orderId); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4 pt-14">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
          <div className="h-20 w-20 rounded-full border-2 border-accent-green/20 bg-accent-green/5 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-accent-green" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h1 className="mt-5 font-serif text-xl text-ink-900">Order Placed Successfully</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">We'll verify your payment and start processing.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-5 rounded-lg border border-sand-200 bg-white p-4">
          <p className="text-[10px] font-mono uppercase tracking-[.15em] text-ink-400">Order ID</p>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-[16px] font-mono font-bold text-ink-800">{orderId}</span>
            <button onClick={copy} className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-sand-100">
              {copied ? <CheckCircle className="h-3 w-3 text-accent-green" /> : <Copy className="h-3 w-3 text-ink-400" />}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-5 space-y-2.5">
          <button onClick={onViewOrders} className="w-full rounded-full border border-sand-300 bg-white py-2.5 text-[13px] font-semibold text-ink-700 hover:border-ink-400 active:scale-[0.97]">
            View My Orders
          </button>
          <button onClick={onGoHome} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2.5 text-[13px] font-semibold text-sand-50 hover:bg-ink-800 active:scale-[0.97]">
            Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
