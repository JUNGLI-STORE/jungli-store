"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// Components
import Navbar from '@/components/Navbar';
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

  // 2. UI STATES (Drawers)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 3. LOGIC STATES
  const [activeSort, setActiveSort] = useState("featured");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    size: "",
    category: "All"
  });

  // FETCH PRODUCTS FROM SUPABASE
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true) // Only show available items
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // MASTER FILTER & SORT ENGINE
  useEffect(() => {
    let result = [...products];

    // Search Filter
    if (urlSearch) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(urlSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    // Category Filter
    if (filters.category !== "All") {
      result = result.filter(p => p.tag === filters.category);
    }

    // Size Filter (Checks if the selected size is in the product's array)
    if (filters.size) {
      result = result.filter(p => p.available_sizes?.includes(filters.size));
    }

    // Price Filter
    if (filters.minPrice) {
      result = result.filter(p => p.jungli_price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.jungli_price <= Number(filters.maxPrice));
    }

    // Sorting Logic
    switch (activeSort) {
      case "price-low":
        result.sort((a, b) => a.jungli_price - b.jungli_price);
        break;
      case "price-high":
        result.sort((a, b) => b.jungli_price - a.jungli_price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [urlSearch, filters, activeSort, products]);

  return (
    <>
      <Navbar />
      
      <FilterDrawer 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters} 
        setFilters={setFilters} 
      />
      <SortDrawer 
        isOpen={isSortOpen} 
        onClose={() => setIsSortOpen(false)} 
        activeSort={activeSort} 
        setSort={setActiveSort} 
      />

      <main className="min-h-screen bg-gray-50">
        
        {/* HERO SECTION */}
        <section className="bg-jungli-green text-white py-20 px-6 relative overflow-hidden sawtooth">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 text-center md:text-left">
              <span className="bg-jungli-orange text-white font-black px-4 py-1 border-2 border-black mb-4 inline-block uppercase italic shadow-brutal-sm">
                Premium Performance. Street Prices.
              </span>
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic leading-[0.85] tracking-tighter">
                UNLEASH THE<br/>
                <span className="text-jungli-orange bg-white px-2 text-black border-4 border-black inline-block mt-2">JUNGLI.</span>
              </h1>
              <p className="mt-8 text-xl font-bold max-w-lg italic opacity-80 mx-auto md:mx-0 uppercase">
                Master-quality craftsmanship. zero markups. secured stash.
              </p>
            </motion.div>

            <div className="flex-1 flex justify-center items-center">
              <motion.div 
                animate={{ rotate: [3, -3, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border-8 border-black p-4 rotate-3 shadow-brutal w-72 h-72 md:w-96 md:h-96 flex items-center justify-center relative overflow-hidden group"
              >
                {/* Visual placeholder for the "Bred" vibe */}
                <div className="absolute inset-0 bg-jungli-orange opacity-10 group-hover:opacity-20 transition-opacity" />
                <p className="text-black font-[1000] text-center uppercase italic text-5xl md:text-7xl z-10 leading-none">
                  JOIN THE<br/>HUNT
                </p>
                <div className="absolute -bottom-4 -right-4 bg-black text-white p-4 font-black rotate-12 border-4 border-white">₹2,999</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STICKY ACTION BAR */}
        <div className="sticky top-[75px] z-40 bg-white border-y-4 border-black py-4 px-6 shadow-brutal-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="bg-white border-4 border-black px-8 md:px-12 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              FILTER {filters.size && `(${filters.size})`}
            </button>
            
            <div className="hidden md:flex flex-col items-center">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Scanning Stash</p>
               <span className="font-black uppercase italic text-black">{filteredProducts.length} PAIRS FOUND</span>
            </div>

            <button 
              onClick={() => setIsSortOpen(true)}
              className="bg-white border-4 border-black px-8 md:px-12 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              SORT
            </button>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <section id="drops" className="py-20 px-6 max-w-7xl mx-auto min-h-screen">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 border-4 border-black aspect-[4/5] shadow-brutal-sm" />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    brand={product.brand} // Pass Brand
                    name={product.name}
                    luxuryPrice={product.luxury_price}
                    jungliPrice={product.jungli_price}
                    tag={product.tag}
                    image={product.image_url}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
              <h2 className="text-5xl font-[1000] uppercase italic text-gray-300">NO DRIP DETECTED</h2>
              <button 
                onClick={() => {
                  setFilters({minPrice: "", maxPrice: "", size: "", category: "All"});
                  window.location.href = "/";
                }}
                className="mt-6 text-jungli-orange font-black underline uppercase italic"
              >
                Wipe All Filters
              </button>
            </motion.div>
          )}
        </section>

        {/* MARQUEE FOOTER */}
        <footer className="bg-black text-white py-16 border-t-8 border-jungli-orange overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-5xl font-[1000] uppercase italic tracking-tighter">
                Premium Performance ★ Pan-India Shipping ★ High-Density Quality ★ 
              </span>
            ))}
          </div>
        </footer>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="font-black p-20 text-center uppercase italic">Waking up the jungle...</div>}>
      <HomeContent />
    </Suspense>
  );
}