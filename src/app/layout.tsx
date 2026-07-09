import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinChief — Chips & Biscuits",
  description: "Order fresh chips and biscuits online.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" />
        
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.theme==='dark'||(!localStorage.theme&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="bg-bg text-tx font-sans antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
