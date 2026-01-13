"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        className="bg-black text-white border-8 border-black p-12 shadow-brutal relative"
      >
        <div className="absolute -top-6 -right-6 bg-jungli-orange p-3 border-4 border-black rotate-12">
            <SearchX size={32} />
        </div>
        <h1 className="text-7xl font-[1000] uppercase italic tracking-tighter mb-4">404 ERROR</h1>
        <h2 className="text-3xl font-black uppercase italic text-jungli-orange mb-8">DRIP LOST IN THE JUNGLE</h2>
        <p className="font-bold text-gray-400 mb-10 uppercase italic max-w-xs mx-auto">
          The pair you are hunting for has escaped or the link is broken.
        </p>
        <Link href="/" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 border-4 border-black font-black uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 transition-all">
          <ArrowLeft size={20}/> Back to Vault
        </Link>
      </motion.div>
    </div>
  );
}