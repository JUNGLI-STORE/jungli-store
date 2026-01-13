"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  const [featuredShoe, setFeaturedShoe] = useState<any>(null);
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

  // Sync with Navbar Scroll
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) setIsNavbarHidden(true);
    else setIsNavbarHidden(false);
  });

  // FETCH DATA
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
          // Auto-set the first "available" shoe as the featured hero shoe
          const hero = data.find(p => p.is_available && p.tag === 'GRAIL') || data[0];
          setFeaturedShoe(hero);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // MASTER FILTER & WEAVING ENGINE
  useEffect(() => {
    let result = [...products];

    // Search
    if (urlSearch) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    // Category/Size/Price Filters
    if (filters.category !== "All") result = result.filter(p => p.tag === filters.category);
    if (filters.size) result = result.filter(p => p.available_sizes?.includes(filters.size));
    if (filters.minPrice) result = result.filter(p => p.jungli_price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(p => p.jungli_price <= Number(filters.maxPrice));

    // WEAVING LOGIC (For Featured Sort)
    if (activeSort === "featured") {
      const highHype = result.filter(p => p.is_available && (['SELLING FAST', 'LIMITED EDITION', 'BEST SELLER', 'GRAIL'].includes(p.tag)));
      const standardInStock = result.filter(p => p.is_available && !highHype.includes(p));
      const soldOut = result.filter(p => !p.is_available);

      const availableSorted = [...highHype, ...standardInStock].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const wovenGrid: any[] = [];
      let soldOutPtr = 0;

      availableSorted.forEach((item, index) => {
        wovenGrid.push(item);
        if ((index + 1) % 3 === 0 && soldOutPtr < soldOut.length) {
          wovenGrid.push(soldOut[soldOutPtr]);
          soldOutPtr++;
        }
      });
      if (soldOutPtr < soldOut.length) wovenGrid.push(...soldOut.slice(soldOutPtr));
      setFilteredProducts(wovenGrid);
    } else {
      // Manual Sorts
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
        
        {/* IMPROVED HERO SECTION */}
        <section className="bg-jungli-green text-white py-16 md:py-28 px-6 relative overflow-hidden sawtooth">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
            
            {/* LEFT: THE SHOUT */}
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 text-center md:text-left">
              <span className="inline-block bg-jungli-orange text-white font-[1000] px-4 py-1 border-2 border-white mb-6 uppercase italic shadow-brutal-sm text-xs">
                India's No. 1 Smart Choice.
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-[1000] uppercase italic leading-[0.8] tracking-tighter">
                THE 20K Quality <br/>
                <span className="text-jungli-orange bg-white px-4 text-black border-8 border-black inline-block mt-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  3K PRICE.
                </span>
              </h1>
              <p className="mt-12 text-xl font-bold max-w-lg italic opacity-80 mx-auto md:mx-0 uppercase">
                Premium quality silhouettes. <br/> built for streets.
              </p>
              <div className="mt-10">
                <a href="#drops" className="bg-white text-black px-8 py-4 border-4 border-black font-[1000] uppercase italic shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  Start The Hunt —&gt;
                </a>
              </div>
            </motion.div>

            {/* RIGHT: THE HANGING STASH */}
            {featuredShoe && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex justify-center">
                <Link href={`/shop/${featuredShoe.id}`} className="relative group">
                  <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-[#F8F1E9] border-[10px] border-black p-4 w-72 h-72 md:w-[420px] md:h-[420px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-visible"
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-black/5 font-[1000] text-[10rem] select-none italic">HUNT</span>
                    <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="relative z-20 w-full h-full flex items-center justify-center">
                      <img src={featuredShoe.image_url} className="w-full h-full object-contain drop-shadow-2xl" alt="Featured" />
                    </motion.div>
                    <div className="absolute -bottom-6 -right-6 bg-black text-white p-4 border-4 border-white font-[1000] rotate-12 shadow-brutal-sm z-30">
                      <p className="text-[10px] text-jungli-orange uppercase">STASH PRICE</p>
                      <p className="text-3xl italic">₹{featuredShoe.jungli_price.toLocaleString()}</p>
                    </div>
                  </motion.div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 border-4 border-black font-black uppercase text-xs animate-bounce shadow-brutal-sm">
                    LATEST DROP 🔥
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* STICKY ACTION BAR */}
        <section className="relative">
          <div style={{ top: isNavbarHidden ? '0px' : '75px' }} className="sticky z-40 bg-white/95 backdrop-blur-md border-y-4 border-black py-4 px-6 shadow-brutal-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center text-xs md:text-base">
              <button onClick={() => setIsFilterOpen(true)} className="bg-white border-4 border-black px-8 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1">
                FILTER {filters.size && `(${filters.size})`}
              </button>
             
              <button onClick={() => setIsSortOpen(true)} className="bg-white border-4 border-black px-8 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1">
                SORT
              </button>
            </div>
          </div>

          {/* SNEAKER GRID */}
          <div id="drops" className="py-20 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {loading ? (
                [1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse bg-gray-200 border-4 border-black aspect-[4/5] shadow-brutal-sm" />)
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
                      image={product.image_url} // FIXED: Correctly mapping image_url to image
                      is_available={product.is_available} 
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>

        <section className="relative z-50 bg-black text-white py-12 border-y-8 border-jungli-orange overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12 uppercase font-[1000] italic text-4xl">
            {[...Array(10)].map((_, i) => <span key={i}>Premium Performance ★ Pan-India Shipping ★ Secure Stash ★ </span>)}
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