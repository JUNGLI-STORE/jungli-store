"use client";
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Bell, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  brand: string;         
  luxuryPrice: number;
  jungliPrice: number;
  image: string;
  tag?: string;
  is_available?: boolean; 
}

export default function ProductCard({ 
  id, 
  name, 
  brand, 
  luxuryPrice, 
  jungliPrice, 
  image, 
  tag,
  is_available = true 
}: ProductProps) {
  
  const discount = Math.round(((luxuryPrice - jungliPrice) / luxuryPrice) * 100);

  return (
    <Link href={`/shop/${id}`} className="block h-full group"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full overflow-hidden"
      >
        {/* 1. TOP LABELS SECTION */}
        <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start pointer-events-none">
          {/* Hype Tag (e.g. NEW DROP) */}
          {tag && is_available ? (
            <div className="bg-jungli-orange text-white font-[1000] px-3 py-1 border-2 border-black -rotate-6 uppercase text-[10px] shadow-brutal-sm">
              {tag}
            </div>
          ) : <div></div>}

          {/* NEW: REFINED OUT OF STASH LABEL */}
          {!is_available && (
            <div className="bg-black text-red-500 font-[1000] px-3 py-1 border-2 border-red-500 rotate-6 uppercase text-[10px] shadow-brutal-sm animate-pulse">
              OUT OF STASH
            </div>
          )}
        </div>

        {/* 2. PRODUCT IMAGE (Vibrant, No Grayscale) */}
        <div className="relative aspect-square bg-gray-50 border-2 border-black mb-4 overflow-hidden flex items-center justify-center">
          <img 
            src={image} 
            alt={name} 
            // Image stays 100% visible so users can still see the drip
            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x600/000000/FFFFFF/png?text=STASH+LOADING";
            }}
          />

          {/* Small Discount Badge */}
          {is_available && (
            <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 italic border-2 border-black">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* 3. PRODUCT INFO */}
        <div className="flex-1 flex flex-col">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">
            {brand || "UNBRANDED STASH"}
          </p>
          
          <h3 className="text-lg md:text-xl font-[1000] uppercase italic tracking-tighter leading-[0.9] mb-4 text-black group-hover:text-jungli-orange transition-colors">
            {name}
          </h3>
        </div>
        
        {/* 4. PRICING & CTA */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-gray-400 line-through decoration-red-500 decoration-2 italic">
                ₹{luxuryPrice.toLocaleString()}
              </span>
              <span className="text-3xl font-[1000] text-black uppercase italic tracking-tighter leading-none">
                ₹{jungliPrice.toLocaleString()}
              </span>
            </div>
            
            <div className={`p-2 border-2 border-black shadow-brutal-sm ${is_available ? 'bg-yellow-400' : 'bg-gray-100'}`}>
              {is_available ? (
                <Zap size={20} fill="currentColor" />
              ) : (
                <Bell size={20} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* DYNAMIC ACTION BUTTON */}
          <button 
            className={`w-full font-[1000] py-4 border-2 border-black flex items-center justify-center gap-2 uppercase italic text-xs tracking-widest transition-all
              ${is_available 
                ? 'bg-black text-white hover:bg-jungli-orange' 
                : 'bg-white text-black hover:bg-black hover:text-white shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1'}`}
          >
            {is_available ? (
              <>
                <ShoppingCart size={16} />
                SECURE THE DRIP
              </>
            ) : (
              <>
                <Bell size={16} />
                NOTIFY WHEN READY
              </>
            )}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}