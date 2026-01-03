"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, AlertTriangle, Loader2, Play, Info, Image as ImageIcon } from 'lucide-react';
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
  
  // 1. New State for the Main Image in the Gallery
  const [activeImage, setActiveImage] = useState<string | null>(null);

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
        // Set the first image as the default active image
        setActiveImage(data.image_url);
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

  const sizes = product.available_sizes || []; 
  const gallery = product.images || [product.image_url]; // Fallback to main image if array is empty
  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT SIDE: MULTI-IMAGE GALLERY */}
          <div className="space-y-6">
            <div className="relative group border-8 border-black shadow-brutal aspect-square bg-gray-100 overflow-hidden">
              <AnimatePresence mode="wait">
                {viewMode === 'image' ? (
                  <motion.img 
                    key={activeImage} // Key ensures animation plays on image swap
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    src={activeImage || product.image_url} 
                    className="w-full h-full object-cover"
                    alt={product.name}
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

              {/* Video Toggle Badge */}
              {product.video_url && (
                <button 
                  onClick={() => setViewMode(viewMode === 'image' ? 'video' : 'image')}
                  className="absolute bottom-6 right-6 bg-yellow-400 border-4 border-black p-4 shadow-brutal-sm hover:scale-110 active:scale-95 transition-all z-10"
                >
                  {viewMode === 'image' ? <Play fill="black" size={24} /> : <ImageIcon size={24} />}
                </button>
              )}

              {/* Discount Tag */}
              <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-black italic -rotate-12 shadow-brutal-sm">
                -{discount}% OFF
              </div>
            </div>

            {/* THUMBNAIL TRACK */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
               {gallery.map((img: string, idx: number) => (
                 <div 
                   key={idx}
                   onClick={() => { setActiveImage(img); setViewMode('image'); }}
                   className={`w-24 h-24 border-4 border-black flex-shrink-0 cursor-pointer transition-all bg-white
                     ${activeImage === img && viewMode === 'image' 
                        ? 'shadow-brutal-sm translate-x-1 translate-y-1' 
                        : 'opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`}
                 >
                   <img src={img} className="w-full h-full object-cover" alt={`view-${idx}`} />
                 </div>
               ))}
               
               {/* Video Thumbnail (If video exists) */}
               {product.video_url && (
                 <div 
                   onClick={() => setViewMode('video')}
                   className={`w-24 h-24 border-4 border-black bg-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all
                     ${viewMode === 'video' ? 'shadow-brutal-sm translate-x-1 translate-y-1' : 'opacity-40 hover:opacity-100'}`}
                 >
                   <Play color="white" size={24} />
                 </div>
               )}
            </div>
          </div>

          {/* RIGHT SIDE: PRODUCT DETAILS */}
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
                
                {sizes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                        {sizes.map((size: string) => (
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
                ) : (
                    <div className="p-4 border-4 border-black bg-red-50 text-red-600 font-black italic uppercase">
                        Out of Stash
                    </div>
                )}
                
                {showError && (
                    <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-600 font-black uppercase text-xs mt-6 flex items-center gap-2">
                        <AlertTriangle size={16}/> ERROR: SELECT A SIZE TO PROCEED!
                    </motion.p>
                )}
            </div>

            {/* ACTION BUTTON */}
            <button 
                disabled={!product.is_available || sizes.length === 0}
                onClick={handleAddToCart}
                className={`w-full text-white text-3xl font-[1000] py-8 border-4 border-black shadow-brutal transition-all uppercase italic mb-10
                    ${(product.is_available && sizes.length > 0)
                      ? 'bg-black hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:scale-95' 
                      : 'bg-gray-300 cursor-not-allowed grayscale shadow-none translate-x-1 translate-y-1'}`}
            >
                {product.is_available && sizes.length > 0 ? "Secure the Drip" : "STASH EMPTY"}
            </button>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-t-4 border-black border-dashed">
                <div className="flex flex-col items-center md:items-start">
                    <Truck size={24} className="mb-2" />
                    <p className="font-black uppercase text-[10px] italic">Express Pan-India</p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                    <RotateCcw size={24} className="mb-2" />
                    <p className="font-black uppercase text-[10px] italic">7-Day Swap Policy</p>
                </div>
                <div className="flex flex-col items-center md:items-start">
                    <ShieldCheck size={24} className="mb-2" />
                    <p className="font-black uppercase text-[10px] italic">Verified Quality</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}