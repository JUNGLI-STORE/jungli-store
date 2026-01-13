"use client";
import { motion } from "framer-motion";
import { Gavel, AlertTriangle, Scale, ShoppingBag, FileText, Zap } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-black text-white border-8 border-black p-10 shadow-brutal mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-jungli-orange opacity-10 rounded-full -mr-16 -mt-16" />
          <h1 className="text-5xl md:text-7xl font-[1000] uppercase italic tracking-tighter leading-none mb-4">
            THE <span className="text-jungli-orange">RULES</span>
          </h1>
          <p className="font-black italic text-gray-400 uppercase tracking-widest text-sm">
            Terms of Service & Jungle Protocols
          </p>
        </motion.div>

        <div className="space-y-8">
          
          {/* SECTION 1: THE DEAL */}
          <section className="bg-white border-4 border-black p-8 shadow-brutal">
            <div className="flex items-center gap-4 text-jungli-orange mb-6">
                <ShoppingBag size={32} strokeWidth={3} />
                <h2 className="text-3xl font-[1000] uppercase italic text-black">1. Secure the Stash</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-[12px]">
              By using JUNGLI, you agree to these terms. All sneakers are sold as <span className="text-black underline">Independent Master-Grade Alternatives</span>. We are not affiliated with the original brands. You are paying for the quality, the silhouette, and the craft—not the trademark.
            </p>
          </section>

          {/* SECTION 2: BATCH PRICING */}
          <section className="bg-white border-4 border-black p-8 shadow-brutal">
            <div className="flex items-center gap-4 text-jungli-orange mb-6">
                <Zap size={32} strokeWidth={3} />
                <h2 className="text-3xl font-[1000] uppercase italic text-black">2. Batch Rarity</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-[12px]">
              Prices are subject to change without notice. Our pricing is determined by <span className="text-black">"Batch Rarity"</span>—the higher the quality of the materials we secure, the higher the value of the stash.
            </p>
          </section>

          {/* SECTION 3: ORDER FINALITY */}
          <section className="bg-white border-4 border-black p-8 shadow-brutal">
            <div className="flex items-center gap-4 text-jungli-orange mb-6">
                <Scale size={32} strokeWidth={3} />
                <h2 className="text-3xl font-[1000] uppercase italic text-black">3. Order Acceptance</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-[12px]">
              JUNGLI reserves the right to cancel any order if the stash is depleted or if we suspect fraudulent hunting. In case of cancellation by us, a <span className="text-black">100% full refund</span> will be issued to your original payment method.
            </p>
          </section>

          {/* THE "LAZY" REDIRECT */}
          <section className="border-4 border-black bg-yellow-400 text-black p-8 shadow-brutal-sm flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <FileText size={40} />
                <div>
                    <h3 className="font-[1000] uppercase italic text-lg leading-tight">Detailed Legal Intel</h3>
                    <p className="text-[10px] font-bold uppercase italic">Liability, User Conduct & Jurisdiction</p>
                </div>
             </div>
             <Link 
                href="/policy-intel" 
                target="_blank"
                className="bg-black text-white px-8 py-3 border-2 border-black font-[1000] uppercase italic text-xs hover:bg-white hover:text-black transition-all shadow-brutal-sm"
              >
                Read Full  Document
              </Link>
          </section>

        </div>
      </div>
    </main>
  );
}