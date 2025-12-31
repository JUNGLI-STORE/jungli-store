"use client";
import { motion } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link'; // 1. IMPORT LINK

interface ProductProps {
  id: string;             // 2. ADD ID TO PROPS
  name: string;
  luxuryPrice: number;
  jungliPrice: number;
  image: string;
  tag?: string;
}

export default function ProductCard({ id, name, luxuryPrice, jungliPrice, image, tag }: ProductProps) {
  const discount = Math.round(((luxuryPrice - jungliPrice) / luxuryPrice) * 100);

  return (
    // 3. WRAP THE ENTIRE CARD IN A LINK
    <Link href={`/shop/${id}`} className="block group"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white border-4 border-black p-4 shadow-brutal hover:shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 transition-all"
      >
        {/* Hype Tag */}
        {tag && (
          <div className="absolute -top-3 -left-3 z-10 bg-jungli-orange text-white font-black px-3 py-1 border-2 border-black -rotate-12 uppercase text-sm">
            {tag}
          </div>
        )}

        {/* Product Image Container */}
        <div className="relative aspect-square bg-gray-100 border-2 border-black mb-4 overflow-hidden group-hover:bg-gray-200 transition-colors">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-black text-white text-[10px] font-black px-2 py-1">
            {discount}% OFF
          </div>
        </div>

        {/* Product Info */}
        <h3 className="text-xl font-[1000] uppercase italic tracking-tighter mb-2 line-clamp-1">
          {name}
        </h3>
        
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 line-through decoration-red-500 decoration-2">
              Luxury: ₹{luxuryPrice.toLocaleString()}
            </span>
            <span className="text-2xl font-black text-black uppercase">
              ₹{jungliPrice.toLocaleString()}
            </span>
          </div>
          <div className="bg-yellow-400 p-2 border-2 border-black">
            <Zap size={20} fill="black" />
          </div>
        </div>

        <button className="w-full bg-black text-white font-black py-4 border-2 border-black flex items-center justify-center gap-2 hover:bg-jungli-orange transition-colors uppercase italic">
          <ShoppingCart size={18} />
          View Details
        </button>
      </motion.div>
    </Link>
  );
}