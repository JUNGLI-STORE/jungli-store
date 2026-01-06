"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[1000] bg-white/60 backdrop-blur-lg flex items-center justify-center">
      <motion.div
        animate={{ 
            opacity: [0.4, 1, 0.4],
            scale: [0.98, 1, 0.98] 
        }}
        transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        className="w-48 md:w-64"
      >
        <Image 
          src="/logo.svg" 
          alt="Loading..." 
          width={300} 
          height={100} 
          className="w-full h-auto opacity-80"
        />
      </motion.div>
    </div>
  );
}