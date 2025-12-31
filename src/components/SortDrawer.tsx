"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowUpDown } from 'lucide-react';

interface SortProps {
  isOpen: boolean;
  onClose: () => void;
  activeSort: string;
  setSort: (val: string) => void;
}

export default function SortDrawer({ isOpen, onClose, activeSort, setSort }: SortProps) {
  
  // Professional Sort Options
  const options = [
    { label: "Featured Drops", value: "featured" },
    { label: "Best Selling", value: "best-selling" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 z-[150] backdrop-blur-sm" 
          />

          {/* 2. Side Drawer */}
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-[160] border-l-8 border-black p-8 flex flex-col shadow-[-10px_0_0_0_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <ArrowUpDown size={28} className="text-jungli-orange" />
                <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter text-black">SORT</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 border-4 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <X size={30} />
              </button>
            </div>

            {/* Sort Options List */}
            <div className="flex-1 space-y-4">
              {options.map((option) => (
                <button 
                  key={option.value}
                  onClick={() => {
                    setSort(option.value);
                    onClose(); // Close drawer after selection for speed
                  }}
                  className={`w-full group flex justify-between items-center p-5 border-4 border-black font-black uppercase italic text-lg transition-all
                    ${activeSort === option.value 
                      ? 'bg-yellow-400 shadow-none translate-x-1 translate-y-1' 
                      : 'bg-white shadow-brutal-sm hover:bg-gray-50 hover:-translate-y-1 hover:shadow-brutal'
                    }`}
                >
                  <span className={activeSort === option.value ? 'text-black' : 'text-gray-600 group-hover:text-black'}>
                    {option.label}
                  </span>
                  
                  {activeSort === option.value && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check size={24} className="text-black stroke-[4px]" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer / Branding */}
            <div className="mt-auto pt-8 border-t-4 border-dashed border-gray-200 text-center">
              <p className="text-[10px] font-black uppercase italic text-gray-300 tracking-[0.2em]">
                Jungli Algorithm Optimized
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


536539503397