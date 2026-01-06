"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductAccordion from '@/components/ProductAccordion';
import RelatedSlider from '@/components/RelatedSlider';
import { 
  ChevronRight, ShieldCheck, Truck, RotateCcw, 
  AlertTriangle, Loader2, Play, Info, 
  Image as ImageIcon, Star, Quote, Lock, X, Maximize2 
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  useEffect(() => {
    async function getProductAndReviews() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

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
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) getProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
        setShowAuthModal(true);
        return;
    }
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

  // --- 1. THE GUARDS (Must come before using 'product' variables) ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-jungli-orange" size={48} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-5xl font-[1000] uppercase italic mb-4 text-black">404 - STASH EMPTY</h1>
      <Link href="/" className="bg-black text-white px-10 py-5 border-4 border-black font-black uppercase shadow-brutal">Return to Base</Link>
    </div>
  );

  // --- 2. SAFE ZONE (Product is guaranteed to exist here) ---
  const sizes = product.available_sizes || []; 
  const gallery = product.images || [product.image_url];
  const videoUrls = product.video_urls || [];
  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);

  return (
    <>
      {/* NAVBAR removed - handled by layout.tsx */}

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="absolute top-10 right-10 text-white hover:text-jungli-orange"><X size={48} /></button>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={activeMedia?.url} className="max-w-full max-h-full object-contain shadow-2xl border-4 border-white bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACCESS DENIED MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuthModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} className="relative bg-white border-8 border-black p-10 max-w-sm w-full shadow-[15px_15px_0px_#FF5F1F] text-center" >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-2 border-black p-1 hover:bg-black hover:text-white">
                <X size={20} />
              </button>
              <div className="bg-yellow-400 w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 -mt-20 rotate-12 shadow-brutal-sm text-black">
                <Lock size={40} />
              </div>
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4 leading-none text-black text-center">HOLD UP!<br/><span className="text-jungli-orange">ACCESS DENIED</span></h2>
              <p className="font-bold italic text-gray-500 mb-8 uppercase text-xs tracking-widest text-center leading-relaxed">Join the jungle to secure this drip. Login to continue your hunt.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-5 border-4 border-black font-black uppercase shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 transition-all">Go to Login —&gt;</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-white pb-40">
        <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* MEDIA GALLERY */}
          <div className="space-y-6">
            <div 
              className="relative group border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] aspect-square bg-white overflow-hidden cursor-pointer"
              onClick={() => activeMedia?.type === 'image' && setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                {activeMedia?.type === 'image' ? (
                  <motion.img 
                    key={activeMedia.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={activeMedia.url} className="w-full h-full object-contain p-6" alt={product.name}
                    onError={(e) => {(e.target as HTMLImageElement).src = "https://placehold.co/800x800/000000/FFFFFF/png?text=STASH+LOADING"}}
                  />
                ) : (
                  <motion.video key={activeMedia?.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeMedia?.url} autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />
                )}
              </AnimatePresence>
              <div className="absolute bottom-4 right-4 bg-black/5 text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={18} /></div>
              <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-black italic -rotate-12 shadow-brutal-sm text-xs pointer-events-none uppercase">-{discount}% OFF</div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
               {gallery.map((img: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'image', url: img })}
                   className={`w-24 h-24 border-4 border-black flex-shrink-0 cursor-pointer transition-all bg-gray-50 ${activeMedia?.url === img ? 'shadow-brutal-sm translate-x-1 translate-y-1 opacity-100' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                   <img src={img} className="w-full h-full object-contain" alt="" />
                 </div>
               ))}
               {videoUrls.map((vUrl: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'video', url: vUrl })}
                   className={`w-24 h-24 border-4 border-black bg-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${activeMedia?.url === vUrl ? 'shadow-brutal-sm translate-x-1 translate-y-1' : 'opacity-40'}`}>
                   <Play color="white" size={24} />
                 </div>
               ))}
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase mb-6 text-gray-400 italic tracking-widest">
                <Link href="/" className="hover:text-black">Vault</Link> <ChevronRight size={10}/> <span className="text-black underline decoration-jungli-orange">{product.name}</span>
            </nav>

            <p className="text-sm font-black text-gray-400 uppercase italic mb-2 tracking-[0.2em]">{product.brand}</p>
            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-[1000] uppercase italic tracking-tighter leading-[0.8] mb-8 text-black">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-10">
                <span className="text-5xl font-[1000] text-black italic tracking-tighter">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-2xl font-bold text-gray-300 line-through italic">₹{product.luxury_price.toLocaleString()}</span>
            </div>

            <div className="mt-4 border-l-8 border-jungli-orange pl-6 py-2 bg-gray-50/50 mb-10">
              <p className={`font-bold italic text-black leading-tight uppercase text-sm ${!isDescriptionExpanded && 'line-clamp-3'}`}>
                {product.description || "The highest-tier materials, re-engineered street beast. Secure your pair before the stash runs dry."}
              </p>
              <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-3 text-xs font-black uppercase underline decoration-2 hover:text-jungli-orange transition-colors">
                {isDescriptionExpanded ? "Show Less —" : "Read Full Story +"}
              </button>
            </div>

            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <span className="font-black uppercase italic text-xs bg-black text-white px-2 py-0.5 tracking-widest">Select Size (UK)</span>
                    <span className="text-[10px] font-black uppercase underline cursor-pointer hover:text-jungli-orange">Size Info</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {sizes.map((size: string) => (
                        <button key={size} onClick={() => { setSelectedSize(size); setShowError(false); }}
                            className={`py-5 border-4 border-black font-[1000] text-lg transition-all italic ${selectedSize === size ? 'bg-jungli-orange text-white translate-x-1 shadow-none' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}>
                            {size}
                        </button>
                    ))}
                </div>
                {showError && <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-600 font-black uppercase text-[10px] mt-6 flex items-center gap-2"><AlertTriangle size={14}/> CHOOSE A SIZE TO PROCEED</motion.p>}
            </div>

            <button disabled={!product.is_available} onClick={handleAddToCart}
                className={`w-full text-white text-3xl font-[1000] py-8 border-4 border-black shadow-brutal transition-all uppercase italic mb-8 ${product.is_available ? 'bg-black hover:shadow-none hover:translate-x-2' : 'bg-gray-300 grayscale shadow-none'}`}>
                {product.is_available ? "Secure the Drip" : "STASH EMPTY"}
            </button>

            <ProductAccordion product={product} />
          </div>
        </div>

        <RelatedSlider currentProductId={product.id} />

        {/* VIDEOS */}
        {videoUrls.length > 0 && (
          <section className="mt-24 bg-black text-white py-24 border-y-8 border-black">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-5xl md:text-8xl font-[1000] uppercase italic tracking-tighter mb-16 leading-none">THE REAL <br/><span className="text-jungli-orange italic">TEXTURE.</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {videoUrls.map((vUrl: string, idx: number) => (
                  <div key={idx} className="border-8 border-white shadow-[15px_15px_0px_#FF5F1F] aspect-video bg-gray-900 overflow-hidden group">
                    <video src={vUrl} controls loop muted className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <section className="mt-40 max-w-7xl mx-auto px-6">
             <h2 className="text-5xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none mb-16">HUNT <span className="text-jungli-orange">REPORTS.</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {reviews.map((rev) => (
                 <div key={rev.id} className="bg-white border-4 border-black p-8 shadow-brutal flex flex-col hover:translate-y-[-4px] transition-transform">
                    <div className="flex gap-1 mb-6">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} size={18} fill="black" strokeWidth={0} />)}
                    </div>
                    <Quote className="text-gray-100 mb-[-20px] ml-[-10px] opacity-50" size={40} />
                    <p className="font-bold italic text-xl text-black relative z-10 leading-tight mb-8">"{rev.message}"</p>
                    <div className="mt-auto flex items-center gap-4 border-t-2 border-dashed border-gray-200 pt-6">
                      <div className="w-10 h-10 bg-jungli-orange border-2 border-black rounded-full flex items-center justify-center font-black text-white italic">{rev.customer_name[0]}</div>
                      <div>
                        <p className="font-black uppercase text-[10px] italic">{rev.customer_name}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase">Verified Hunter</p>
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