"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductAccordion from '@/components/ProductAccordion';
import RelatedSlider from '@/components/RelatedSlider';
import { 
  ChevronRight, ShieldCheck, Truck, RotateCcw, 
  AlertTriangle, Loader2, Play, Info, 
  Image as ImageIcon, Star, Quote, Lock, X, Maximize2, Bell, Zap, ShoppingCart
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
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  useEffect(() => {
    async function getProductAndReviews() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        const { data: pData, error: pError } = await supabase.from('products').select('*').eq('id', id).single();
        if (pError) throw pError;
        setProduct(pData);
        setActiveMedia({ type: 'image', url: pData.image_url });
        const { data: rData } = await supabase.from('product_reviews').select('*').eq('product_id', id).order('created_at', { ascending: false });
        if (rData) setReviews(rData);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    if (id) getProductAndReviews();
  }, [id]);

  const handleNotifyMe = async () => {
    let emailToNotify = user ? user.email : prompt("WHERE SHOULD WE SEND THE ALERT? (Enter Email)");
    if (!emailToNotify || !emailToNotify.includes('@')) return;
    setIsSubmittingNotify(true);
    const { error } = await supabase.from('restock_notifications').insert([{ email: emailToNotify, product_id: product.id, product_name: product.name }]);
    if (!error) setIsNotified(true);
    setIsSubmittingNotify(false);
  };

  const handleAddToCart = () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!selectedSize) { setShowError(true); setTimeout(() => setShowError(false), 3000); return; }
    addToCart({ id: product.id, name: product.name, price: product.jungli_price, image: product.image_url, size: selectedSize, quantity: 1 });
    setIsCartOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-jungli-orange" size={48} /></div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center"><h1 className="text-5xl font-[1000] uppercase italic mb-4">404 - STASH EMPTY</h1><Link href="/" className="bg-black text-white px-10 py-5 border-4 border-black font-black uppercase shadow-brutal">Return to Base</Link></div>;

  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);
  const gallery = product.images || [product.image_url];
  const videoUrls = product.video_urls || [];

  return (
    <>
      {/* 1. FULL SCREEN LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-white/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setIsLightboxOpen(false)}>
            <button className="absolute top-10 right-10 text-black border-4 border-black p-2"><X size={32} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={activeMedia?.url} className="max-w-full max-h-full object-contain shadow-[20px_20px_0px_#000] border-8 border-black bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuthModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} className="relative bg-white border-8 border-black p-10 max-w-sm w-full shadow-[15px_15px_0px_#FF5F1F] text-center" >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-2 border-black p-1"><X size={20} /></button>
              <div className="bg-yellow-400 w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 -mt-20 rotate-12 shadow-brutal-sm text-black"><Lock size={40} /></div>
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4 leading-none text-black">HOLD UP!<br/><span className="text-jungli-orange">ACCESS DENIED</span></h2>
              <p className="font-bold italic text-gray-500 mb-8 uppercase text-xs tracking-widest leading-relaxed">Join the jungle to secure this drip. Login to continue.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-5 border-4 border-black font-black uppercase italic shadow-brutal-sm">Go to Login —&gt;</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-white pb-40 overflow-x-hidden">
        {/* FIXED: max-w-6xl and 12-column grid to "zoom out" the layout */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT: MEDIA GALLERY (Occupies 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group border-8 border-black shadow-[10px_10px_0px_#000] aspect-square bg-white overflow-hidden cursor-pointer" onClick={() => activeMedia?.type === 'image' && setIsLightboxOpen(true)}>
              <AnimatePresence mode="wait">
                {activeMedia?.type === 'image' ? (
                  <motion.img 
                    key={activeMedia.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    src={activeMedia.url} className="w-full h-full object-contain p-8" alt=""
                    onError={(e) => {(e.target as HTMLImageElement).src = "https://placehold.co/800x800/000000/FFFFFF/png?text=STASH+LOADING"}}
                  />
                ) : (
                  <motion.video key={activeMedia?.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeMedia?.url} autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />
                )}
              </AnimatePresence>
              <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-[1000] italic -rotate-12 text-xs uppercase shadow-brutal-sm">-{discount}% OFF</div>
              {!product.is_available && <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 border-4 border-black font-[1000] italic rotate-12 text-xs uppercase shadow-brutal-sm">SOLD OUT</div>}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
               {gallery.map((img: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'image', url: img })} className={`w-16 h-16 md:w-20 md:h-20 border-4 border-black flex-shrink-0 cursor-pointer transition-all bg-gray-50 ${activeMedia?.url === img ? 'shadow-brutal-sm translate-x-1 border-jungli-orange' : 'opacity-40 grayscale'}`}><img src={img} className="w-full h-full object-contain p-1" alt="" /></div>
               ))}
               {videoUrls.map((vUrl: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'video', url: vUrl })} className={`w-16 h-16 md:w-20 md:h-20 border-4 border-black bg-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${activeMedia?.url === vUrl ? 'shadow-brutal-sm border-jungli-orange' : 'opacity-40'}`}><Play color="white" size={20} /></div>
               ))}
            </div>
          </div>

          {/* RIGHT: DETAILS SECTION (Occupies 7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase mb-4 text-gray-400 italic tracking-widest">
                <Link href="/" className="hover:text-black">Vault</Link> <ChevronRight size={10}/> <span className="text-black underline decoration-jungli-orange">{product.name}</span>
            </nav>

            <p className="text-xs font-black text-gray-400 uppercase italic mb-1 tracking-[0.2em]">{product.brand}</p>
            {/* FIXED: Balanced text size */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[1000] uppercase italic tracking-tighter leading-[0.9] mb-6 text-black">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-[1000] text-black italic tracking-tighter">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-lg font-bold text-gray-300 line-through italic">₹{product.luxury_price.toLocaleString()}</span>
            </div>

            {/* COLLAPSIBLE DESCRIPTION */}
            <div className="mt-4 border-l-4 border-jungli-orange pl-6 py-2 bg-gray-50/50 mb-8 relative">
              <p className={`font-bold italic text-black leading-tight uppercase text-[12px] ${!isDescriptionExpanded && 'line-clamp-3'}`}>{product.description}</p>
              <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-2 text-[9px] font-black uppercase underline decoration-2 hover:text-jungli-orange">{isDescriptionExpanded ? "Show Less" : "Read Story +"}</button>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <span className="font-black uppercase italic text-[10px] bg-black text-white px-2 py-0.5">Select Size (UK)</span>
                    <span className="text-[9px] font-black uppercase underline cursor-pointer hover:text-jungli-orange">Size Info</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {(product.available_sizes || []).map((size: string) => (
                        <button key={size} onClick={() => { setSelectedSize(size); setShowError(false); }} className={`py-4 border-4 border-black font-[1000] text-base transition-all italic ${selectedSize === size ? 'bg-jungli-orange text-white translate-x-1 shadow-none' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}>{size}</button>
                    ))}
                </div>
                {showError && <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-600 font-black uppercase text-[10px] mt-4 flex items-center gap-2"><AlertTriangle size={14}/> CHOOSE SIZE</motion.p>}
            </div>

            {/* DYNAMIC ACTION BUTTON */}
            {product.is_available ? (
                <button onClick={handleAddToCart} className="w-full text-white text-2xl font-[1000] py-6 border-4 border-black shadow-brutal transition-all uppercase italic mb-8 bg-black active:scale-95 flex items-center justify-center gap-4">
                    <ShoppingCart size={24} /> BUY NOW
                </button>
            ) : (
                <button onClick={handleNotifyMe} disabled={isNotified || isSubmittingNotify} className={`w-full py-6 border-4 border-black font-[1000] text-2xl uppercase italic mb-8 shadow-brutal transition-all flex items-center justify-center gap-4 ${isNotified ? 'bg-green-500 text-black shadow-none' : 'bg-white text-black hover:bg-black hover:text-white'}`}>
                    {isSubmittingNotify ? <Loader2 className="animate-spin" /> : <><motion.div animate={isNotified ? { rotate: [0, 20, -20, 0] } : {}}><Bell fill={isNotified ? "black" : "none"} /></motion.div>{isNotified ? "STASH ALERT SET!" : "NOTIFY ME"}</>}
                </button>
            )}

            <ProductAccordion product={product} />
          </div>
        </div>

        {/* 3. INFINITE SLIDER (Matches Page Width) */}
        <RelatedSlider currentProductId={product.id} />
      </main>
    </>
  );
}