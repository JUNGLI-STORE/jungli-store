"use client";
import { motion } from "framer-motion";
import { Truck, Zap, ShieldCheck, Clock, FileSearch, Globe } from "lucide-react";
import Link from "next/link";

export default function ShippingPolicy() {
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
            STASH <span className="text-jungli-orange">TRANSIT</span>
          </h1>
          <p className="font-black italic text-gray-400 uppercase tracking-widest text-sm">
            Pan-India High-Speed Fulfillment
          </p>
        </motion.div>

        <div className="space-y-8">
          
          {/* SECTION 1: THE TIMELINE */}
          <section className="bg-white border-4 border-black p-8 shadow-brutal">
            <div className="flex items-center gap-4 text-jungli-orange mb-6">
                <Clock size={32} strokeWidth={3} />
                <h2 className="text-3xl font-[1000] uppercase italic text-black">Delivery Timeline</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-black uppercase italic">
                <div className="bg-gray-100 p-6 border-4 border-black">
                    <p className="text-[10px] text-gray-400 mb-2">Processing Time</p>
                    <p className="text-xl">24 - 48 HOURS</p>
                </div>
                <div className="bg-yellow-400 p-6 border-4 border-black">
                    <p className="text-[10px] text-black/60 mb-2">Transit Time</p>
                    <p className="text-xl">5 - 7 WORKING DAYS</p>
                </div>
            </div>
          </section>

          {/* SECTION 2: THE LOGISTICS DISCLAIMER (The "Tactic") */}
          <section className="bg-white border-4 border-black p-8 shadow-brutal">
            <div className="flex items-center gap-4 text-jungli-orange mb-6">
                <Globe size={32} strokeWidth={3} />
                <h2 className="text-3xl font-[1000] uppercase italic text-black">Logistics Intel</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-[12px] mb-6">
              JUNGLI utilizes India's top-tier logistics operatives to ensure your stash arrives safely. 
              While we aim for a <span className="text-black underline decoration-2">5-7 day window</span>, 
              final delivery speed is subject to the operational capacity of our third-party courier partners.
            </p>
            
            <div className="bg-orange-50 border-2 border-dashed border-jungli-orange p-4 italic font-bold text-[10px] text-gray-500 uppercase">
                ⚡️ Note: In rare "Worst-Case" scenarios (Weather, Festive Rushes, or State Restrictions), 
                deliveries may experience technical latency. We appreciate your patience during the hunt.
            </div>
          </section>

          {/* SECTION 3: DEEP INTEL LINK (Redirects to your long policy) */}
          <section className="border-4 border-black bg-black text-white p-8 shadow-brutal-sm flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <FileSearch size={40} className="text-jungli-orange" />
                <div>
                    <h3 className="font-[1000] uppercase italic text-lg">Full Shipping Terms</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">Liability, Tracking, & RTO protocols</p>
                </div>
             </div>
             <Link 
                href="/policy-intel" 
                target="_blank"
                className="bg-white text-black px-6 py-3 border-2 border-white font-[1000] uppercase italic text-xs hover:bg-jungli-orange hover:text-white transition-all shadow-brutal-sm"
              >
                Read  Detailed Intel
              </Link>
          </section>

          {/* CONTACT BOX */}
          <div className="text-center pt-10">
              <p className="font-black uppercase italic text-xs text-gray-400 mb-4 tracking-widest">Tracking queries?</p>
              <a href="mailto:junglistore.help@gmail.com" className="text-jungli-orange font-[1000] uppercase italic underline decoration-2 underline-offset-4">junglistore.help@gmail.com</a>
          </div>

        </div>
      </div>
    </main>
  );
}