"use client";
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Bell, Users } from 'lucide-react';
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

  // Dynamic Tag Styling based on text
  const getTagStyle = (tagName: string) => {
    const t = tagName.toUpperCase();
    // Danger/Urgency - RED
  if (t.includes("FAST") || t.includes("FINAL")) return "bg-red-600 text-white animate-pulse";
  
  // Exclusivity - PURPLE (Standard luxury color)
  if (t.includes("LIMITED")) return "bg-purple-600 text-white";
  
  // Curation/Trust - YELLOW
  if (t.includes("BEST") || t.includes("WANTED") || t.includes("PICK")) return "bg-yellow-400 text-black";
  
  // Popularity - BLACK
  if (t.includes("RESTOCKED")) return "bg-black text-white";
  
  // Quality - BLUE
  if (t.includes("1:1") || t.includes("QUALITY")) return "bg-blue-600 text-white";
  
  // Default - ORANGE
  return "bg-jungli-orange text-white";
  };

  return (
    <Link href={`/shop/${id}`} className="block h-full group"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full overflow-hidden"
      >
        {/* 1. TOP LABELS */}
        <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start pointer-events-none">
          {tag && is_available ? (
            <div className={`${getTagStyle(tag)} font-[1000] px-3 py-1 border-2 border-black -rotate-6 uppercase text-[10px] shadow-brutal-sm`}>
              {tag}
            </div>
          ) : <div></div>}

          {!is_available && (
            <div className="bg-red-600 text-white font-[1000] px-3 py-1 border-2 border-black rotate-6 uppercase text-[10px] shadow-brutal-sm">
              SOLD OUT
            </div>
          )}
        </div>

        {/* 2. SNEAKER IMAGE */}
        <div className="relative aspect-square bg-gray-50 border-2 border-black mb-4 overflow-hidden flex items-center justify-center">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x600/000000/FFFFFF/png?text=LOADING...";
            }}
          />

          {is_available && (
            <div className="absolute bottom-2 right-2 bg-white text-black font-black px-2 py-1 text-[10px] border-2 border-black">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* 3. NAME & BRAND INFO */}
        <div className="flex-1 flex flex-col">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">
            {brand || "PREMIUM QUALITY"}
          </p>
          
          <h3 className="text-lg md:text-xl font-[1000] uppercase italic tracking-tighter leading-[0.9] mb-1 text-black group-hover:text-jungli-orange transition-colors">
            {name}
          </h3>

          {/* SOCIAL PROOF: Viewer Count (Randomized for Hype) */}
          {is_available && (
            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase italic mb-4">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              {(id.length % 15) + 8} people looking at this
            </div>
          )}
        </div>
        
        {/* 4. PRICE & BUTTON */}
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
            
            <div className={`p-2 border-2 border-black shadow-brutal-sm ${is_available ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-400'}`}>
              <Zap size={20} fill="currentColor" />
            </div>
          </div>

          <button 
            className={`w-full font-[1000] py-4 border-2 border-black flex items-center justify-center gap-2 uppercase italic text-xs tracking-widest transition-all
              ${is_available 
                ? 'bg-black text-white hover:bg-jungli-orange shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1' 
                : 'bg-white text-black hover:bg-gray-50 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1'}`}
          >
            {is_available ? (
              <>
                <ShoppingCart size={16} />
                BUY NOW
              </>
            ) : (
              <>
                <Bell size={16} />
                NOTIFY ME
              </>
            )}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}