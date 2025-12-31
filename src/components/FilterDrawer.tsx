"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import React from 'react';

// 1. Define the props to match what is being passed from page.tsx
interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    minPrice: string;
    maxPrice: string;
    size: string;
    category: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    minPrice: string;
    maxPrice: string;
    size: string;
    category: string;
  }>>;
}

export default function FilterDrawer({ isOpen, onClose, filters, setFilters }: FilterProps) {
  const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
  const categories = ["All", "Retro", "High-Top", "Lows", "Limited"];

  // Helper to reset filters
  const clearAll = () => {
    setFilters({ minPrice: "", maxPrice: "", size: "", category: "All" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 z-[150] backdrop-blur-sm" 
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full max-w-sm bg-white z-[160] border-r-8 border-black p-8 overflow-y-auto shadow-[10px_0_0_0_#000]"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter text-black">FILTER</h2>
              <button 
                onClick={onClose} 
                className="p-1 border-4 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <X size={32} />
              </button>
            </div>

            {/* 1. Category Section */}
            <div className="mb-8">
              <h3 className="font-black uppercase mb-4 border-b-2 border-black pb-2 text-sm italic">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters({ ...filters, category: cat })}
                    className={`border-2 border-black px-3 py-1 font-black text-xs uppercase italic transition-all
                      ${filters.category === cat ? 'bg-yellow-400' : 'bg-white hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Price Section */}
            <div className="mb-8">
              <h3 className="font-black uppercase mb-4 border-b-2 border-black pb-2 text-sm italic">Price Range</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-gray-400">₹</span>
                  <input 
                    type="number" 
                    placeholder="From" 
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full pl-6 p-3 border-2 border-black font-[1000] outline-none focus:bg-jungli-orange/5" 
                  />
                </div>
                <span className="font-black">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-gray-400">₹</span>
                  <input 
                    type="number" 
                    placeholder="To" 
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full pl-6 p-3 border-2 border-black font-[1000] outline-none focus:bg-jungli-orange/5" 
                  />
                </div>
              </div>
            </div>

            {/* 3. Size Section */}
            <div className="mb-10">
              <h3 className="font-black uppercase mb-4 border-b-2 border-black pb-2 text-sm italic">Select Size (UK)</h3>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setFilters({ ...filters, size: filters.size === size ? "" : size })}
                    className={`border-2 border-black p-2 font-[1000] text-xs transition-all italic
                      ${filters.size === size ? 'bg-jungli-orange text-white shadow-none' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <button 
                onClick={onClose}
                className="w-full bg-[#0A3D2E] text-white py-5 border-4 border-black font-[1000] uppercase italic shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Apply Intel
              </button>
              
              <button 
                onClick={clearAll}
                className="w-full text-black font-black uppercase italic text-xs underline decoration-2 hover:text-jungli-orange transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}