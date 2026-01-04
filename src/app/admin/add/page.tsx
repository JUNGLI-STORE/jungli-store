"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { 
  Upload, X, ArrowLeft, Loader2, Zap, Image as ImageIcon, 
  Check, Video, Plus, GripVertical, Star, MessageSquare 
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('cloneId');

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    luxury_price: "",
    jungli_price: "",
    tag: "NEW DROP",
    description: "",
    available_sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
  });

  // 2. MEDIA STATES (Supports Drag & Drop)
  const [imageItems, setImageItems] = useState<{ id: string; file?: File; url: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  
  // 3. MANUAL REVIEWS STATE
  const [reviews, setReviews] = useState<{ id: string; name: string; msg: string; rating: number; file?: File; preview?: string }[]>([]);

  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function checkAdminAndClone() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
      } else {
        setIsAdmin(true);
        if (cloneId) {
          const { data: original } = await supabase.from('products').select('*').eq('id', cloneId).single();
          if (original) {
            setFormData({
              name: `${original.name} (COPY)`,
              brand: original.brand || "",
              luxury_price: original.luxury_price.toString(),
              jungli_price: original.jungli_price.toString(),
              tag: original.tag || "NEW DROP",
              description: original.description || "",
              available_sizes: original.available_sizes || []
            });
            const existing = (original.images || []).map((url: string) => ({ id: Math.random().toString(), url }));
            setImageItems(existing);
          }
        }
      }
    }
    checkAdminAndClone();
  }, [cloneId, router]);

  // IMAGE LOGIC
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map(file => ({
      id: Math.random().toString(),
      file: file,
      url: URL.createObjectURL(file)
    }));
    setImageItems(prev => [...prev, ...newItems]);
  };

  // REVIEW LOGIC
  const addReviewRow = () => {
    setReviews([...reviews, { id: Math.random().toString(), name: "", msg: "", rating: 5 }]);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageItems.length === 0) return alert("AT LEAST ONE IMAGE REQUIRED!");
    setLoading(true);

    try {
      // A. Upload Product Images (in dragged order)
      const finalImageUrls = [];
      for (const item of imageItems) {
        if (item.file) {
          const path = `images/${Date.now()}-${item.file.name}`;
          await supabase.storage.from('sneaker-assets').upload(path, item.file);
          finalImageUrls.push(supabase.storage.from('sneaker-assets').getPublicUrl(path).data.publicUrl);
        } else {
          finalImageUrls.push(item.url); // Keep existing for clones
        }
      }

      // B. Upload Videos
      const finalVideoUrls = [];
      for (const vFile of videoFiles) {
        const path = `videos/${Date.now()}-${vFile.name}`;
        await supabase.storage.from('sneaker-assets').upload(path, vFile);
        finalVideoUrls.push(supabase.storage.from('sneaker-assets').getPublicUrl(path).data.publicUrl);
      }

      // C. Save Product
      const { data: product, error: pError } = await supabase.from('products').insert([{
        ...formData,
        name: formData.name.toUpperCase(),
        brand: formData.brand.toUpperCase(),
        luxury_price: Number(formData.luxury_price),
        jungli_price: Number(formData.jungli_price),
        image_url: finalImageUrls[0], // First in sequence is Main
        images: finalImageUrls,
        video_urls: finalVideoUrls,
        is_available: true
      }]).select().single();

      if (pError) throw pError;

      // D. Save Manual Reviews
      for (const rev of reviews) {
        let revMedia = [];
        if (rev.file) {
          const path = `reviews/${Date.now()}-${rev.file.name}`;
          await supabase.storage.from('sneaker-assets').upload(path, rev.file);
          revMedia.push(supabase.storage.from('sneaker-assets').getPublicUrl(path).data.publicUrl);
        }
        await supabase.from('product_reviews').insert([{
          product_id: product.id,
          customer_name: rev.name,
          message: rev.msg,
          rating: rev.rating,
          media_urls: revMedia
        }]);
      }

      alert("DRIP DEPLOYED! 🔥");
      router.push('/admin/inventory');
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-4 md:p-12">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleLaunch} className="bg-white border-8 border-black p-6 md:p-12 shadow-brutal relative">
            <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter mb-12">
              MASTER <span className="text-jungli-orange text-7xl">STASH</span>
            </h1>

            {/* 1. DRAGGABLE IMAGE GALLERY */}
            <div className="mb-16">
              <label className="block font-black uppercase italic mb-4 text-sm bg-black text-white inline-block px-2">
                Sequence Images (Drag first one to make it Main View)
              </label>
              <Reorder.Group axis="x" values={imageItems} onReorder={setImageItems} className="flex gap-4 overflow-x-auto p-6 bg-gray-50 border-4 border-black border-dashed rounded-xl">
                {imageItems.map((item) => (
                  <Reorder.Item key={item.id} value={item} className="relative w-40 h-40 bg-white border-4 border-black shadow-brutal-sm cursor-grab active:cursor-grabbing flex-shrink-0 group">
                    <img src={item.url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-1 left-1 bg-black text-white text-[8px] px-1 font-black uppercase italic">
                      {imageItems.indexOf(item) === 0 ? "MAIN DISPLAY" : `POS ${imageItems.indexOf(item) + 1}`}
                    </div>
                    <button type="button" onClick={() => setImageItems(prev => prev.filter(i => i.id !== item.id))} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={14} />
                    </button>
                    <GripVertical className="absolute bottom-1 right-1 text-gray-300" size={16} />
                  </Reorder.Item>
                ))}
                <label className="w-40 h-40 border-4 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-yellow-50 hover:border-black cursor-pointer transition-all">
                  <Plus size={32} className="text-gray-300" />
                  <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </Reorder.Group>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* VIDEO & SIZES SECTION */}
              <div className="space-y-10">
                <div>
                  <label className="block font-black uppercase italic mb-4 text-sm tracking-widest text-jungli-orange">Video Content (Texture Proof)</label>
                  <input type="file" multiple accept="video/*" className="mb-4 text-xs font-bold" onChange={(e) => setVideoFiles([...videoFiles, ...Array.from(e.target.files || [])])} />
                  <div className="flex flex-wrap gap-2">
                    {videoFiles.map((v, i) => (
                      <div key={i} className="bg-black text-white px-3 py-1 border-2 border-black flex items-center gap-2 text-[10px] font-black italic">
                        <Video size={12} /> {v.name.slice(0, 10)}... <X size={12} className="cursor-pointer text-red-500" onClick={() => setVideoFiles(videoFiles.filter((_, idx) => idx !== i))} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 border-4 border-black p-6 shadow-brutal-sm">
                  <label className="block font-black uppercase italic mb-4 text-xs tracking-widest">Inventory Sizes (UK)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"].map(size => (
                      <button key={size} type="button" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          available_sizes: prev.available_sizes.includes(size) ? prev.available_sizes.filter(s => s !== size) : [...prev.available_sizes, size]
                        }));
                      }}
                        className={`py-3 border-4 border-black font-black italic text-sm transition-all
                          ${formData.available_sizes.includes(size) ? 'bg-jungli-orange text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-brutal-sm'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DATA FIELDS */}
              <div className="space-y-6">
                <input required value={formData.brand} placeholder="BRAND (NIKE, JORDAN...)" className="w-full p-4 border-4 border-black font-[1000] uppercase italic shadow-brutal-sm" onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                <input required value={formData.name} placeholder="MODEL NAME" className="w-full p-4 border-4 border-black font-[1000] uppercase italic shadow-brutal-sm" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <input required value={formData.luxury_price} type="number" placeholder="LUXURY (₹)" className="w-full p-4 border-4 border-black font-black shadow-brutal-sm" onChange={e => setFormData({ ...formData, luxury_price: e.target.value })} />
                  <input required value={formData.jungli_price} type="number" placeholder="JUNGLI (₹)" className="w-full p-4 border-4 border-black font-black shadow-brutal-sm text-jungli-orange" onChange={e => setFormData({ ...formData, jungli_price: e.target.value })} />
                </div>
                <textarea value={formData.description} rows={4} placeholder="THE STORY..." className="w-full p-4 border-4 border-black font-bold uppercase italic outline-none shadow-brutal-sm focus:bg-gray-50 transition-all" onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>

            {/* 3. MANUAL REVIEW SECTION */}
            <div className="border-t-8 border-black pt-12 mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter">Social <span className="text-yellow-400">Proof</span></h2>
                <button type="button" onClick={addReviewRow} className="bg-white border-4 border-black px-6 py-2 font-black uppercase italic shadow-brutal-sm hover:translate-x-1 transition-all flex items-center gap-2">
                  <Plus size={18} /> Add Review
                </button>
              </div>

              <div className="space-y-6">
                {reviews.map((rev, idx) => (
                  <div key={rev.id} className="bg-gray-50 border-4 border-black p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative shadow-brutal-sm">
                    <button type="button" onClick={() => setReviews(reviews.filter(r => r.id !== rev.id))} className="absolute -top-3 -right-3 bg-red-600 text-white p-1 border-2 border-black shadow-brutal-sm"><X size={14} /></button>
                    
                    <div className="space-y-2">
                      <input placeholder="CUSTOMER NAME" className="w-full p-2 border-2 border-black font-black uppercase text-xs" onChange={e => {
                        const newR = [...reviews]; newR[idx].name = e.target.value; setReviews(newR);
                      }} />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={20} fill={rev.rating >= s ? "black" : "none"} className="cursor-pointer" onClick={() => {
                            const newR = [...reviews]; newR[idx].rating = s; setReviews(newR);
                          }} />
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <textarea placeholder="WHAT DID THEY SAY?" className="w-full p-2 border-2 border-black font-bold uppercase text-xs italic" onChange={e => {
                        const newR = [...reviews]; newR[idx].msg = e.target.value; setReviews(newR);
                      }} />
                      <div className="relative border-2 border-black border-dashed p-2 bg-white flex items-center justify-center cursor-pointer">
                          <ImageIcon size={14} className="mr-2" />
                          <p className="text-[8px] font-black uppercase truncate">{rev.file ? rev.file.name : "Attach Screenshot"}</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                             const newR = [...reviews]; newR[idx].file = e.target.files?.[0]; setReviews(newR);
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button disabled={loading} className="w-full bg-black text-white py-10 border-8 border-black font-[1000] text-5xl uppercase italic shadow-brutal hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center gap-8 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={60} /> : <>LAUNCH STASH <Zap size={60} fill="white" /></>}
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