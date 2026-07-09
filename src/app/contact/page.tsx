"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ContactPage() {
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
            <span className="text-[15px] font-bold text-tx">Contact Us</span>
          </div>
          <button onClick={toggleDark} className="w-10 h-10 rounded-xl flex items-center justify-center text-tx2 hover:bg-bg2 transition">
            {dark ? <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-2.05-6.95L18.36 5.64M5.64 18.36l-1.41 1.41M18.36 18.36l1.41 1.41M5.64 5.64L4.22 4.22"/></svg>
            : <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center gap-1.5 text-[12px] text-tx2 mb-6">
          <Link href="/" className="hover:text-ac transition">Home</Link><span>/</span><span className="text-tx font-medium">Contact</span>
        </div>

        <h1 className="text-[24px] font-black text-tx leading-tight">Get in Touch</h1>
        <p className="text-[14px] text-tx2 mt-2 max-w-md">Have a question, feedback, or need help with an order? Reach out through any of the channels below.</p>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          <div className="bg-bg2 border border-bd rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-ac2 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-ac" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21.97 18.33c0 .36-.08.73-.25 1.09-.17.36-.39.7-.68 1.02-.49.54-1.03.93-1.64 1.18-.6.25-1.25.38-1.95.38-1.02 0-2.11-.24-3.26-.73s-2.3-1.15-3.44-1.98a28.75 28.75 0 01-3.28-2.8 28.414 28.414 0 01-2.79-3.27c-.82-1.14-1.48-2.28-1.96-3.41C2.24 8.67 2 7.58 2 6.54c0-.68.12-1.33.36-1.93.24-.61.62-1.17 1.15-1.67C4.15 2.31 4.85 2 5.59 2c.28 0 .56.06.81.18.26.12.49.3.67.56l2.32 3.27c.18.25.31.48.4.7.09.21.14.42.14.61 0 .24-.07.48-.21.71-.13.23-.32.47-.56.71l-.76.79c-.11.11-.16.24-.16.4 0 .08.01.15.04.23.04.08.07.14.09.18.18.33.49.76.93 1.28.45.52.93 1.05 1.45 1.58.54.53 1.06 1.02 1.59 1.47.52.44.95.74 1.29.92.03.02.1.05.18.09.09.04.18.05.28.05.17 0 .3-.06.41-.17l.76-.75c.25-.25.49-.44.72-.56.23-.14.46-.21.71-.21.19 0 .39.04.61.13.22.09.45.22.7.39l3.31 2.35c.26.18.44.39.55.64.1.25.16.5.16.78z"/></svg>
            </div>
            <h3 className="text-[14px] font-bold text-tx mb-1">Phone</h3>
            <p className="text-[13px] text-tx2">+91 98765 43210</p>
            <p className="text-[11px] text-tx2 mt-1">Mon-Sat, 9am-7pm</p>
          </div>
          <div className="bg-bg2 border border-bd rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-ac2 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-ac" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M17 20.5H7c-3 0-5-1.5-5-5v-7c0-3.5 2-5 5-5h10c3 0 5 1.5 5 5v7c0 3.5-2 5-5 5z"/><path d="M17 9l-3.13 2.5c-1.03.82-2.72.82-3.75 0L7 9"/></svg>
            </div>
            <h3 className="text-[14px] font-bold text-tx mb-1">Email</h3>
            <p className="text-[13px] text-tx2">hello@kinchief.com</p>
            <p className="text-[11px] text-tx2 mt-1">Reply within 24hrs</p>
          </div>
          <div className="bg-bg2 border border-bd rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-ac2 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-ac" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M11.9999 13.4299C13.723 13.4299 15.1199 12.0331 15.1199 10.3099C15.1199 8.58681 13.723 7.18994 11.9999 7.18994C10.2768 7.18994 8.87988 8.58681 8.87988 10.3099C8.87988 12.0331 10.2768 13.4299 11.9999 13.4299Z"/><path d="M3.62 8.49c1.97-8.66 14.8-8.65 16.76.01 1.15 5.08-2.01 9.38-4.78 12.04a5.193 5.193 0 01-7.21 0c-2.76-2.66-5.92-6.97-4.77-12.05z"/></svg>
            </div>
            <h3 className="text-[14px] font-bold text-tx mb-1">Address</h3>
            <p className="text-[13px] text-tx2">Main Street, Your City</p>
            <p className="text-[11px] text-tx2 mt-1">Visit our store</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-[18px] font-bold text-tx mb-4">Frequently Asked Questions</h2>
          <div className="divide-y divide-bd border-t border-b border-bd">
            {[
              { q: "How long does delivery take?", a: "We offer same-day delivery for orders placed before 2 PM. Standard delivery takes 1-2 business days depending on your location." },
              { q: "What is the minimum order amount?", a: "There is no minimum order amount. However, orders above ₹500 qualify for free delivery. A ₹40 delivery charge applies to smaller orders." },
              { q: "Can I cancel my order?", a: "You can cancel your order before it is dispatched. Once dispatched, cancellation is not possible but you can initiate a return after delivery." },
              { q: "Do you accept returns?", a: "Yes, we accept returns within 24 hours of delivery for damaged or incorrect products. Contact our support team with your order details." },
              { q: "How do I track my order?", a: "After signing in, go to My Orders from the sidebar menu. You can see the status of all your orders there." },
            ].map((faq, i) => (
              <details key={i} className="group py-4" open>
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-[14px] font-medium text-tx pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 text-tx2 shrink-0 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </summary>
                <p className="text-[13px] text-tx2 leading-relaxed mt-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-bd flex flex-wrap gap-4 text-[13px]">
          <Link href="/terms" className="text-ac font-medium hover:underline">Terms & Conditions</Link>
          <Link href="/privacy" className="text-ac font-medium hover:underline">Privacy Policy</Link>
          <Link href="/" className="text-ac font-medium hover:underline">Back to Shop</Link>
        </div>
      </main>
    </div>
  );
}
