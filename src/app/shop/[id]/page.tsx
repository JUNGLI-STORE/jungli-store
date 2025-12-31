"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useParams } from 'next/navigation'; // For getting the ID from the URL
import { supabase } from '@/lib/supabase'; // Your database client
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams(); // The ID from /shop/[id]
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

  // FETCH SPECIFIC PRODUCT FROM SUPABASE
  useEffect(() => {
    async function getProductDetails() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single(); // Get only one result

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
      price: product.jungli_price, // Use price from DB
      image: product.image_url,    // Use image from DB
      size: selectedSize,
      quantity: 1
    });
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-jungli-orange" size={48} />
          <p className="font-black italic uppercase tracking-widest text-gray-400">Hunting for drip...</p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (Product not found)
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <h1 className="text-4xl font-black uppercase italic mb-4">404 - Drip Not Found</h1>
        <p className="font-bold text-gray-500 mb-8 italic">This sneaker has escaped the jungle or doesn't exist.</p>
        <Link href="/" className="bg-black text-white px-8 py-4 border-4 border-black font-black uppercase shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
          Back to Base
        </Link>
      </div>
    );
  }

  // Calculate dynamic discount percentage
  const discount = Math.round(((product.luxury_price - product.jungli_price) / product.luxury_price) * 100);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* PRODUCT IMAGES */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-4 border-black shadow-brutal aspect-square bg-gray-100 flex items-center justify-center overflow-hidden"
            >
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => (
                    <div key={i} className="border-2 border-black aspect-square bg-gray-50 cursor-pointer hover:bg-jungli-orange/10 transition-colors"></div>
                ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 text-xs font-bold uppercase mb-4 text-gray-400">
                <Link href="/" className="hover:text-black">Shop</Link> 
                <ChevronRight size={12}/> 
                <span className="text-black">{product.name}</span>
            </nav>

            <h1 className="text-5xl md:text-6xl font-[1000] uppercase italic tracking-tighter leading-none mb-2">
                {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-black text-jungli-orange">₹{product.jungli_price.toLocaleString()}</span>
                <span className="text-xl font-bold text-gray-400 line-through">₹{product.luxury_price.toLocaleString()}</span>
                <span className="bg-black text-white text-xs font-black px-2 py-1 uppercase italic">Save {discount}%</span>
            </div>

            <p className="font-bold italic text-gray-700 mb-8 border-l-4 border-jungli-orange pl-4">
                {product.description || "The highest-tier materials, original silhouette, and iconic comfort. Why pay for the logo when you can have the quality?"}
            </p>

            {/* SIZE SELECTOR */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <span className="font-black uppercase italic text-sm tracking-widest">Select Size (UK)</span>
                    <span className="text-xs font-bold underline cursor-pointer hover:text-jungli-orange transition-colors">Size Guide</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {sizes.map((size) => (
                        <button 
                            key={size}
                            onClick={() => {
                                setSelectedSize(size);
                                setShowError(false);
                            }}
                            className={`py-4 border-2 border-black font-black transition-all ${
                                selectedSize === size 
                                ? 'bg-jungli-orange text-white shadow-none translate-x-1 translate-y-1' 
                                : 'bg-white text-black shadow-brutal-sm hover:bg-gray-50'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
                
                {showError && (
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-red-600 font-black uppercase text-xs mt-4 flex items-center gap-2"
                    >
                        <AlertTriangle size={14}/> Pick your size to secure the drip!
                    </motion.p>
                )}
            </div>

            {/* ACTION BUTTON */}
            <button 
                onClick={handleAddToCart}
                className="w-full bg-black text-white text-2xl font-[1000] py-6 border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic mb-8"
            >
                Secure This Pair
            </button>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-1 gap-4 py-8 border-t-2 border-dashed border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 border-2 border-black shadow-brutal-sm"><Truck size={20}/></div>
                    <div>
                        <p className="font-black uppercase text-xs">Express Pan-India Delivery</p>
                        <p className="text-[10px] font-bold text-gray-500 italic">Expected in 3-5 Business Days</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 border-2 border-black shadow-brutal-sm"><RotateCcw size={20}/></div>
                    <div>
                        <p className="font-black uppercase text-xs">7-Day Easy Replacement</p>
                        <p className="text-[10px] font-bold text-gray-500 italic">Hassle-free size exchange</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 border-2 border-black shadow-brutal-sm"><ShieldCheck size={20}/></div>
                    <div>
                        <p className="font-black uppercase text-xs">Quality Inspected</p>
                        <p className="text-[10px] font-bold text-gray-500 italic">Double-checked for imperfections</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}