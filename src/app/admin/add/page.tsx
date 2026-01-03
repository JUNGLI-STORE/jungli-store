"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ArrowLeft, Loader2, Zap, Image as ImageIcon, Check, Video, Plus } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('cloneId');

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
    video_url: "",
    available_sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
  });

  // MULTI-IMAGE STATES
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // For cloned images

  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function checkAdminAndClone() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
      } else {
        setIsAdmin(true);

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
            // Carry over existing image URLs for the clone
            setExistingImages(original.images || [original.image_url]);
          }
        }
      }
    }
    checkAdminAndClone();
  }, [cloneId, router]);

  // Handle Multi-Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

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
    if (imageFiles.length === 0 && existingImages.length === 0) {
      return alert("UPLOAD AT LEAST ONE SNEAKER IMAGE!");
    }
    setLoading(true);

    try {
      const uploadedUrls: string[] = [...existingImages];

      // 1. Upload all new images to Supabase Storage
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('sneaker-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('sneaker-assets')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      // 2. Save to Database (First image is main image_url, all go into images array)
      const { error } = await supabase.from('products').insert([{
        name: formData.name.toUpperCase(),
        brand: formData.brand.toUpperCase(),
        luxury_price: Number(formData.luxury_price),
        jungli_price: Number(formData.jungli_price),
        image_url: uploadedUrls[0], // Main thumbnail
        images: uploadedUrls,       // Full gallery array
        video_url: formData.video_url,
        tag: formData.tag.toUpperCase(),
        description: formData.description,
        available_sizes: formData.available_sizes,
        is_available: true
      }]);

      if (error) throw error;

      alert("STASH SECURED! 🔥");
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
      <main className="min-h-screen bg-gray-100 p-4 md:p-12">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin/inventory" className="inline-flex items-center gap-2 font-black uppercase italic mb-8 hover:text-jungli-orange transition-colors">
            <ArrowLeft size={20} /> Back to Vault
          </Link>

          <form onSubmit={handleLaunch} className="bg-white border-8 border-black p-6 md:p-12 shadow-brutal relative">
            <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter leading-none mb-12">
              {cloneId ? "CLONE" : "NEW"} <span className="text-jungli-orange">STASH</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* MEDIA & SIZES SECTION */}
              <div className="space-y-8">
                <div>
                  <label className="block font-black uppercase italic mb-4 text-xs tracking-widest">Sneaker Gallery (Upload 4-6 shots)</label>
                  
                  {/* Image Grid Preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {/* Existing Images (Cloned) */}
                    {existingImages.map((url, idx) => (
                      <div key={`exist-${idx}`} className="relative border-4 border-black aspect-square bg-gray-50 overflow-hidden shadow-brutal-sm">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 border-2 border-black shadow-brutal-sm">
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* New Selection Previews */}
                    {previews.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative border-4 border-black aspect-square bg-yellow-50 overflow-hidden shadow-brutal-sm">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-black text-white p-1 border-2 border-black">
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Upload Trigger Square */}
                    <div className="relative border-4 border-dashed border-gray-300 aspect-square flex flex-col items-center justify-center hover:bg-gray-50 hover:border-black transition-all cursor-pointer group">
                        <Plus size={32} className="text-gray-300 group-hover:text-black transition-colors" />
                        <p className="text-[8px] font-black uppercase text-gray-400 group-hover:text-black">Add Pic</p>
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                    </div>
                  </div>
                </div>

                {/* SIZES */}
                <div className="bg-gray-50 border-4 border-black p-6 shadow-brutal-sm">
                    <label className="block font-black uppercase italic mb-4 text-xs tracking-widest">Inventory Sizes (UK)</label>
                    <div className="grid grid-cols-3 gap-3">
                        {["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"].map(size => (
                            <button key={size} type="button" onClick={() => toggleSize(size)}
                                className={`py-3 border-4 border-black font-black italic text-sm transition-all
                                    ${formData.available_sizes.includes(size) ? 'bg-jungli-orange text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-black shadow-brutal-sm hover:bg-yellow-100'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              {/* DATA FIELDS SECTION */}
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic">Brand</label>
                    <input required value={formData.brand} placeholder="E.G. NIKE / JORDAN" className="w-full p-4 border-4 border-black font-black uppercase italic outline-none shadow-brutal-sm focus:bg-jungli-orange/5" 
                    onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic">Model / Colorway</label>
                    <input required value={formData.name} placeholder="E.G. RETRO HIGH 'CHICAGO'" className="w-full p-4 border-4 border-black font-black uppercase italic outline-none shadow-brutal-sm focus:bg-jungli-orange/5" 
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-black uppercase text-xs italic text-gray-400">Luxury (₹)</label>
                        <input required value={formData.luxury_price} type="number" placeholder="18000" className="w-full p-4 border-4 border-black font-black italic shadow-brutal-sm" 
                        onChange={e => setFormData({...formData, luxury_price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="font-black uppercase text-xs italic text-jungli-orange">Jungli (₹)</label>
                        <input required value={formData.jungli_price} type="number" placeholder="3499" className="w-full p-4 border-4 border-black font-black italic shadow-brutal-sm text-jungli-orange" 
                        onChange={e => setFormData({...formData, jungli_price: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic text-gray-400">Video URL (Optional)</label>
                    <input value={formData.video_url} placeholder="MP4 URL" className="w-full p-4 border-4 border-black font-bold italic outline-none shadow-brutal-sm" 
                    onChange={e => setFormData({...formData, video_url: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic">The Story</label>
                    <textarea value={formData.description} rows={4} placeholder="Why is this pair special?" className="w-full p-4 border-4 border-black font-bold uppercase italic outline-none shadow-brutal-sm focus:bg-gray-50" 
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
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
    <Suspense fallback={<div className="p-20 font-black italic uppercase">Waking up the jungle...</div>}>
      <AddProductForm />
    </Suspense>
  );
}