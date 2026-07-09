"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function TermsPage() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggleDark = () => { const n = !dark; setDark(n); document.documentElement.classList.toggle("dark", n); localStorage.setItem("theme", n ? "dark" : "light"); };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg border-b border-bd">
        <div className="max-w-3xl mx-auto px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"/></svg>
            </Link>
            <span className="text-[15px] font-bold text-tx">Terms & Conditions</span>
          </div>
          <button onClick={toggleDark} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition">
            {dark ? <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-2.05-6.95L18.36 5.64M5.64 18.36l-1.41 1.41M18.36 18.36l1.41 1.41M5.64 5.64L4.22 4.22"/></svg>
            : <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-tx2 mb-6">
          <Link href="/" className="hover:text-ac transition">Home</Link>
          <span>/</span>
          <span className="text-tx font-medium">Terms & Conditions</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-[24px] font-black text-tx leading-tight">Terms & Conditions</h1>
            <p className="text-[13px] text-tx2 mt-2">Last updated: January 2024</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">1. Acceptance of Terms</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">By accessing and using the KinChief website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">2. Use of Service</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">KinChief provides an online platform for ordering chips, biscuits, and related snack products. You must be at least 18 years old or have parental consent to use our services. You are responsible for maintaining the confidentiality of your account.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">3. Orders & Payments</h2>
            <div className="space-y-2 text-[14px] text-tx2 leading-relaxed">
              <p>All orders are subject to product availability. Prices displayed are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</p>
              <p>We reserve the right to refuse or cancel any order at our discretion. If an order is cancelled after payment, a full refund will be processed within 5-7 business days.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">4. Delivery</h2>
            <div className="space-y-2 text-[14px] text-tx2 leading-relaxed">
              <p>We aim to deliver orders within the estimated timeframe provided at checkout. Delivery times may vary based on location and availability.</p>
              <p>Free delivery is available on orders above ₹500. A delivery charge of ₹40 applies to orders below this threshold.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">5. Returns & Refunds</h2>
            <div className="space-y-2 text-[14px] text-tx2 leading-relaxed">
              <p>Returns are accepted within 24 hours of delivery for damaged or incorrect products. To initiate a return, please contact our support team with your order details and photos of the issue.</p>
              <p>Refunds will be processed to the original payment method within 5-7 business days of return approval.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">6. Product Information</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We make every effort to ensure product descriptions, images, and pricing are accurate. However, we do not guarantee that all information is error-free. Product images are for illustration purposes and actual products may vary slightly.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">7. Intellectual Property</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">All content on this website, including text, graphics, logos, and images, is the property of KinChief and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without prior written consent.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">8. Limitation of Liability</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">KinChief shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order in question.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">9. Changes to Terms</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website. Your continued use of our services constitutes acceptance of the updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-bold text-tx">10. Contact</h2>
            <p className="text-[14px] text-tx2 leading-relaxed">If you have any questions about these Terms and Conditions, please contact us at <span className="text-ac font-medium">hello@kinchief.com</span> or call <span className="text-ac font-medium">+91 98765 43210</span>.</p>
          </section>
        </div>

        {/* Bottom nav */}
        <div className="mt-10 pt-6 border-t border-bd flex flex-wrap gap-4 text-[13px]">
          <Link href="/privacy" className="text-ac font-medium hover:underline">Privacy Policy</Link>
          <Link href="/contact" className="text-ac font-medium hover:underline">Contact Us</Link>
          <Link href="/" className="text-ac font-medium hover:underline">Back to Shop</Link>
        </div>
      </main>
    </div>
  );
}
