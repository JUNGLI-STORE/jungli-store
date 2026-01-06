"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function PreLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          // bg-white/80 + backdrop-blur creates the "Opaque Blurry White" look
          className="fixed inset-0 z-[1000] bg-white/80 backdrop-blur-2xl flex items-center justify-center"
        >
          {/* Subtle noise texture to make it look like premium paper/glass */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.05, 1], // "Pop" entrance
              opacity: 1 
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1] // Professional custom ease
            }}
            className="relative w-64 md:w-96"
          >
            <Image 
              src="/logo.svg" 
              alt="JUNGLI" 
              width={500} 
              height={200} 
              priority
              // Subtle shadow to make the logo "lift" off the glass
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            />
          </motion.div>

          {/* Minimalist loading line at the bottom */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-jungli-orange origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}