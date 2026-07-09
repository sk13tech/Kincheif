"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PrivacyPage() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggleDark = () => { const n = !dark; setDark(n); document.documentElement.classList.toggle("dark", n); localStorage.setItem("theme", n ? "dark" : "light"); };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-bg border-b border-bd">
        <div className="max-w-3xl mx-auto px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"/></svg>
            </Link>
            <span className="text-[15px] font-bold text-tx">Privacy Policy</span>
          </div>
          <button onClick={toggleDark} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition">
            {dark ? <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-2.05-6.95L18.36 5.64M5.64 18.36l-1.41 1.41M18.36 18.36l1.41 1.41M5.64 5.64L4.22 4.22"/></svg>
            : <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center gap-1.5 text-[12px] text-tx2 mb-6">
          <Link href="/" className="hover:text-ac transition">Home</Link><span>/</span><span className="text-tx font-medium">Privacy Policy</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-[24px] font-black text-tx leading-tight">Privacy Policy</h1>
            <p className="text-[13px] text-tx2 mt-2">Last updated: January 2024</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">1. Information We Collect</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">When you use KinChief, we may collect the following information:</p>
            <ul className="space-y-2 text-[14px] text-tx2 leading-relaxed ml-4">
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span><span><span className="font-medium text-tx">Account Information</span> — Name, email address, and profile picture provided through Google Sign-In.</span></li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span><span><span className="font-medium text-tx">Order Information</span> — Delivery address, city, pincode, phone number, and order history.</span></li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span><span><span className="font-medium text-tx">Usage Data</span> — Pages visited, products viewed, and interactions with our website.</span></li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span><span><span className="font-medium text-tx">Device Information</span> — Browser type, operating system, and device identifiers.</span></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">2. How We Use Your Information</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We use the collected information to:</p>
            <ul className="space-y-1.5 text-[14px] text-tx2 leading-relaxed ml-4">
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span>Process and deliver your orders</li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span>Communicate with you about your orders and account</li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span>Improve our products and services</li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span>Send promotional offers (with your consent)</li>
              <li className="flex gap-2"><span className="text-tx2 shrink-0">•</span>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">3. Data Sharing</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We do not sell your personal information. We may share data with trusted third parties only for order fulfillment (delivery partners), payment processing, and as required by law.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">4. Data Security</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We implement industry-standard security measures to protect your personal information, including encrypted data transmission (SSL/TLS), secure database storage, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">5. Cookies</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We use essential cookies and local storage to maintain your session, cart data, and theme preferences. We do not use third-party tracking cookies without your consent.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">6. Your Rights</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">You have the right to access, update, or delete your personal information at any time. You may also request data portability or withdraw consent for data processing by contacting us.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">7. Data Retention</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We retain your personal data only for as long as necessary to provide our services and fulfill legal obligations. Order history is retained for accounting and legal purposes for up to 7 years.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">8. Changes to This Policy</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We may update this Privacy Policy from time to time. We will notify users of significant changes via email or through a notice on our website.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">9. Contact Us</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">For privacy-related inquiries, please reach out to us at <span className="text-ac font-medium">hello@kinchief.com</span> or call <span className="text-ac font-medium">+91 98765 43210</span>.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-bd flex flex-wrap gap-4 text-[13px]">
          <Link href="/terms" className="text-ac font-medium hover:underline">Terms & Conditions</Link>
          <Link href="/contact" className="text-ac font-medium hover:underline">Contact Us</Link>
          <Link href="/" className="text-ac font-medium hover:underline">Back to Shop</Link>
        </div>
      </main>
    </div>
  );
}
