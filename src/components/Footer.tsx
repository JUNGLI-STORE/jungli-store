"use client";
import Link from 'next/link';
import { Instagram, Mail, ArrowUp, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t-8 border-jungli-orange pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-jungli-orange opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* 1. BRAND STASH */}
          <div className="space-y-6">
            <h2 className="text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
              JUNGLI<span className="text-jungli-orange">.</span>
            </h2>
            <p className="font-bold italic text-gray-400 text-[10px] leading-relaxed uppercase tracking-wider">
              India's #1 Disruptor. We don't follow trends; we hunt them. Premium silhouettes. Smart prices. No middleman.
            </p>
            <div className="flex gap-4">
              <Link href="https://www.instagram.com/jungli_store/" target="_blank" className="p-3 border-2 border-white hover:bg-jungli-orange hover:border-black transition-all shadow-[4px_4px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                <Instagram size={20} />
              </Link>
              <Link href="mailto:junglistore.help@gmail.com" className="p-3 border-2 border-white hover:bg-jungli-orange hover:border-black transition-all shadow-[4px_4px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                <Mail size={20} />
              </Link>
            </div>
          </div>

          {/* 2. THE VAULT */}
          <div>
            <h3 className="font-[1000] uppercase italic text-xl mb-8 border-b-4 border-jungli-orange inline-block">The Vault</h3>
            <ul className="space-y-4 font-black uppercase italic text-sm tracking-widest text-gray-300">
              <li><Link href="/" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">Latest Drops</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">Best Sellers</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">My Stash</Link></li>
              {/* ✅ UPDATED: Points to /about */}
              <li><Link href="/about" className="text-jungli-orange hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">The Vision</Link></li>
            </ul>
          </div>

          {/* 3. INTEL (Legal) */}
          <div>
            <h3 className="font-[1000] uppercase italic text-xl mb-8 border-b-4 border-jungli-orange inline-block">Intel</h3>
            <ul className="space-y-4 font-black uppercase italic text-sm tracking-widest text-gray-300">
              <li><Link href="/shipping" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">Shipping Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">Exchanges & Returns</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white decoration-2">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* 4. QUALITY OATH */}
          <div className="bg-jungli-green/20 border-4 border-white p-6 shadow-brutal-sm relative group">
            <Zap className="absolute top-[-15px] right-[-15px] text-yellow-400 fill-yellow-400 rotate-12 group-hover:scale-125 transition-transform" size={32} />
            <h3 className="font-[1000] uppercase italic text-lg mb-4 text-white">Quality Oath</h3>
            <p className="text-[10px] font-bold italic leading-loose text-gray-400 uppercase">
              Every pair is hand-inspected. If it isn't "Master Quality," it doesn't leave the jungle. Secure your drip with 100% confidence.
            </p>
            <div className="mt-6 flex items-center gap-2 text-jungli-orange font-black italic text-xs">
                <ShieldCheck size={16} /> 100% SECURE PAYMENTS
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t-4 border-gray-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase italic text-gray-500 tracking-[0.3em]">
            © 2026 JUNGLI STORE. BORN OF FIRE.
          </p>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-3 bg-white text-black px-6 py-3 border-4 border-black font-[1000] uppercase italic text-xs hover:bg-jungli-orange hover:text-white transition-all shadow-brutal-sm hover:shadow-none hover:translate-y-1"
          >
            Back to top <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}