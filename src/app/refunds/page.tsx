"use client";
import { motion } from "framer-motion";
import { RotateCcw, ArrowRight, ShieldCheck, FileSearch } from "lucide-react";
import Link from "next/link";

export default function ExchangeReturns() {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-black text-white border-8 border-black p-10 shadow-brutal mb-12 relative"
        >
          <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter leading-none mb-4">
            EXCHANGE & <span className="text-jungli-orange">RETURNS</span>
          </h1>
          <p className="font-bold italic text-gray-400 uppercase tracking-widest text-sm">
            India's #1 Secure Stash Guarantee
          </p>
        </motion.div>

        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-brutal space-y-10">
          
          <div className="flex items-center gap-4 text-jungli-orange mb-2">
            <RotateCcw size={32} strokeWidth={3} />
            <h2 className="text-3xl font-[1000] uppercase italic text-black">7-Day Stash Swap</h2>
          </div>

          <p className="font-bold text-gray-600 leading-relaxed uppercase text-sm">
            Secured the wrong size? The jungle has your back. We offer an <span className="text-black underline decoration-4 decoration-jungli-orange">Elite 7-Day Size Exchange</span> program. 
            If your pair doesn't fit like a glove, we'll swap it for your perfect match.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="border-2 border-black p-4 bg-gray-50 italic font-bold text-xs uppercase">
                ✓ 100% Quality Inspected
            </div>
            <div className="border-2 border-black p-4 bg-gray-50 italic font-bold text-xs uppercase">
                ✓ Original Box Required
            </div>
          </div>

          {/* THE "TRICK" BUTTON - Opens long policy in new tab */}
          <div className="pt-10 border-t-4 border-black border-dashed">
            <p className="font-black uppercase italic text-[10px] text-gray-400 mb-4">
              Detailed technicalities regarding refunds and reverse logistics apply.
            </p>
            <Link 
              href="/policy-intel" 
              target="_blank"
              className="bg-jungli-orange text-white px-8 py-4 border-4 border-black font-[1000] uppercase italic text-lg shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-3"
            >
              Read Full Technical Intel <FileSearch size={20} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}