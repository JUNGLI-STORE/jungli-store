"use client";
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  brand: string;         
  luxuryPrice: number;
  jungliPrice: number;
  image: string;
  tag?: string;
  is_available?: boolean; // NEW: Added availability prop
}

export default function ProductCard({ 
  id, 
  name, 
  brand, 
  luxuryPrice, 
  jungliPrice, 
  image, 
  tag,
  is_available = true // Default to true if not provided
}: ProductProps) {
  
  const discount = Math.round(((luxuryPrice - jungliPrice) / luxuryPrice) * 100);

  return (
    <Link href={`/shop/${id}`} className={`block h-full ${!is_available ? 'cursor-not-allowed' : ''}`}> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`relative bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full overflow-hidden
          ${!is_available ? 'opacity-80 shadow-none grayscale-[0.5]' : ''}`}
      >
        {/* 1. HYPE TAG (Hidden if Out of Stock) */}
        {tag && is_available && (
          <div className="absolute top-2 left-2 z-20 bg-jungli-orange text-white font-[1000] px-3 py-1 border-2 border-black -rotate-12 uppercase text-[10px] shadow-brutal-sm">
            {tag}
          </div>
        )}

        {/* 2. PRODUCT IMAGE SECTION */}
        <div className="relative aspect-square bg-gray-50 border-2 border-black mb-4 overflow-hidden flex items-center justify-center">
          <img 
            src={image} 
            alt={name} 
            // Grayscale effect when out of stock
            className={`w-full h-full object-contain p-2 transition-all duration-500 
              ${!is_available ? 'grayscale opacity-30' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x600/000000/FFFFFF/png?text=STASH+LOADING";
            }}
          />

          {/* NEW: SOLD OUT OVERLAY BANNER */}
          {!is_available && (
            <div className="absolute inset-0 flex items-center justify-center rotate-[-15deg] pointer-events-none z-30">
               <div className="bg-black text-red-500 border-4 border-red-500 px-4 py-2 font-[1000] text-xl md:text-2xl uppercase italic shadow-[6px_6px_0px_0px_rgba(239,68,68,0.5)]">
                  STASH DEPLETED
               </div>
            </div>
          )}

          {/* Discount Badge (Hidden if Out of Stock) */}
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
          
          <h3 className={`text-lg md:text-xl font-[1000] uppercase italic tracking-tighter leading-[0.9] mb-4 text-black 
            ${is_available ? 'group-hover:text-jungli-orange' : 'text-gray-400'}`}>
            {name}
          </h3>
        </div>
        
        {/* 4. PRICING & CTA */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-gray-400 line-through decoration-red-500 decoration-2 italic">
                LUXURY: ₹{luxuryPrice.toLocaleString()}
              </span>
              <span className={`text-3xl font-[1000] uppercase italic tracking-tighter leading-none 
                ${is_available ? 'text-black' : 'text-gray-400'}`}>
                ₹{jungliPrice.toLocaleString()}
              </span>
            </div>
            <div className={`p-2 border-2 border-black shadow-brutal-sm ${is_available ? 'bg-yellow-400' : 'bg-gray-200'}`}>
              {is_available ? <Zap size={20} fill="currentColor" /> : <AlertTriangle size={20} className="text-gray-400" />}
            </div>
          </div>

          <button 
            disabled={!is_available}
            className={`w-full font-[1000] py-4 border-2 border-black flex items-center justify-center gap-2 uppercase italic text-xs tracking-widest transition-all
              ${is_available 
                ? 'bg-black text-white hover:bg-jungli-orange' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none'}`}
          >
            {is_available ? (
              <>
                <ShoppingCart size={16} />
                SECURE THE DRIP
              </>
            ) : (
              "WAITING FOR RESTOCK"
            )}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}