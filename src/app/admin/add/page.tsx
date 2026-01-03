"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { motion } from "framer-motion";
import { Upload, X, ArrowLeft, Loader2, Zap, Image as ImageIcon, Check, Video } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('cloneId'); // Capture Clone ID from URL

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    luxury_price: "",
    jungli_price: "",
    tag: "NEW DROP",
    description: "",
    video_url: "", // Fixed your error by adding this here
    available_sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function checkAdminAndClone() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
      } else {
        setIsAdmin(true);

        // CLONE LOGIC: If URL has cloneId, fetch that shoe
        if (cloneId) {
          const { data: original } = await supabase
            .from('products')
            .select('*')
            .eq('id', cloneId)
            .single();

          if (original) {
            setFormData({
              name: `${original.name} (COPY)`,
              brand: original.brand || "",
              luxury_price: original.luxury_price.toString(),
              jungli_price: original.jungli_price.toString(),
              tag: original.tag || "NEW DROP",
              description: original.description || "",
              video_url: original.video_url || "",
              available_sizes: original.available_sizes || []
            });
          }
        }
      }
    }
    checkAdminAndClone();
  }, [cloneId, router]);

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      available_sizes: prev.available_sizes.includes(size)
        ? prev.available_sizes.filter(s => s !== size)
        : [...prev.available_sizes, size]
    }));
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !cloneId) return alert("SNEAKER IMAGE IS MANDATORY!");
    setLoading(true);

    try {
      let imageUrl = "";
      
      // Only upload if a new file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `images/${fileName}`;
        await supabase.storage.from('sneaker-assets').upload(filePath, imageFile);
        const { data: { publicUrl } } = supabase.storage.from('sneaker-assets').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      await supabase.from('products').insert([{
        name: formData.name.toUpperCase(),
        brand: formData.brand.toUpperCase(),
        luxury_price: Number(formData.luxury_price),
        jungli_price: Number(formData.jungli_price),
        image_url: imageUrl || (await supabase.from('products').select('image_url').eq('id', cloneId).single()).data?.image_url,
        video_url: formData.video_url,
        tag: formData.tag.toUpperCase(),
        description: formData.description,
        available_sizes: formData.available_sizes,
        is_available: true
      }]);

      alert("DRIP LAUNCHED! 🚀");
      router.push('/admin/inventory'); 
    } catch (err: any) {
      alert("FAIL: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleLaunch} className="bg-white border-8 border-black p-8 md:p-12 shadow-brutal relative">
            <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter leading-none mb-12">
              {cloneId ? "CLONE" : "ADD"} <span className="text-jungli-orange">STASH</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* MEDIA & SIZES */}
              <div className="space-y-8">
                <div className="relative border-4 border-dashed border-black aspect-square flex flex-col items-center justify-center bg-gray-50 overflow-hidden shadow-brutal-sm">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-contain p-4" alt="" />
                    ) : (
                      <div className="text-center p-6 text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <p className="font-black uppercase italic text-[10px]">Upload New Hero Image</p>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                    }} accept="image/*" />
                </div>

                <div className="bg-gray-50 border-4 border-black p-6">
                    <label className="block font-black uppercase italic mb-4 text-xs">Available Sizes (UK)</label>
                    <div className="grid grid-cols-3 gap-3">
                        {["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"].map(size => (
                            <button key={size} type="button" onClick={() => toggleSize(size)}
                                className={`py-3 border-4 border-black font-black italic text-sm transition-all
                                    ${formData.available_sizes.includes(size) ? 'bg-jungli-orange text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-brutal-sm'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              {/* DATA FIELDS */}
              <div className="space-y-6">
                <input required value={formData.brand} placeholder="BRAND" className="w-full p-4 border-4 border-black font-black uppercase italic outline-none shadow-brutal-sm" 
                onChange={e => setFormData({...formData, brand: e.target.value})} />
                
                <input required value={formData.name} placeholder="MODEL NAME" className="w-full p-4 border-4 border-black font-black uppercase italic outline-none shadow-brutal-sm" 
                onChange={e => setFormData({...formData, name: e.target.value})} />

                <div className="grid grid-cols-2 gap-4">
                    <input required value={formData.luxury_price} type="number" placeholder="LUXURY (₹)" className="w-full p-4 border-4 border-black font-black italic shadow-brutal-sm" 
                    onChange={e => setFormData({...formData, luxury_price: e.target.value})} />
                    
                    <input required value={formData.jungli_price} type="number" placeholder="JUNGLI (₹)" className="w-full p-4 border-4 border-black font-black italic shadow-brutal-sm text-jungli-orange" 
                    onChange={e => setFormData({...formData, jungli_price: e.target.value})} />
                </div>

                {/* VIDEO URL FIELD - This works now! */}
                <input value={formData.video_url} placeholder="VIDEO URL (MP4)" className="w-full p-4 border-4 border-black font-black italic outline-none shadow-brutal-sm" 
                onChange={e => setFormData({...formData, video_url: e.target.value})} />

                <textarea value={formData.description} rows={5} placeholder="THE STORY..." className="w-full p-4 border-4 border-black font-bold uppercase italic outline-none shadow-brutal-sm focus:bg-gray-50 transition-all" 
                onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <button disabled={loading} className="w-full mt-12 bg-black text-white py-8 border-4 border-black font-[1000] text-4xl uppercase italic shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center justify-center gap-6 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={40} /> : <>LAUNCH DRIP <Zap size={40} fill="white" /></>}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default function AddProduct() {
  return (
    <Suspense fallback={<div className="p-20 font-black italic">PREPARING STASH...</div>}>
      <AddProductForm />
    </Suspense>
  );
}