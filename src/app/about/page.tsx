"use client";
import { motion } from "framer-motion";
import { Flame, Zap, ShieldCheck, Target, Users, Trophy } from "lucide-react";

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* 1. HERO: THE MANIFESTO */}
        <motion.section 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black text-white border-8 border-black p-10 md:p-16 shadow-brutal mb-16 relative overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-jungli-orange animate-pulse" />
          <h1 className="text-6xl md:text-9xl font-[1000] uppercase italic tracking-tighter leading-none mb-6">
            BORN OF <span className="text-jungli-orange text-shadow-glow">FIRE</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold italic text-gray-400 uppercase tracking-widest max-w-2xl mx-auto leading-tight">
            India’s #1 Disruptor of the Overpriced Sneaker Industry.
          </p>
        </motion.section>

        {/* 2. THE PROBLEM vs THE SOLUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white border-4 border-black p-8 shadow-brutal">
                <h3 className="text-2xl font-[1000] uppercase italic mb-4 text-red-600 flex items-center gap-2">
                    <Target size={24} /> The Problem
                </h3>
                <p className="font-bold text-gray-600 uppercase text-xs leading-loose">
                    Big brands spend 80% of your money on celebrity ads and massive showrooms. 
                    They charge you ₹15,000 for a shoe that costs them ₹1,500 to make. 
                    <span className="text-black"> The system is built on greed, not quality.</span>
                </p>
            </div>
            <div className="bg-yellow-400 border-4 border-black p-8 shadow-brutal">
                <h3 className="text-2xl font-[1000] uppercase italic mb-4 text-black flex items-center gap-2">
                    <Zap size={24} /> The JUNGLI Way
                </h3>
                <p className="font-black text-black uppercase text-xs leading-loose">
                    We cut the middlemen. We cut the marketing. We spend your money on 
                    <span className="underline decoration-4">Master-Grade Materials</span>. 
                    We give you the same silhouette, the same 1:1 feel, and the same street presence for a smart price.
                </p>
            </div>
        </div>

        {/* 3. WHY WE ARE NO. 1 (3 Pillars) */}
        <section className="bg-white border-8 border-black p-10 shadow-brutal mb-16">
          <h2 className="text-4xl md:text-6xl font-[1000] uppercase italic tracking-tighter mb-12 text-center underline decoration-jungli-orange decoration-8">
            THE JUNGLI <span className="text-jungli-orange">OATH</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-black text-white border-4 border-black mx-auto flex items-center justify-center rotate-12 shadow-brutal-sm">
                    <ShieldCheck size={32} />
                </div>
                <h4 className="font-[1000] uppercase italic text-lg">A1 QUALITY</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                    We don't sell "cheap copies." We sell professional alternatives. Each pair is hand-checked for 1:1 stitching and original weight.
                </p>
            </div>
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-jungli-orange text-white border-4 border-black mx-auto flex items-center justify-center -rotate-12 shadow-brutal-sm">
                    <Trophy size={32} />
                </div>
                <h4 className="font-[1000] uppercase italic text-lg">STASH EXCLUSIVITY</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                    Our batches are limited. We secure 50-100 pairs of the world's most wanted designs so you stay ahead of the crowd.
                </p>
            </div>
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-400 text-black border-4 border-black mx-auto flex items-center justify-center rotate-6 shadow-brutal-sm">
                    <Users size={32} />
                </div>
                <h4 className="font-[1000] uppercase italic text-lg">3L+ HUNTERS</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                    With over 3,00,000 happy customers across India, JUNGLI is the most trusted name in the sneaker alternative scene.
                </p>
            </div>
          </div>
        </section>

        {/* 4. THE CALL TO ACTION */}
        <section className="bg-jungli-green text-white border-8 border-black p-12 text-center relative overflow-hidden group shadow-brutal">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter mb-6 relative z-10">
                STOP DREAMING.<br/>START <span className="text-yellow-400">HUNTING.</span>
            </h2>
            <p className="font-bold text-gray-300 uppercase text-xs italic mb-10 relative z-10 max-w-md mx-auto leading-loose">
                Join the largest sneaker community in India. High-tier drip is now accessible to everyone. 
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="relative z-10 bg-white text-black px-12 py-5 border-4 border-black font-[1000] uppercase italic text-2xl shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Enter The Vault —&gt;
            </button>
        </section>

      </div>
    </main>
  );
}