"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export default function ReviewsWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const shouldShow = pathname === "/" || pathname?.startsWith("/shop/");

  useEffect(() => {
    if (isOpen && reviews.length === 0) {
      async function fetch() {
        setLoading(true);
        const { data } = await supabase.from('site_reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviews(data);
        setLoading(false);
      }
      fetch();
    }
  }, [isOpen]);

  if (!shouldShow) return null;

  return (
    <>
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{ delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-red-600 text-white border-l-4 border-y-4 border-black shadow-[-4px_4px_0px_#000] hover:translate-x-[-5px] transition-transform py-3 px-1 rounded-l-lg"
      >
        <div className="flex flex-col items-center gap-2" style={{ writingMode: 'vertical-rl' }}>
            <Star fill="white" size={16} className="rotate-90 mb-2" />
            <span className="font-[1000] uppercase tracking-widest text-xs rotate-180">Happy Hunters</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="relative bg-white w-full max-w-5xl h-[85vh] flex flex-col border-8 border-black shadow-[20px_20px_0px_#FF5F1F]"
            >
                <div className="bg-red-600 text-white p-6 border-b-4 border-black flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="bg-white text-red-600 p-2 border-2 border-black rotate-[-5deg]">
                            <Star fill="currentColor" size={24} />
                         </div>
                         <div>
                             <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-none">The Wall of Fame</h2>
                             <p className="text-[10px] font-bold uppercase opacity-80">{reviews.length} Verified Hunters</p>
                         </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                        <X size={32} strokeWidth={3} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-100 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-red-600" size={48} />
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="break-inside-avoid bg-white border-4 border-black p-4 shadow-brutal-sm hover:scale-[1.02] transition-transform">
                                    
                                    {/* --- IMAGE FIX --- */}
                                    {review.image_url && (
                                        <div className="w-full bg-gray-100 border-2 border-black mb-4 overflow-hidden flex items-center justify-center">
                                            {/* Changed to object-contain and removed strict aspect ratio forcing so tall images show fully */}
                                            <img 
                                              src={review.image_url} 
                                              alt="Customer" 
                                              className="w-full h-auto object-contain max-h-[400px]" 
                                            />
                                        </div>
                                    )}

                                    {review.product_name && (
                                        <span className="block mb-2 text-[10px] font-black uppercase bg-black text-white px-2 py-1 w-fit">
                                            {review.product_name}
                                        </span>
                                    )}

                                    <div className="flex text-yellow-400 mb-2">
                                        {[...Array(review.rating || 5)].map((_, i) => (
                                            <Star key={i} size={16} fill="currentColor" />
                                        ))}
                                    </div>

                                    <p className="font-bold text-sm italic text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                                        "{review.comment}"
                                    </p>

                                    <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-3">
                                        <h4 className="font-[1000] uppercase italic text-sm">{review.customer_name}</h4>
                                        {review.is_verified && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                <CheckCircle2 size={10} /> Verified
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}