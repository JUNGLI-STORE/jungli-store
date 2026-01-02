"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, X, Package, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // UI States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?s=${searchQuery.trim()}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    router.push('/');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-[100]">
      {/* MAIN NAVBAR */}
      <nav className="relative z-[110] bg-white border-b-4 border-black px-4 md:px-8 py-4 flex justify-between items-center shadow-brutal-sm">
        {/* Brand Logo */}
        <Link href="/">
          <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className="cursor-pointer">
            <Image 
              src="/logo.svg" 
              alt="JUNGLI" 
              width={140} 
              height={35}
              style={{ width: 'auto', height: '35px' }} 
              priority 
            />
          </motion.div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 font-[1000] uppercase italic tracking-tighter text-sm">
          <Link href="/" className="hover:text-jungli-orange transition-colors">Drops</Link>
          <Link href="/" className="hover:text-jungli-orange transition-colors">Best Sellers</Link>
          <Link href="/" className="hover:text-jungli-orange transition-colors">The Vision</Link>
        </div>

        {/* Icons Area */}
        <div className="flex items-center gap-4 md:gap-6">
          <Search 
            size={22} 
            className={`cursor-pointer transition-colors hover:text-jungli-orange ${isSearchOpen ? 'text-jungli-orange' : 'text-black'}`} 
            onClick={() => { setIsSearchOpen(!isSearchOpen); setIsProfileOpen(false); }}
          />
          
          {/* PROFILE DROPDOWN TRIGGER */}
          <div className="relative">
            <User 
              size={22} 
              className={`cursor-pointer transition-colors ${user ? 'text-jungli-orange fill-jungli-orange/10' : 'text-black hover:text-jungli-orange'}`} 
              onClick={() => {
                if(!user) router.push('/login');
                else setIsProfileOpen(!isProfileOpen);
                setIsSearchOpen(false);
              }}
            />

            {/* AUTHENTIC PROFILE MENU */}
            <AnimatePresence>
              {isProfileOpen && user && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-6 w-72 bg-white border-4 border-black shadow-brutal p-2 z-[120]"
                >
                  <div className="p-4 border-b-4 border-black mb-2 bg-gray-50">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Logged Intel</p>
                    <p className="font-black italic truncate text-black uppercase">{user.email.split('@')[0]}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-between p-3 font-[1000] uppercase italic text-sm hover:bg-yellow-400 border-2 border-transparent hover:border-black transition-all">
                      <div className="flex items-center gap-3"><Package size={18} /> My Stash</div>
                      <ChevronRight size={14} />
                    </Link>
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-between p-3 font-[1000] uppercase italic text-sm hover:bg-yellow-400 border-2 border-transparent hover:border-black transition-all">
                      <div className="flex items-center gap-3"><MapPin size={18} /> Delivery Intel</div>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-2 flex items-center gap-3 p-3 font-[1000] uppercase italic text-xs text-red-600 border-t-4 border-black hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Abandon Jungle
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* CART ICON */}
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
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="absolute top-full left-0 w-full bg-white border-b-8 border-black p-6 z-[100] shadow-brutal"
          >
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto relative group">
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
                  type="button"
                  onClick={() => {setSearchQuery(""); setIsSearchOpen(false)}}
                  className="p-2 border-4 border-black hover:bg-black hover:text-white transition-all mr-2"
                >
                  <X size={30} />
                </button>
              </div>
              <p className="mt-4 text-[10px] font-black uppercase italic text-gray-400">Press Enter to See All Results</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}