"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, X, Package, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // 1. SCROLL STATES
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  
  // 2. LOGIC TO HIDE/SHOW ON SCROLL
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true); // Scrolling down - Hide
    } else {
      setHidden(false); // Scrolling up - Show
    }
  });

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
    <motion.header 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="sticky top-0 z-[100] w-full"
    >
      {/* MAIN NAVBAR - Using grid-cols-3 to force logo to the center */}
      <nav className="relative z-[110] bg-white border-b-4 border-black px-4 md:px-8 py-4 grid grid-cols-3 items-center shadow-brutal-sm">
        
        {/* LEFT COLUMN: Empty space (or menu icon if needed later) */}
        <div className="flex justify-start">
           {/* Placeholder to balance the centered logo */}
        </div>

        {/* MIDDLE COLUMN: Centered Brand Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <motion.div whileHover={{ scale: 1.05, rotate: -2 }} className="cursor-pointer">
              <Image 
                src="/logo.svg" 
                alt="JUNGLI" 
                width={150} 
                height={35}
                style={{ width: 'auto', height: '35px' }} 
                priority 
              />
            </motion.div>
          </Link>
        </div>

        {/* RIGHT COLUMN: Icons Area */}
        <div className="flex items-center justify-end gap-3 md:gap-6">
          <Search 
            size={22} 
            className={`cursor-pointer transition-colors hover:text-jungli-orange ${isSearchOpen ? 'text-jungli-orange' : 'text-black'}`} 
            onClick={() => { setIsSearchOpen(!isSearchOpen); setIsProfileOpen(false); }}
          />
          
          <div className="relative">
            <User 
              size={22} 
              className={`cursor-pointer transition-colors ${user ? 'text-jungli-orange' : 'text-black hover:text-jungli-orange'}`} 
              onClick={() => {
                if(!user) router.push('/login');
                else setIsProfileOpen(!isProfileOpen);
                setIsSearchOpen(false);
              }}
            />

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
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-full left-0 w-full bg-white border-b-4 border-black p-4 z-[100] shadow-[0_10px_0_0_#000]"
          >
            <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex items-center gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 transition-transform group-focus-within:translate-x-0 group-focus-within:translate-y-0"></div>
                <div className="relative flex items-center bg-white border-2 border-black px-4 py-2">
                  <Search className="text-black/30 group-focus-within:text-jungli-orange transition-colors" size={20} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="HUNT FOR DRIP..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-1 font-bold uppercase italic text-lg md:text-2xl outline-none placeholder:text-gray-200"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-gray-100 transition-colors"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}