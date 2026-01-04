"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductAccordion from '@/components/ProductAccordion'; // Ensure this file is updated!
import { 
  ChevronRight, ShieldCheck, Truck, RotateCcw, 
  AlertTriangle, Loader2, Play, Info, 
  Image as ImageIcon, Star, Quote, Lock, X
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation'; 
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams(); 
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  useEffect(() => {
    async function getProductAndReviews() {
      try {
        const { data: pData, error: pError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (pError) throw pError;
        setProduct(pData);
        setActiveMedia({ type: 'image', url: pData.image_url });

        const { data: rData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (rData) setReviews(rData);
      } catch (err) {
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) getProductAndReviews();
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
    setIsCartOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-jungli-orange" size={48} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-5xl font-[1000] uppercase italic mb-4">404 - STASH EMPTY</h1>
      <Link href="/" className="bg-black text-white px-10 py-5 border-4 border-black font-black uppercase shadow-brutal">Return to Base</Link>
    </div>
  );

  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);
  const gallery = product.images || [product.image_url];
  const videos = product.video_urls || [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-40">
        <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT: MEDIA GALLERY (MULTI-IMAGE & VIDEO) */}
          <div className="space-y-6">
            <div className="relative group border-8 border-black shadow-brutal aspect-square bg-gray-100 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeMedia?.type === 'image' ? (
                  <motion.img 
                    key={activeMedia.url}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    src={activeMedia.url} className="w-full h-full object-cover" alt=""
                  />
                ) : (
                  <motion.video 
                    key={activeMedia?.url}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    src={activeMedia?.url} autoPlay loop muted playsInline className="w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>
              <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-black italic -rotate-12 shadow-brutal-sm text-sm">
                -{discount}% OFF
              </div>
            </div>

            {/* THUMBNAILS TRACK */}
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
               {gallery.map((img: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'image', url: img })}
                   className={`w-24 h-24 border-4 border-black flex-shrink-0 cursor-pointer transition-all
                     ${activeMedia?.url === img ? 'shadow-brutal-sm translate-x-1 translate-y-1' : 'opacity-40 grayscale hover:opacity-100'}`}>
                   <img src={img} className="w-full h-full object-cover" alt="" />
                 </div>
               ))}
               {videos.map((vUrl: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'video', url: vUrl })}
                   className={`w-24 h-24 border-4 border-black bg-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all
                     ${activeMedia?.url === vUrl ? 'shadow-brutal-sm translate-x-1 translate-y-1' : 'opacity-40'}`}>
                   <Play color="white" size={24} />
                 </div>
               ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & PURCHASE */}
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase mb-6 text-gray-400 italic tracking-widest">
                <Link href="/" className="hover:text-black">Vault</Link> <ChevronRight size={10}/> 
                <span className="text-black underline decoration-jungli-orange">{product.name}</span>
            </nav>

            {/* Brand & Model Logic for Long Names */}
            <p className="text-sm font-black text-gray-400 uppercase italic mb-2 tracking-[0.2em]">{product.brand}</p>
            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-[1000] uppercase italic tracking-tighter leading-[0.8] mb-8 text-black">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4 mb-10">
                <span className="text-5xl font-[1000] text-black italic tracking-tighter">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-2xl font-bold text-gray-300 line-through italic">₹{product.luxury_price.toLocaleString()}</span>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <span className="font-black uppercase italic text-xs bg-black text-white px-2 py-0.5 tracking-widest">Select Size (UK)</span>
                    <span className="text-[10px] font-black uppercase underline cursor-pointer hover:text-jungli-orange">Size Info</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {(product.available_sizes || []).map((size: string) => (
                        <button key={size} onClick={() => { setSelectedSize(size); setShowError(false); }}
                            className={`py-5 border-4 border-black font-[1000] text-lg transition-all italic
                                ${selectedSize === size ? 'bg-jungli-orange text-white translate-x-1 shadow-none' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}>
                            {size}
                        </button>
                    ))}
                </div>
                {showError && (
                    <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-600 font-black uppercase text-[10px] mt-6 flex items-center gap-2">
                        <AlertTriangle size={14}/> CHOOSE A SIZE TO PROCEED
                    </motion.p>
                )}
            </div>

            <button disabled={!product.is_available} onClick={handleAddToCart}
                className={`w-full text-white text-3xl font-[1000] py-8 border-4 border-black shadow-brutal transition-all uppercase italic mb-4
                    ${product.is_available ? 'bg-black hover:shadow-none hover:translate-x-2' : 'bg-gray-300 grayscale'}`}>
                {product.is_available ? "Secure the Drip" : "STASH EMPTY"}
            </button>

            {/* DYNAMIC ACCORDION (Size Chart & Materials) */}
            <ProductAccordion product={product} />

            {/* MINI TRUST BAR */}
            <div className="grid grid-cols-3 gap-4 py-8 border-t-2 border-dashed border-gray-200 mt-4 opacity-50">
               <div className="flex flex-col items-center"><Truck size={18}/><p className="text-[8px] font-black uppercase mt-1">FAST PAN-INDIA</p></div>
               <div className="flex flex-col items-center"><RotateCcw size={18}/><p className="text-[8px] font-black uppercase mt-1">7-DAY SWAP</p></div>
               <div className="flex flex-col items-center"><ShieldCheck size={18}/><p className="text-[8px] font-black uppercase mt-1">MASTER QUALITY</p></div>
            </div>
          </div>
        </div>

        {/* THE REAL TEXTURE (Video Section) */}
        {videos.length > 0 && (
          <section className="mt-40 bg-black text-white py-24 border-y-8 border-black">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-5xl md:text-8xl font-[1000] uppercase italic tracking-tighter mb-16 leading-none">
                THE REAL <br/><span className="text-jungli-orange italic">TEXTURE.</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {videos.map((vUrl: string, idx: number) => (
                  <div key={idx} className="border-8 border-white shadow-[15px_15px_0px_#FF5F1F] aspect-video bg-gray-900 overflow-hidden group">
                    <video src={vUrl} controls loop muted className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HUNT REPORTS (Reviews) */}
        {reviews.length > 0 && (
          <section className="mt-40 max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <h2 className="text-5xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none">
                 HUNT <span className="text-jungli-orange">REPORTS.</span>
               </h2>
               <div className="bg-yellow-400 border-4 border-black p-4 rotate-2 shadow-brutal-sm">
                  <p className="font-black italic uppercase text-sm">Verified Social Proof</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {reviews.map((rev) => (
                 <div key={rev.id} className="bg-white border-4 border-black p-8 shadow-brutal flex flex-col hover:translate-y-[-4px] transition-transform">
                    <div className="flex gap-1 mb-6">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} size={18} fill="black" strokeWidth={0} />)}
                    </div>
                    
                    <Quote className="text-gray-100 mb-[-20px] ml-[-10px] opacity-50" size={40} />
                    <p className="font-bold italic text-xl text-black relative z-10 leading-tight mb-8">
                      "{rev.message}"
                    </p>

                    {rev.media_urls?.[0] && (
                      <div className="mt-auto mb-6 border-2 border-black rotate-1 overflow-hidden shadow-brutal-sm bg-gray-100">
                        <img src={rev.media_urls[0]} className="w-full h-auto" alt="Review Proof" />
                      </div>
                    )}

                    <div className="mt-auto flex items-center gap-4 border-t-2 border-dashed border-gray-200 pt-6">
                      <div className="w-10 h-10 bg-jungli-orange border-2 border-black rounded-full flex items-center justify-center font-black text-white italic">
                        {rev.customer_name[0]}
                      </div>
                      <div>
                        <p className="font-black uppercase text-[10px] italic">{rev.customer_name}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Verified Hunter</p>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </section>
        )}
      </main>
    </>
  );
}