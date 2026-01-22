import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import PreLoader from "@/components/PreLoader";
import Footer from "@/components/Footer";
import ReviewsWidget from "@/components/ReviewsWidget";

// 1. IMPORT TRACKING ENGINES
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script"; // <--- Needed for Meta Pixel

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
        {/* UMAMI TRACKING SCRIPT (Existing) */}
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
        {/* --- META PIXEL CODE START --- */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1578316510103133');
              fbq('track', 'PageView');
            `,
          }}
        />
        {/* Fallback for disabled JS */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1578316510103133&ev=PageView&noscript=1"
            alt="facebook_pixel"
          />
        </noscript>
        {/* --- META PIXEL CODE END --- */}

        <CartProvider>
          
          <PreLoader /> 

          <Navbar />

          {children}

          <Footer />

          <CartSidebar />
          
          <ReviewsWidget />

          <Analytics />
          <SpeedInsights />

        </CartProvider>
      </body>
    </html>
  );
}