"use client";
import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  brand: string;         
  luxuryPrice: number;
  jungliPrice: number;
  image: string;
  tag?: string;
}

export default function ProductCard({ id, name, brand, luxuryPrice, jungliPrice, image, tag }: ProductProps) {
  // Calculate discount percentage
  const discount = Math.round(((luxuryPrice - jungliPrice) / luxuryPrice) * 100);

  return (
    <Link href={`/shop/${id}`} className="block group h-full"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        // Hover effect: lifts the card and darkens the shadow for a 3D comic effect
        whileHover={{ y: -8, x: -4 }}
        className="relative bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(255,95,31,1)] transition-all flex flex-col h-full overflow-hidden"
      >
        {/* 1. HYPE TAG (Floating Badge) */}
        {tag && (
          <div className="absolute top-2 left-2 z-20 bg-jungli-orange text-white font-[1000] px-3 py-1 border-2 border-black -rotate-12 uppercase text-[10px] shadow-brutal-sm">
            {tag}
          </div>
        )}

        {/* 2. PRODUCT IMAGE */}
        <div className="relative aspect-square bg-gray-100 border-2 border-black mb-4 overflow-hidden group-hover:bg-white transition-colors">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            // Fallback if Supabase URL is broken or bucket is private
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x600/000000/FFFFFF/png?text=STASH+LOADING";
            }}
          />
          {/* Internal Discount Badge */}
          <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 italic border-2 border-black shadow-brutal-sm z-10">
            {discount}% OFF
          </div>
        </div>

        {/* 3. PRODUCT INFO */}
        <div className="flex-1 flex flex-col">
          {/* BRAND: Smaller, clean, all-caps */}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">
            {brand || "UNBRANDED STASH"}
          </p>
          
          {/* NAME: Responsive size, handles long collab names */}
          <h3 className="text-lg md:text-xl font-[1000] uppercase italic tracking-tighter leading-[0.9] mb-4 text-black group-hover:text-jungli-orange transition-colors">
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
              <span className="text-3xl font-[1000] text-black uppercase italic tracking-tighter leading-none">
                ₹{jungliPrice.toLocaleString()}
              </span>
            </div>
            {/* Energy Icon Badge */}
            <div className="bg-yellow-400 p-2 border-2 border-black shadow-brutal-sm group-hover:bg-jungli-orange group-hover:text-white transition-colors">
              <Zap size={20} fill="currentColor" />
            </div>
          </div>

          <button className="w-full bg-black text-white font-[1000] py-4 border-2 border-black flex items-center justify-center gap-2 group-hover:bg-jungli-orange transition-colors uppercase italic text-xs tracking-widest">
            <ShoppingCart size={16} />
            SECURE THE DRIP
          </button>
        </div>
      </motion.div>
    </Link>
  );
}