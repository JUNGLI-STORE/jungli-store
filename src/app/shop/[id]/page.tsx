"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, AlertTriangle, Loader2, Play, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useParams } from 'next/navigation'; 
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams(); 
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [viewMode, setViewMode] = useState<'image' | 'video'>('image');

  const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

  useEffect(() => {
    async function getProductDetails() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) getProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.jungli_price,
      image: product.image_url,
      size: selectedSize,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-jungli-orange" size={48} />
          <p className="font-black italic uppercase tracking-widest text-gray-400 animate-pulse">Scouting the area...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h1 className="text-5xl font-[1000] uppercase italic mb-4">404 - STASH EMPTY</h1>
        <p className="font-bold text-gray-500 mb-8 italic">This pair has been seized or never existed.</p>
        <Link href="/" className="bg-black text-white px-10 py-5 border-4 border-black font-black uppercase shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          Return to Base
        </Link>
      </div>
    );
  }

  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* MEDIA SECTION (Left Side) */}
          <div className="space-y-6">
            <div className="relative group border-8 border-black shadow-brutal aspect-square bg-gray-100 overflow-hidden">
              <AnimatePresence mode="wait">
                {viewMode === 'image' ? (
                  <motion.img 
                    key="image"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={product.image_url} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <motion.video 
                    key="video"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={product.video_url}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>

              {/* Video Toggle Button (Only if video exists) */}
              {product.video_url && (
                <button 
                  onClick={() => setViewMode(viewMode === 'image' ? 'video' : 'image')}
                  className="absolute bottom-6 right-6 bg-yellow-400 border-4 border-black p-4 shadow-brutal-sm hover:scale-110 transition-transform z-10"
                >
                  {viewMode === 'image' ? <Play fill="black" /> : <ImageIcon size={24} />}
                </button>
              )}

              {/* Price Tag Overlay */}
              <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-black italic -rotate-12 shadow-brutal-sm">
                -{discount}% OFF
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-4">
               <div 
                 onClick={() => setViewMode('image')}
                 className={`w-24 h-24 border-4 border-black cursor-pointer transition-all ${viewMode === 'image' ? 'shadow-brutal-sm translate-x-1' : 'opacity-50'}`}
               >
                 <img src={product.image_url} className="w-full h-full object-cover" />
               </div>
               {product.video_url && (
                 <div 
                   onClick={() => setViewMode('video')}
                   className={`w-24 h-24 border-4 border-black bg-black flex items-center justify-center cursor-pointer transition-all ${viewMode === 'video' ? 'shadow-brutal-sm translate-x-1' : 'opacity-50'}`}
                 >
                   <Play color="white" />
                 </div>
               )}
            </div>
          </div>

          {/* PRODUCT INFO (Right Side) */}
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs font-black uppercase mb-6 text-gray-400 italic">
                <Link href="/" className="hover:text-black">Vault</Link> 
                <ChevronRight size={12}/> 
                <span className="text-black underline decoration-jungli-orange">{product.name}</span>
            </nav>

            <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-[0.8] mb-6">
                {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4 mb-8">
                <span className="text-5xl font-[1000] text-black italic">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-2xl font-bold text-gray-300 line-through italic">₹{product.luxury_price.toLocaleString()}</span>
            </div>

            <div className="bg-jungli-green/5 border-l-8 border-jungli-green p-6 mb-10">
                <p className="font-bold italic text-black leading-relaxed">
                   <Info size={16} className="inline mr-2 text-jungli-green" />
                   {product.description || "Crafted with master-grade materials. This isn't just a copy; it's a re-engineered street beast."}
                </p>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <span className="font-black uppercase italic text-sm tracking-widest bg-black text-white px-2">Select Size (UK)</span>
                    <span className="text-xs font-bold underline cursor-pointer hover:text-jungli-orange">View Guide</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {sizes.map((size) => (
                        <button 
                            key={size}
                            onClick={() => { setSelectedSize(size); setShowError(false); }}
                            className={`py-5 border-4 border-black font-[1000] text-lg transition-all italic
                                ${selectedSize === size 
                                ? 'bg-jungli-orange text-white translate-x-1 translate-y-1 shadow-none' 
                                : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
                
                {showError && (
                    <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-600 font-black uppercase text-xs mt-6 flex items-center gap-2">
                        <AlertTriangle size={16}/> MISSION FAILED: SELECT A SIZE FIRST!
                    </motion.p>
                )}
            </div>

            {/* ACTION BUTTON */}
            <button 
                disabled={!product.is_available}
                onClick={handleAddToCart}
                className={`w-full text-white text-3xl font-[1000] py-8 border-4 border-black shadow-brutal transition-all uppercase italic mb-10
                    ${product.is_available 
                      ? 'bg-black hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:scale-95' 
                      : 'bg-gray-300 cursor-not-allowed grayscale shadow-none translate-x-1 translate-y-1'}`}
            >
                {product.is_available ? "Secure the Drip" : "STASH EMPTY"}
            </button>

            {/* TRUST SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10 border-t-4 border-black border-dashed">
                <div className="text-center md:text-left">
                    <Truck size={24} className="mb-2 mx-auto md:mx-0" />
                    <p className="font-black uppercase text-[10px]">Fast Pan-India</p>
                </div>
                <div className="text-center md:text-left">
                    <RotateCcw size={24} className="mb-2 mx-auto md:mx-0" />
                    <p className="font-black uppercase text-[10px]">7-Day Stash Swap</p>
                </div>
                <div className="text-center md:text-left">
                    <ShieldCheck size={24} className="mb-2 mx-auto md:mx-0" />
                    <p className="font-black uppercase text-[10px]">Double Checked</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Icon helper
function ImageIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
}