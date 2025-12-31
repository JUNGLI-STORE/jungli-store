"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const [user, setUser] = useState<any>(null);
  
  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-[100]">
      {/* MAIN NAVBAR */}
      <nav className="relative z-[110] bg-white border-b-4 border-black px-6 py-4 flex justify-between items-center shadow-brutal-sm">
        {/* Brand Logo */}
        <Link href="/">
          <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className="cursor-pointer">
            <Image 
              src="/logo.svg" 
              alt="JUNGLI" 
              width={150} 
              height={40}
              style={{ width: 'auto', height: '40px' }} 
              priority 
            />
          </motion.div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 font-[1000] uppercase italic tracking-tighter text-sm">
          <Link href="/" className="hover:text-jungli-orange transition-colors">Drops</Link>
          <Link href="/" className="hover:text-jungli-orange transition-colors">Best Sellers</Link>
          <Link href="/" className="hover:text-jungli-orange transition-colors">The Vision</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          {/* SEARCH ICON - Triggers the bar */}
          <Search 
            size={22} 
            className={`cursor-pointer transition-colors hover:text-jungli-orange ${isSearchOpen ? 'text-jungli-orange' : 'text-black'}`} 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          />
          
          <Link href={user ? "/profile" : "/login"}>
            <User 
              size={22} 
              className={`cursor-pointer transition-colors ${user ? 'text-jungli-orange' : 'text-black hover:text-jungli-orange'}`} 
            />
          </Link>
          
          <div 
            onClick={() => setIsCartOpen(true)}
            className="relative cursor-pointer bg-jungli-orange border-2 border-black p-2 shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all group"
          >
            <ShoppingBag size={22} color="white" className="group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 border-2 border-white rounded-full shadow-brutal-sm"
              >
                {cartCount}
              </motion.span>
            )}
          </div>
        </div>
      </nav>

      {/* SLIDE-DOWN SEARCH BAR */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop to close search */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />
            
            {/* The Search Bar Overlay */}
            <motion.div 
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="absolute top-full left-0 w-full bg-white border-b-8 border-black p-6 z-[100] shadow-brutal"
            >
              <div className="max-w-4xl mx-auto relative group">
                {/* Comic Shadow for input */}
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
                
                <div className="relative flex items-center bg-white border-4 border-black p-2">
                  <Search className="ml-4 text-black" size={30} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="HUNT FOR DRIP..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 font-[1000] uppercase italic text-3xl md:text-5xl outline-none placeholder:text-gray-200"
                  />
                  <button 
                    onClick={() => {setSearchQuery(""); setIsSearchOpen(false)}}
                    className="p-2 border-4 border-black hover:bg-black hover:text-white transition-all mr-2"
                  >
                    <X size={30} />
                  </button>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase italic text-gray-400">Press Enter to See All Results</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}