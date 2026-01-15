import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import PreLoader from "@/components/PreLoader";
import Footer from "@/components/Footer";
import ReviewsWidget from "@/components/ReviewsWidget"; // 👈 IMPORTED WIDGET

// 1. IMPORT TRACKING ENGINES
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Professional SEO Metadata
export const metadata: Metadata = {
  title: "JUNGLI | Luxury Kicks, Street Prices",
  description: "India's wildest sneaker drops. Master-quality silhouettes for under ₹3,999. Born of Fire.",
  icons: {
    icon: "/logo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 2. UMAMI TRACKING SCRIPT */}
        <Script
          async
          src="https://cloud.umami.is/script.js"
          data-website-id="625671e3-daf8-450c-b0a7-35bd284214e5"
          strategy="afterInteractive" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          
          <PreLoader /> 

          <Navbar />

          {children}

          <Footer />

          <CartSidebar />
          
          {/* THE NEW FLOATING REVIEWS WIDGET */}
          <ReviewsWidget />

          {/* 3. VERCEL TRACKING ENGINES */}
          <Analytics />
          <SpeedInsights />

        </CartProvider>
      </body>
    </html>
  );
}