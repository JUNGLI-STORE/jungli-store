"use client";
import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  brand: string;         // ADDED: Brand prop
  luxuryPrice: number;
  jungliPrice: number;
  image: string;
  tag?: string;
}

export default function ProductCard({ id, name, brand, luxuryPrice, jungliPrice, image, tag }: ProductProps) {
  // Calculate discount
  const discount = Math.round(((luxuryPrice - jungliPrice) / luxuryPrice) * 100);

  return (
    <Link href={`/shop/${id}`} className="block group"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white border-4 border-black p-4 shadow-brutal hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col h-full"
      >
        {/* Hype Tag (Floating Badge) */}
        {tag && (
          <div className="absolute -top-3 -left-3 z-10 bg-jungli-orange text-white font-[1000] px-3 py-1 border-2 border-black -rotate-12 uppercase text-[10px] shadow-brutal-sm">
            {tag}
          </div>
        )}

        {/* Product Image Container */}
        <div className="relative aspect-square bg-gray-100 border-2 border-black mb-4 overflow-hidden group-hover:bg-white transition-colors">
          {/* Note: If image fails to load, check Supabase Storage Policy is set to 'Public' */}
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=SNEAKER+LOADING...";
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1 italic border-2 border-black shadow-brutal-sm">
            {discount}% OFF
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          {/* BRAND NAME: Small and distinct */}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">
            {brand || "STREET WEAR"}
          </p>
          
          {/* MODEL NAME: Responsive size to prevent overflow */}
          <h3 className="text-lg md:text-xl font-[1000] uppercase italic tracking-tighter leading-none mb-3 text-black">
            {name}
          </h3>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 line-through decoration-red-500 decoration-2">
              LUXURY: ₹{luxuryPrice.toLocaleString()}
            </span>
            <span className="text-2xl font-[1000] text-black uppercase italic tracking-tighter leading-none">
              ₹{jungliPrice.toLocaleString()}
            </span>
          </div>
          <div className="bg-yellow-400 p-2 border-2 border-black shadow-brutal-sm group-hover:bg-jungli-orange transition-colors">
            <Zap size={18} fill="currentColor" />
          </div>
        </div>

        <button className="w-full bg-black text-white font-black py-4 border-2 border-black flex items-center justify-center gap-2 hover:bg-jungli-orange transition-colors uppercase italic text-xs tracking-widest">
          <ShoppingCart size={16} />
          SECURE STASH
        </button>
      </motion.div>
    </Link>
  );
}