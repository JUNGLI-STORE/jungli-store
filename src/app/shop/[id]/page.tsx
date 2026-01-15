"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductAccordion from '@/components/ProductAccordion';
import RelatedSlider from '@/components/RelatedSlider';
import { 
  ChevronRight, ShieldCheck, Truck, RotateCcw, 
  AlertTriangle, Loader2, Play, Info, 
  Image as ImageIcon, Star, Quote, Lock, X, Maximize2, Bell, Zap, ShoppingCart, MessageCircle, Phone 
} from 'lucide-react'; // Added Phone
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation'; 
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams(); 
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  
  // DATA STATES
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // UI STATES
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  // NOTIFICATION STATES
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  useEffect(() => {
    async function getProductAndReviews() {
      try {
        // 1. Auth Status check
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        // 2. Fetch Product Details
        const { data: pData, error: pError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (pError) throw pError;
        setProduct(pData);
        setActiveMedia({ type: 'image', url: pData.image_url });

        // 3. Fetch Linked Reviews
        const { data: rData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (rData) setReviews(rData);

      } catch (err) {
        console.error("Stash Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) getProductAndReviews();
  }, [id]);

  // --- AUTOMATED RESTOCK NOTIFICATION ---
  const handleNotifyMe = async () => {
    let emailToNotify = "";

    if (!user) {
      const guestEmail = prompt("WHERE SHOULD WE SEND THE ALERT? (Enter Email)");
      if (!guestEmail || !guestEmail.includes('@')) {
        alert("VALID EMAIL REQUIRED TO TRACK STASH!");
        return;
      }
      emailToNotify = guestEmail;
    } else {
      emailToNotify = user.email;
    }

    setIsSubmittingNotify(true);
    const { error } = await supabase.from('restock_notifications').insert([{ 
      email: emailToNotify, 
      product_id: product.id, 
      product_name: product.name 
    }]);

    if (!error) {
      setIsNotified(true);
    } else {
      alert("ALREADY ON THE WAITLIST!");
    }
    setIsSubmittingNotify(false);
  };

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-jungli-orange" size={48} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-5xl font-[1000] uppercase italic mb-4">404 - STASH EMPTY</h1>
      <Link href="/" className="bg-black text-white px-10 py-5 border-4 border-black font-black uppercase shadow-brutal active:scale-95 transition-all">Return to Base</Link>
    </div>
  );

  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);
  const gallery = product.images || [product.image_url];
  const videoUrls = product.video_urls || [];

  return (
    <>
      {/* 1. FULL SCREEN LIGHTBOX (MODAL) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="absolute top-10 right-10 text-black border-4 border-black p-2 hover:bg-black hover:text-white transition-all"><X size={32} /></button>
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} 
              src={activeMedia?.url} 
              className="max-w-full max-h-full object-contain shadow-[20px_20px_0px_#000] border-8 border-black bg-white" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ACCESS DENIED MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuthModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} className="relative bg-white border-8 border-black p-10 max-w-sm w-full shadow-[15px_15px_0px_#FF5F1F] text-center" >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-2 border-black p-1"><X size={20} /></button>
              <div className="bg-yellow-400 w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 -mt-20 rotate-12 shadow-brutal-sm text-black"><Lock size={40} /></div>
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4 text-black">HOLD UP!<br/><span className="text-jungli-orange">ACCESS DENIED</span></h2>
              <p className="font-bold italic text-gray-500 mb-8 uppercase text-xs tracking-widest text-center leading-relaxed">Join the jungle to secure this pair. Login to continue your hunt.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-5 border-4 border-black font-black uppercase shadow-brutal-sm">Go to Login —&gt;</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-white pb-40 overflow-x-hidden">
        {/* BOUTIQUE GRID: 12 Columns, Max width 6xl */}
        <div className="max-w-6xl mx-auto px-4 md:px-12 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* --- LEFT COLUMN: MEDIA GALLERY & DESCRIPTION (LHS UTILIZATION) --- */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <div 
                className="relative group border-8 border-black shadow-[10px_10px_0px_#000] aspect-square bg-white overflow-hidden cursor-pointer"
                onClick={() => activeMedia?.type === 'image' && setIsLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  {activeMedia?.type === 'image' ? (
                    <motion.img 
                      key={activeMedia.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={activeMedia.url} 
                      className="w-full h-full object-contain p-8"
                      alt=""
                      onError={(e) => {(e.target as HTMLImageElement).src = "https://placehold.co/800x800/000000/FFFFFF/png?text=STASH+LOADING"}}
                    />
                  ) : (
                    <motion.video key={activeMedia?.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeMedia?.url} autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />
                  )}
                </AnimatePresence>
                
                <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-[1000] italic -rotate-12 shadow-brutal-sm text-xs uppercase tracking-tight">-{discount}% OFF</div>
                {!product.is_available && <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 border-4 border-black font-[1000] italic rotate-12 shadow-brutal-sm text-xs uppercase">SOLD OUT</div>}
                
                <div className="absolute bottom-6 right-6 bg-white border-4 border-black text-black p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={24} />
                </div>
            </div>

              {/* THUMBNAILS TRACK */}
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                 {gallery.map((img: string, idx: number) => (
                   <div key={idx} onClick={() => {setActiveMedia({ type: 'image', url: img }); setIsLightboxOpen(false)}} 
                     className={`w-16 h-16 md:w-20 md:h-20 border-4 border-black flex-shrink-0 cursor-pointer transition-all bg-gray-50 ${activeMedia?.url === img ? 'shadow-brutal-sm translate-x-1 border-jungli-orange opacity-100' : 'opacity-40 grayscale hover:opacity-100'}`}>
                     <img src={img} className="w-full h-full object-contain p-1" alt="" />
                   </div>
                 ))}
                 {videoUrls.map((vUrl: string, idx: number) => (
                   <div key={idx} onClick={() => setActiveMedia({ type: 'video', url: vUrl })} 
                     className={`w-16 h-16 md:w-20 md:h-20 border-4 border-black bg-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${activeMedia?.url === vUrl ? 'shadow-brutal-sm border-jungli-orange' : 'opacity-40'}`}>
                     <Play color="white" size={20} />
                   </div>
                 ))}
              </div>
            </div>

            {/* ✅ DESKTOP ACCORDION */}
            <div className="hidden lg:block">
               <ProductAccordion product={product} />
            </div>
          </div>

          {/* --- RIGHT COLUMN: PRODUCT INFO & ACTION --- */}
          <div className="lg:col-span-7 flex flex-col">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase mb-4 text-gray-400 italic tracking-widest">
                <Link href="/" className="hover:text-black">Vault</Link> <ChevronRight size={10}/> <span className="text-black underline decoration-jungli-orange">{product.name}</span>
            </nav>

            <p className="text-xs font-black text-gray-400 uppercase italic mb-1 tracking-[0.2em]">{product.brand}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-[1000] uppercase italic tracking-tighter leading-[0.85] mb-6 text-black">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl md:text-5xl font-[1000] text-black italic tracking-tighter leading-none">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-xl font-bold text-gray-300 line-through italic opacity-50">₹{product.luxury_price.toLocaleString()}</span>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                    <span className="font-black uppercase italic text-[10px] bg-black text-white px-2 py-0.5 tracking-widest leading-none">Select Size (UK)</span>
                    <span className="text-[9px] font-black uppercase underline cursor-pointer hover:text-jungli-orange transition-colors">Size Info</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {(product.available_sizes || []).map((size: string) => (
                        <button key={size} onClick={() => { setSelectedSize(size); setShowError(false); }} className={`py-4 border-4 border-black font-[1000] text-lg transition-all italic ${selectedSize === size ? 'bg-jungli-orange text-white translate-x-1 shadow-none' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}>{size}</button>
                    ))}
                </div>
                {showError && <motion.p initial={{ x: -10 }} animate={{ x: 0 }} className="text-red-600 font-black uppercase text-[10px] mt-4 flex items-center gap-2"><AlertTriangle size={14}/> CHOOSE SIZE TO PROCEED</motion.p>}
            </div>

            {/* --- CUSTOM ORDER / HELP BOX (WhatsApp Integrated) --- */}
            <div className="mb-8 border-4 border-black border-dashed p-5 bg-yellow-50 relative group">
                {/* STICKER: COMPOSITE ICON */}
                <div className="absolute -top-3 -right-3 bg-[#25D366] text-white p-2 border-2 border-black rotate-12 shadow-brutal-sm">
                    <div className="relative flex items-center justify-center w-6 h-6">
                        <MessageCircle size={24} strokeWidth={1.5} className="mb-0.5" />
                        <Phone size={10} className="absolute mb-[1px] ml-[1px] fill-current" strokeWidth={2.5} />
                    </div>
                </div>
                
                <h4 className="font-[1000] uppercase italic text-xl mb-2 flex items-center gap-2">
                    WHAT'S IN YOUR MIND?
                </h4>
                <p className="font-bold text-[10px] uppercase text-gray-600 leading-relaxed mb-4">
                    Hunting for a different colorway? Can't find a rare design? Need a bulk order for your squad? 
                    The Jungle has deep connections. Tell us what you need.
                </p>
                <a 
                    href={`https://wa.me/919713524844?text=Hey Jungli Team, regarding ${product.name} (ID: ${product.id}): I have a custom query...`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-black font-[1000] py-3 border-2 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase italic text-xs hover:bg-white"
                >
                    {/* BUTTON ICON: COMPOSITE ICON */}
                    <div className="relative flex items-center justify-center w-5 h-5">
                        <MessageCircle size={20} strokeWidth={1.5} className="mb-0.5" />
                        <Phone size={8} className="absolute mb-[1px] ml-[1px] fill-current" strokeWidth={2.5} />
                    </div>
                    Chat directly on WhatsApp
                </a>
            </div>

            {/* ACTION BUTTON (Dynamic BUY vs NOTIFY) */}
            {product.is_available ? (
                <button onClick={handleAddToCart} className="w-full text-white text-3xl font-[1000] py-8 border-4 border-black shadow-brutal transition-all uppercase italic mb-8 bg-black active:scale-95 flex items-center justify-center gap-4 group">
                    <ShoppingCart size={24} className="group-hover:translate-y-[-2px] transition-transform" /> BUY NOW
                </button>
            ) : (
                <button 
                  onClick={handleNotifyMe} 
                  disabled={isNotified || isSubmittingNotify} 
                  className={`w-full py-8 border-4 border-black font-[1000] text-3xl uppercase italic mb-8 shadow-brutal transition-all flex items-center justify-center gap-4 ${isNotified ? 'bg-green-500 text-black shadow-none translate-x-1' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                >
                    {isSubmittingNotify ? <Loader2 className="animate-spin" /> : <>
                      <motion.div animate={isNotified ? { rotate: [0, 20, -20, 20, -20, 0] } : {}} transition={{ duration: 0.5 }}>
                        <Bell fill={isNotified ? "black" : "none"} size={32} />
                      </motion.div>
                      {isNotified ? "STASH ALERT SET!" : "NOTIFY ME"}
                    </>}
                </button>
            )}

            {/* MOBILE ACCORDION (Hidden on Desktop) */}
            <div className="lg:hidden mt-8">
               <ProductAccordion product={product} />
            </div>

            {/* TRUST BAR */}
            <div className="grid grid-cols-3 gap-4 py-8 border-t-2 border-dashed border-gray-200 mt-auto opacity-40">
               <div className="flex flex-col items-center"><Truck size={18}/><p className="text-[8px] font-black uppercase mt-1">FAST PAN-INDIA</p></div>
               <div className="flex flex-col items-center"><RotateCcw size={18}/><p className="text-[8px] font-black uppercase mt-1">7-DAY SWAP</p></div>
               <div className="flex flex-col items-center"><ShieldCheck size={18}/><p className="text-[8px] font-black uppercase mt-1">MASTER QUALITY</p></div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SLIDER */}
        <div className="mt-20">
          <RelatedSlider currentProductId={product.id} />
        </div>
      </main>
    </>
  );
}