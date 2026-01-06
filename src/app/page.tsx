"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// Components
import ProductCard from '@/components/ProductCard';
import FilterDrawer from '@/components/FilterDrawer';
import SortDrawer from '@/components/SortDrawer';

function HomeContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('s') || ""; 

  // 1. DATA STATES
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. UI STATES
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);

  // 3. LOGIC STATES
  const [activeSort, setActiveSort] = useState("featured");
  const [filters, setFilters] = useState({
    minPrice: "", maxPrice: "", size: "", category: "All"
  });

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) setIsNavbarHidden(true);
    else setIsNavbarHidden(false);
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // MASTER HYPE & WEAVING ENGINE
  useEffect(() => {
    let result = [...products];

    // Basic Filters
    if (urlSearch) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }
    if (filters.category !== "All") result = result.filter(p => p.tag === filters.category);
    if (filters.size) result = result.filter(p => p.available_sizes?.includes(filters.size));
    if (filters.minPrice) result = result.filter(p => p.jungli_price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(p => p.jungli_price <= Number(filters.maxPrice));

    // FEATURED / HYPE SORTING LOGIC
    if (activeSort === "featured") {
      // 1. Bucket A: High Hype + In Stock (Selling Fast, Limited, Best Seller)
      const highHype = result.filter(p => 
        p.is_available && (['SELLING FAST', 'LIMITED EDITION', 'BEST SELLER', 'GRAIL'].includes(p.tag))
      );

      // 2. Bucket B: Standard In Stock
      const standardInStock = result.filter(p => 
        p.is_available && !highHype.includes(p)
      );

      // 3. Bucket C: Sold Out (The Curiosity Items)
      const soldOut = result.filter(p => !p.is_available);

      // Combine Available items first (Newest first)
      const availableSorted = [...highHype, ...standardInStock].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 4. WEAVING ALGORITHM: Inject a Sold Out item every 3rd slot
      const wovenGrid: any[] = [];
      let soldOutPtr = 0;

      availableSorted.forEach((item, index) => {
        wovenGrid.push(item);
        // Every 3 items, if we have a sold out one, push it in
        if ((index + 1) % 3 === 0 && soldOutPtr < soldOut.length) {
          wovenGrid.push(soldOut[soldOutPtr]);
          soldOutPtr++;
        }
      });

      // Add remaining sold out items to the end
      if (soldOutPtr < soldOut.length) {
        wovenGrid.push(...soldOut.slice(soldOutPtr));
      }

      setFilteredProducts(wovenGrid);
    } else {
      // Manual Sorts (Price Low/High etc.)
      switch (activeSort) {
        case "price-low": result.sort((a, b) => a.jungli_price - b.jungli_price); break;
        case "price-high": result.sort((a, b) => b.jungli_price - a.jungli_price); break;
        case "newest": result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      }
      setFilteredProducts(result);
    }
  }, [urlSearch, filters, activeSort, products]);

  return (
    <>
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} setFilters={setFilters} />
      <SortDrawer isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} activeSort={activeSort} setSort={setActiveSort} />

      <main className="min-h-screen bg-gray-50">
        
        {/* HERO SECTION */}
        <section className="bg-jungli-green text-white py-20 px-6 relative overflow-hidden sawtooth">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1">
              <span className="bg-jungli-orange text-white font-black px-4 py-1 border-2 border-black mb-4 inline-block uppercase italic shadow-brutal-sm text-xs">
                India's No. 1 Smart Choice.
              </span>
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic leading-[0.85] tracking-tighter text-white">
                THE 20K LOOK.<br/>
                <span className="text-jungli-orange bg-white px-2 text-black border-4 border-black inline-block mt-2 shadow-brutal">3K PRICE.</span>
              </h1>
              <p className="mt-8 text-xl font-bold max-w-lg italic opacity-80 mx-auto md:mx-0 uppercase tracking-tight">
                Master-quality silhouettes. pocket-friendly. built for streets.
              </p>
            </motion.div>

            <div className="flex-1 flex justify-center items-center">
              <motion.div 
                animate={{ rotate: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border-8 border-black p-4 rotate-3 shadow-brutal w-72 h-72 md:w-96 md:h-96 flex flex-col items-center justify-center relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-jungli-orange opacity-10 group-hover:opacity-20 transition-opacity" />
                <p className="text-black font-[1000] text-center uppercase italic text-5xl md:text-7xl z-10 leading-none">
                  JOIN THE<br/>HUNT
                </p>
                <div className="absolute -bottom-4 -right-4 bg-black text-white p-4 font-black rotate-12 border-4 border-white shadow-brutal-sm text-xl italic uppercase">
                    ₹2,999
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STICKY ACTION BAR */}
        <section className="relative">
          <div 
            style={{ top: isNavbarHidden ? '0px' : '75px' }} 
            className="sticky z-40 bg-white/95 backdrop-blur-md border-y-4 border-black py-4 px-6 shadow-brutal-sm transition-all duration-300"
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="bg-white border-4 border-black px-6 md:px-12 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xs md:text-base"
              >
                FILTER {filters.size && `(${filters.size})`}
              </button>
              
              <div className="hidden md:flex flex-col items-center">
                 <span className="font-black uppercase italic text-black tracking-tighter">
                   {filteredProducts.length} PAIRS DETECTED
                 </span>
              </div>

              <button 
                onClick={() => setIsSortOpen(true)}
                className="bg-white border-4 border-black px-6 md:px-12 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xs md:text-base"
              >
                SORT
              </button>
            </div>
          </div>

          {/* SNEAKER GRID */}
          <div id="drops" className="py-20 px-6 max-w-7xl mx-auto min-h-[60vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 border-4 border-black aspect-[4/5] shadow-brutal-sm rounded-none" />
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id}
                      id={product.id}
                      brand={product.brand}
                      name={product.name}
                      luxuryPrice={product.luxury_price}
                      jungliPrice={product.jungli_price}
                      tag={product.tag}
                      image={product.image_url}
                      is_available={product.is_available} 
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {!loading && filteredProducts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
                <h2 className="text-5xl font-[1000] uppercase italic text-gray-300 italic">STASH DEPLETED</h2>
                <button 
                  onClick={() => {
                    setFilters({minPrice: "", maxPrice: "", size: "", category: "All"});
                    window.history.pushState({}, '', '/');
                  }}
                  className="mt-8 text-jungli-orange font-black underline uppercase italic text-xl decoration-4 underline-offset-8"
                >
                  Clear All Intel
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* MARQUEE HYPE BAR */}
        <section className="relative z-50 bg-black text-white py-12 border-y-8 border-jungli-orange overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-5xl font-[1000] uppercase italic tracking-tighter text-white">
                Premium Performance ★ Pan-India Shipping ★ Secure Stash ★ 
              </span>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-[1000] uppercase italic text-gray-200 text-4xl animate-pulse">Booting System...</div>}>
      <HomeContent />
    </Suspense>
  );
}