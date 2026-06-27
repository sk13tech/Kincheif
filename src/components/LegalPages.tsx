import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

interface Props { type: 'privacy' | 'terms'; onBack: () => void; }

export default function LegalPage({ type, onBack }: Props) {
  const isPrivacy = type === 'privacy';
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  useEffect(() => subscribeSiteConfig(c => setCfg(c)), []);

  const email = cfg?.contactEmail || '';
  const brand = cfg?.siteName || '';
  const phone = cfg?.contactPhone || '';
  const addr = [cfg?.contactAddress, cfg?.contactCity].filter(Boolean).join(', ');

  if (!cfg) return (
    <div className="min-h-screen bg-sand-50 pt-14 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-ink-300" />
    </div>
  );

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

          {isPrivacy ? (
            <>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">1. Information We Collect</h2><p className="text-[13px] text-ink-500 leading-relaxed">We collect your name, email, phone number, delivery address, and payment transaction IDs when you place an order. Google sign-in provides your display name, email, and profile photo. We do not store passwords or bank details.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">2. How We Use Your Data</h2><p className="text-[13px] text-ink-500 leading-relaxed">Your data is used solely for processing orders, communicating delivery updates, and improving our services. We never sell, rent, or share your personal data with third parties for marketing purposes.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">3. Data Storage & Security</h2><p className="text-[13px] text-ink-500 leading-relaxed">All data is stored securely on Google Firebase with encryption at rest and in transit. Access is restricted to authorized personnel only. Payment is processed via UPI — we never see or store your bank account or card details.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">4. Cookies & Local Storage</h2><p className="text-[13px] text-ink-500 leading-relaxed">We use essential browser storage for authentication, cart functionality, and user preferences. No tracking, analytics, or advertising cookies are used on this website.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">5. Third-Party Services</h2><p className="text-[13px] text-ink-500 leading-relaxed">We use Google Firebase for authentication and data storage, and India Post API for pincode validation. These services have their own privacy policies. No other third-party services have access to your data.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">6. Your Rights</h2><p className="text-[13px] text-ink-500 leading-relaxed">You may request access to, correction of, or deletion of your personal data at any time. You can sign out to revoke authentication access. To make a request, contact us using the details below.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">7. Data Retention</h2><p className="text-[13px] text-ink-500 leading-relaxed">Order data is retained for business and legal compliance purposes. Profile data is retained until you request deletion. Contact form submissions are deleted after resolution.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">8. Changes to This Policy</h2><p className="text-[13px] text-ink-500 leading-relaxed">We may update this policy from time to time. Continued use of the website after changes constitutes acceptance of the updated policy.</p></section>

              {(email || phone || addr) && (
                <section><h2 className="font-serif text-lg text-ink-900 mb-2">9. Contact</h2><p className="text-[13px] text-ink-500 leading-relaxed">For privacy-related inquiries:{email ? ` Email: ${email}` : ''}{phone ? ` | Phone: ${phone}` : ''}{addr ? ` | Address: ${addr}` : ''}</p></section>
              )}
            </>
          ) : (
            <>
              <section><h2 className="font-serif text-lg text-ink-900 mb-2">1. Acceptance of Terms</h2><p className="text-[13px] text-ink-500 leading-relaxed">By accessing and using {brand || 'this'} website, you agree to be bound by these terms and conditions. {brand || 'We'} reserve the right to update these terms at any time without prior notice.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">2. Products & Pricing</h2><p className="text-[13px] text-ink-500 leading-relaxed">All products are subject to availability. Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice. Offers and discounts are subject to their specific terms.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">3. Orders & Payment</h2><p className="text-[13px] text-ink-500 leading-relaxed">Payment is accepted via UPI only. Orders are confirmed after successful payment verification. Transaction IDs are verified manually and verification may take up to 24 hours. We reserve the right to cancel orders with unverified or fraudulent payment details.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">4. Shipping & Delivery</h2><p className="text-[13px] text-ink-500 leading-relaxed">Delivery timelines are estimates and may vary depending on location and availability. Free delivery is available on orders meeting the minimum order value set by us. A delivery fee applies to orders below this threshold. We are not liable for delays caused by courier services or circumstances beyond our control.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">5. Cancellation</h2><p className="text-[13px] text-ink-500 leading-relaxed">Orders may be cancelled before processing begins. Once an order is shipped, cancellation is not possible. Refunds for cancelled orders with verified payments will be processed within 5-7 business days.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">6. Returns & Replacements</h2><p className="text-[13px] text-ink-500 leading-relaxed">Due to the perishable nature of our products, returns are not accepted. Replacements are available only for damaged, defective, or incorrect items. Replacement requests must be made within 3 days of delivery with supporting photographs. Replacements are subject to verification and approval.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">7. Coupons & Gift Cards</h2><p className="text-[13px] text-ink-500 leading-relaxed">Coupons are subject to their specific terms including minimum order value, expiry date, and usage limits. Gift cards are non-refundable and any remaining balance carries forward for future orders. Gift cards cannot be exchanged for cash.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">8. User Accounts</h2><p className="text-[13px] text-ink-500 leading-relaxed">You are responsible for maintaining the confidentiality of your account. You must provide accurate information during registration and checkout. We reserve the right to suspend accounts involved in fraudulent or abusive activity.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">9. Limitation of Liability</h2><p className="text-[13px] text-ink-500 leading-relaxed">{brand || 'We'} shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or consumption of products. Our total liability shall not exceed the amount paid for the specific order in question.</p></section>

              <section><h2 className="font-serif text-lg text-ink-900 mb-2">10. Governing Law</h2><p className="text-[13px] text-ink-500 leading-relaxed">These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in the city where the business is registered.</p></section>

              {(email || phone) && (
                <section><h2 className="font-serif text-lg text-ink-900 mb-2">11. Contact</h2><p className="text-[13px] text-ink-500 leading-relaxed">For questions about these terms:{email ? ` Email: ${email}` : ''}{phone ? ` | Phone: ${phone}` : ''}</p></section>
              )}
            </>
          )}
        </article>
      </div>
    </motion.div>
  );
}
