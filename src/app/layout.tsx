import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JUNGLI | Luxury Sneakers, Street Prices",
  description: "India's most affordable premium sneakers. Get master quality craftsmanship for under ₹3,999.",
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
        {/* Wrap children with CartProvider so every page can access the cart */}
        <CartProvider>
          {children}
          
          {/* Place CartSidebar here so it can slide out on any page */}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  );
}