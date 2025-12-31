"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, CartItem } from '@/context/CartContext'; // Ensure CartItem is exported from your context
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; // 1. Added for redirection

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, totalPrice } = useCart();
  const router = useRouter(); // 2. Initialize router

  // 3. Logic to handle the transition to checkout
  const handleCheckout = () => {
    setIsCartOpen(false); // Close cart sidebar first
    router.push('/checkout'); // Redirect to checkout page
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] border-l-8 border-black p-6 flex flex-col shadow-[-10px_0_0_0_rgba(0,0,0,1)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter text-black">Your Bag</h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 border-2 border-black hover:bg-jungli-orange hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-20">
                    <p className="font-black italic text-gray-300 text-2xl uppercase">Empty Stash</p>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="mt-4 text-jungli-orange font-black underline uppercase italic"
                    >
                        Go find some drip
                    </button>
                </div>
              ) : (
                cart.map((item: CartItem) => (
                  <div key={item.id + item.size} className="flex gap-4 border-2 border-black p-3 relative group bg-white shadow-brutal-sm">
                    <div className="w-24 h-24 bg-gray-100 border-2 border-black flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-[1000] uppercase text-sm italic leading-tight">{item.name}</h4>
                      <p className="text-[10px] font-black text-gray-500 uppercase italic mt-1 bg-gray-100 inline-block px-1">Size: {item.size}</p>
                      <p className="font-black text-jungli-orange mt-2 text-lg italic">₹{item.price.toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={() => removeFromCart(item.id, item.size)} 
                        className="text-gray-400 hover:text-red-600 self-start p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="pt-6 border-t-4 border-black mt-auto bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-black uppercase italic text-xl">Total</span>
                  <span className="text-3xl font-[1000] tracking-tighter text-black italic">₹{totalPrice.toLocaleString()}</span>
                </div>
                
                {/* 4. Updated Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-jungli-orange text-white font-[1000] py-5 border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase italic flex items-center justify-center gap-3 group active:scale-95"
                >
                  Checkout Now 
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}