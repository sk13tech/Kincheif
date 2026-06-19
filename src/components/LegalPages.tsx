import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

interface Props { type: 'privacy' | 'terms'; onBack: () => void; }

export default function LegalPage({ type, onBack }: Props) {
  const isPrivacy = type === 'privacy';
  const [cfg, setCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setCfg), []);

  const email = cfg.contactEmail || 'hello@purehomefoods.com';
  const brandName = cfg.siteName || 'PureHome Foods';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-sand-50 pt-14">
      <div className="sticky top-14 z-10 bg-sand-50/92 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-sand-300 bg-white text-ink-500 hover:border-ink-400 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-[15px] font-semibold text-ink-800">{isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <article className="rounded-lg border border-sand-200 bg-white p-6 sm:p-8 space-y-5">
          {isPrivacy && <p className="text-[10px] font-mono uppercase tracking-[.15em] text-ink-400">Privacy Policy</p>}

          {isPrivacy ? (
            <>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">1. Information We Collect</h2><p className="text-[13px] text-ink-500 leading-relaxed">We collect your name, email, phone number, delivery address, and payment transaction IDs when you place an order. Google sign-in provides your display name, email, and profile photo. We do not store passwords.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">2. How We Use Your Data</h2><p className="text-[13px] text-ink-500 leading-relaxed">Your data is used solely for processing orders, communicating delivery updates, and improving our services. We never sell or share your personal data with third parties for marketing.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">3. Data Storage & Security</h2><p className="text-[13px] text-ink-500 leading-relaxed">All data is stored securely on Google Firebase with encryption at rest and in transit. Access is restricted to authorized personnel only. Payment is processed via UPI — we never see or store your bank details.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">4. Cookies</h2><p className="text-[13px] text-ink-500 leading-relaxed">We use essential cookies for authentication and cart functionality. No tracking or advertising cookies are used.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">5. Your Rights</h2><p className="text-[13px] text-ink-500 leading-relaxed">You may request deletion of your data by contacting us at {email}. You can sign out at any time to revoke access.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">6. Contact</h2><p className="text-[13px] text-ink-500 leading-relaxed">For privacy-related inquiries, email us at {email}.</p></section>
            </>
          ) : (
            <>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">1. General</h2><p className="text-[13px] text-ink-500 leading-relaxed">By using {brandName} website and placing orders, you agree to these terms and conditions. {brandName} reserves the right to update these terms at any time.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">2. Orders & Payment</h2><p className="text-[13px] text-ink-500 leading-relaxed">All orders are subject to availability. Payment is accepted via UPI only. Orders are confirmed after successful payment verification. Manual transaction ID verification may take up to 24 hours.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">3. Pricing</h2><p className="text-[13px] text-ink-500 leading-relaxed">All prices are in Indian Rupees (INR) and inclusive of applicable taxes. We reserve the right to change prices without notice.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">4. Shipping & Delivery</h2><p className="text-[13px] text-ink-500 leading-relaxed">We deliver across India. Estimated delivery time is 2-5 business days. Free delivery on orders above the minimum threshold. Delivery charges apply on orders below the threshold.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">5. Returns & Refunds</h2><p className="text-[13px] text-ink-500 leading-relaxed">Due to the perishable nature of our products, returns are accepted only for damaged or incorrect items. Contact us within 24 hours of delivery with photos. Refunds will be processed within 7 business days.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">6. Cancellation</h2><p className="text-[13px] text-ink-500 leading-relaxed">Orders can be cancelled until processing begins. Once shipped, cancellation is not possible. Replacement requests can be made within 3 days of delivery for damaged items only.</p></section>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">7. Coupons & Gift Cards</h2><p className="text-[13px] text-ink-500 leading-relaxed">Coupons are single-use unless stated otherwise. Gift cards are non-refundable and carry forward balance can be used on future orders. Gift cards cannot be exchanged for cash.</p></section>
            </>
          )}
        </article>
      </div>
    </motion.div>
  );
}
