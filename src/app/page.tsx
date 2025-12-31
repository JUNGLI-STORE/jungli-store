"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// Components
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import FilterDrawer from '../components/FilterDrawer';
import SortDrawer from '../components/SortDrawer';

function HomeContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('s') || ""; // Reads search from Navbar (?s=...)

  // 1. DATA STATES
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. UI STATES (Drawers)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // 3. LOGIC STATES (Filter/Sort values)
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
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // MASTER FILTER & SORT ENGINE (Runs whenever any filter changes)
  useEffect(() => {
    let result = [...products];

    // Search Logic
    if (urlSearch) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(urlSearch.toLowerCase())
      );
    }

    // Price Filtering
    if (filters.minPrice) {
      result = result.filter(p => p.jungli_price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.jungli_price <= Number(filters.maxPrice));
    }

    // Category/Tag Filtering
    if (filters.category !== "All") {
      result = result.filter(p => p.tag === filters.category);
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
      default: // Featured / Initial load
        break;
    }

    setFilteredProducts(result);
  }, [urlSearch, filters, activeSort, products]);

  return (
    <>
      <Navbar />
      
      {/* DRAWERS */}
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
              <span className="bg-jungli-orange text-white font-black px-4 py-1 border-2 border-black mb-4 inline-block uppercase italic">
                India's Most Affordable Luxury
              </span>
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic leading-[0.85] tracking-tighter">
                SAME DRIP.<br/>
                <span className="text-jungli-orange">1/4TH PRICE.</span>
              </h1>
              <p className="mt-8 text-xl font-bold max-w-lg italic opacity-80 mx-auto md:mx-0">
                Stop paying ₹15,000 for a logo. Get high-end craftsmanship for under ₹3,999.
              </p>
            </motion.div>

            <div className="flex-1 hidden md:flex justify-center">
              <motion.div 
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border-8 border-black p-4 rotate-3 shadow-brutal w-80 h-80 flex items-center justify-center"
              >
                <p className="text-black font-black text-center uppercase italic text-4xl">JUNGLI<br/>DRIP</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STICKY ACTION BAR (FILTER/SORT) */}
        <div className="sticky top-[80px] z-40 bg-white border-y-4 border-black py-4 px-6 shadow-brutal-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="bg-white border-4 border-black px-8 md:px-12 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              FILTER
            </button>
            
            {urlSearch && (
              <span className="hidden md:block font-black uppercase italic text-gray-400">
                Results for: "{urlSearch}"
              </span>
            )}

            <button 
              onClick={() => setIsSortOpen(true)}
              className="bg-white border-4 border-black px-8 md:px-12 py-2 rounded-full font-[1000] uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              SORT
            </button>
          </div>
        </div>

        {/* SNEAKER GRID */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {loading ? (
              // SKELETON LOADERS
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 border-4 border-black aspect-[4/5] shadow-brutal-sm" />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
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

          {/* EMPTY STATE */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-40">
              <h2 className="text-5xl font-[1000] uppercase italic text-gray-300">Drip Not Found</h2>
              <button 
                onClick={() => {
                  setFilters({minPrice: "", maxPrice: "", size: "", category: "All"});
                  window.location.href = "/";
                }}
                className="mt-6 text-jungli-orange font-black underline uppercase italic"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* MARQUEE FOOTER */}
        <footer className="bg-black text-white py-12 border-t-8 border-jungli-orange overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-10">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-4xl font-black uppercase italic tracking-tighter">
                Premium Quality ★ Pan-India Shipping ★ Secure Checkout ★ Join the Jungle ★
              </span>
            ))}
          </div>
        </footer>
      </main>
    </>
  );
}

// Wrapper to handle useSearchParams in Next.js App Router
export default function Home() {
  return (
    <Suspense fallback={<div className="font-black p-20">LOADING JUNGLE...</div>}>
      <HomeContent />
    </Suspense>
  );
}