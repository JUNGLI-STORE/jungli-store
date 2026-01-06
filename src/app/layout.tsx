import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar"; // Ensure Navbar is imported
import CartSidebar from "@/components/CartSidebar";
import PreLoader from "@/components/PreLoader";
import Footer from "@/components/Footer";

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
    icon: "/logo.svg", // This uses your logo as the browser tab icon
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* The CartProvider allows every component to see what's in the bag */}
        <CartProvider>
          
          {/* 1. The Intro Animation Layer */}
          <PreLoader /> 

          {/* 2. The Navigation Layer (Sticky) */}
          <Navbar />

          {/* 3. The Main Content (Home Page, Product Pages, etc.) */}
          {children}

          {/* 4. The Global Trust Layer */}
          <Footer />

          {/* 5. The Functional Drawers & Buttons (Floating Layers) */}
          <CartSidebar />
          

        </CartProvider>
      </body>
    </html>
  );
}