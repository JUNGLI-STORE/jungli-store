"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full border-8 border-black p-10 shadow-brutal text-center bg-white relative overflow-hidden"
        >
          {/* Comic background detail */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-jungli-orange -mr-10 -mt-10 rotate-45" />

          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 border-4 border-black rounded-full">
              <CheckCircle size={60} className="text-green-600" />
            </div>
          </div>

          <h1 className="text-5xl font-[1000] uppercase italic tracking-tighter leading-none mb-4">
            ORDER <span className="text-jungli-orange">CONFIRMED</span>
          </h1>
          
          <p className="font-bold italic text-gray-600 mb-8">
            Your drip is being secured. Check your email for the tracking ID soon. 
            Stay wild.
          </p>

          <div className="space-y-4">
            <Link href="/" className="w-full bg-black text-white font-black py-5 border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase italic flex items-center justify-center gap-3">
              Back to Home <ArrowRight size={20} />
            </Link>
            
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-gray-400">
              <Package size={14} />
              Estimated Delivery: 3-5 Days
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}