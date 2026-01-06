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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  // NOTIFICATION STATES
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

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
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) getProductAndReviews();
  }, [id]);

  // --- AUTOMATED RESTOCK LOGIC ---
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
      product_name: product.name,
      notified: false
    }]);

    if (!error) {
      setIsNotified(true);
    } else {
      alert("ALREADY ON THE WAITLIST!");
    }
    setIsSubmittingNotify(false);
  };

  const handleAddToCart = () => {
    if (!user) { setShowAuthModal(true); return; }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-jungli-orange" size={48} /></div>;

  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center"> <h1 className="text-5xl font-[1000] uppercase italic mb-4">404 - STASH EMPTY</h1> <Link href="/" className="bg-black text-white px-10 py-5 border-4 border-black font-black uppercase shadow-brutal">Return to Base</Link></div>;

  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);
  const gallery = product.images || [product.image_url];
  const videos = product.video_urls || [];

  return (
    <>
      {/* AUTH & LIGHTBOX MODALS (Hidden by default) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setIsLightboxOpen(false)}>
            <button className="absolute top-10 right-10 text-white"><X size={48} /></button>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={activeMedia?.url} className="max-w-full max-h-full object-contain shadow-2xl border-4 border-white bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-white pb-40">
        <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* MEDIA GALLERY */}
          <div className="space-y-6">
            <div className="relative group border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] aspect-square bg-white overflow-hidden cursor-pointer" onClick={() => activeMedia?.type === 'image' && setIsLightboxOpen(true)}>
              <AnimatePresence mode="wait">
                {activeMedia?.type === 'image' ? (
                  <motion.img key={activeMedia.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={activeMedia.url} className="w-full h-full object-contain p-6" alt="" />
                ) : (
                  <motion.video key={activeMedia?.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeMedia?.url} autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />
                )}
              </AnimatePresence>
              <div className="absolute top-6 left-6 bg-jungli-orange text-white px-4 py-2 border-4 border-black font-black italic -rotate-12 shadow-brutal-sm text-xs uppercase">-{discount}% OFF</div>
              {!product.is_available && <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 border-4 border-black font-black italic rotate-12 shadow-brutal-sm text-xs uppercase">SOLD OUT</div>}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
               {gallery.map((img: string, idx: number) => (
                 <div key={idx} onClick={() => setActiveMedia({ type: 'image', url: img })} className={`w-24 h-24 border-4 border-black flex-shrink-0 cursor-pointer transition-all bg-gray-50 ${activeMedia?.url === img ? 'shadow-brutal-sm translate-x-1 translate-y-1' : 'opacity-40 grayscale hover:opacity-100'}`}><img src={img} className="w-full h-full object-contain p-2" alt="" /></div>
               ))}
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex flex-col">
            <p className="text-sm font-black text-gray-400 uppercase italic mb-2 tracking-[0.2em]">{product.brand}</p>
            <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-[1000] uppercase italic tracking-tighter leading-[0.8] mb-8 text-black">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-10">
                <span className="text-5xl font-[1000] text-black italic tracking-tighter">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-2xl font-bold text-gray-300 line-through italic">₹{product.luxury_price.toLocaleString()}</span>
            </div>

            <div className="mt-4 border-l-8 border-jungli-orange pl-6 py-2 bg-gray-50/50 mb-10 relative">
              <p className={`font-bold italic text-black leading-tight uppercase text-sm ${!isDescriptionExpanded && 'line-clamp-3'}`}>{product.description}</p>
              <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-3 text-[10px] font-black uppercase underline decoration-2 hover:text-jungli-orange">{isDescriptionExpanded ? "Show Less —" : "Read Full Story +"}</button>
            </div>

            {/* DYNAMIC ACTION BUTTON (Buy vs Notify) */}
            <div className="mb-10">
              {product.is_available ? (
                <>
                  <div className="mb-8">
                    <span className="font-black uppercase italic text-xs bg-black text-white px-2 py-0.5 tracking-widest">Select Size (UK)</span>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {(product.available_sizes || []).map((size: string) => (
                        <button key={size} onClick={() => { setSelectedSize(size); setShowError(false); }} className={`py-5 border-4 border-black font-[1000] text-lg transition-all italic ${selectedSize === size ? 'bg-jungli-orange text-white translate-x-1' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-400'}`}>{size}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleAddToCart} className="w-full bg-black text-white text-3xl font-[1000] py-8 border-4 border-black shadow-brutal transition-all uppercase italic active:scale-95 flex items-center justify-center gap-4">
                    <ShoppingCart /> BUY NOW
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleNotifyMe}
                  disabled={isNotified || isSubmittingNotify}
                  className={`w-full py-8 border-4 border-black font-[1000] text-3xl uppercase italic shadow-brutal transition-all flex items-center justify-center gap-4
                    ${isNotified ? 'bg-green-500 text-black shadow-none translate-x-1' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                >
                  {isSubmittingNotify ? <Loader2 className="animate-spin" /> : (
                    <>
                      <motion.div animate={isNotified ? { rotate: [0, 20, -20, 20, -20, 0] } : {}} transition={{ duration: 0.5 }}>
                        <Bell fill={isNotified ? "black" : "none"} />
                      </motion.div>
                      {isNotified ? "STASH ALERT SET!" : "NOTIFY ME"}
                    </>
                  )}
                </button>
              )}
            </div>

            <ProductAccordion product={product} />
          </div>
        </div>

        <RelatedSlider currentProductId={product.id} />
      </main>
    </>
  );
}