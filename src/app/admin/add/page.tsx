"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { 
  Upload, X, ArrowLeft, Loader2, Zap, Image as ImageIcon, 
  Check, Video, Plus, GripVertical, Star, Flame, Play, ShieldCheck, ListTodo, FileText
} from "lucide-react";
import Link from "next/link";

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('cloneId');
  const editId = searchParams.get('editId');

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. UPDATED FORM STATE (Includes Build Intel & Quality Points)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model_group: "", 
    luxury_price: "",
    jungli_price: "",
    tag: "NEW DROP",
    description: "",
    // NEW Technical Specs
    material_upper: "Master-Grade Tech Skin",
    material_lining: "Sweat-Wick Technical Mesh",
    material_sole: "High-Grip TPR Unit",
    quality_points: "", // One point per line
    available_sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
  });

  const [imageItems, setImageItems] = useState<{ id: string; file?: File; url: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ id: string; file?: File; url: string }[]>([]);

  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function initAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
      } else {
        setIsAdmin(true);
        const targetId = editId || cloneId;
        if (targetId) {
          const { data: original } = await supabase.from('products').select('*').eq('id', targetId).single();
          if (original) {
            setFormData({
              name: editId ? original.name : `${original.name} (COPY)`,
              brand: original.brand || "",
              model_group: original.model_group || "",
              luxury_price: original.luxury_price.toString(),
              jungli_price: original.jungli_price.toString(),
              tag: original.tag || "NEW DROP",
              description: original.description || "",
              material_upper: original.materials_json?.upper || "",
              material_lining: original.materials_json?.footbed || "",
              material_sole: original.materials_json?.sole || "",
              quality_points: (original.bullet_points || []).join('\n'),
              available_sizes: original.available_sizes || []
            });
            if (original.images) setImageItems(original.images.map((url: string) => ({ id: Math.random().toString(), url })));
            if (original.video_urls) setVideoFiles(original.video_urls.map((url: string) => ({ id: Math.random().toString(), url })));
          }
        }
      }
    }
    initAdmin();
  }, [cloneId, editId, router]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageItems.length === 0) return alert("IMAGE REQUIRED!");
    setLoading(true);

    try {
      const finalImageUrls = [];
      for (const item of imageItems) {
        if (item.file) {
          const path = `images/${Date.now()}-${item.file.name}`;
          await supabase.storage.from('sneaker-assets').upload(path, item.file);
          finalImageUrls.push(supabase.storage.from('sneaker-assets').getPublicUrl(path).data.publicUrl);
        } else {
          finalImageUrls.push(item.url); 
        }
      }

      const finalVideoUrls = [];
      for (const item of videoFiles) {
        if (item.file) {
          const path = `videos/${Date.now()}-${item.file.name}`;
          await supabase.storage.from('sneaker-assets').upload(path, item.file);
          finalVideoUrls.push(supabase.storage.from('sneaker-assets').getPublicUrl(path).data.publicUrl);
        } else {
          finalVideoUrls.push(item.url);
        }
      }

      // 2. PREPARE PAYLOAD (Syncing separate inputs to the Database Columns)
      const productData = {
        name: formData.name.toUpperCase(),
        brand: formData.brand.toUpperCase(),
        model_group: formData.model_group.toLowerCase().replace(/\s+/g, '-'),
        luxury_price: Number(formData.luxury_price),
        jungli_price: Number(formData.jungli_price),
        image_url: finalImageUrls[0],
        images: finalImageUrls,
        video_urls: finalVideoUrls,
        tag: formData.tag.toUpperCase(),
        description: formData.description,
        is_available: true,
        available_sizes: formData.available_sizes,
        // Save to JSONB and Array columns
        materials_json: {
            upper: formData.material_upper,
            footbed: formData.material_lining,
            sole: formData.material_sole
        },
        bullet_points: formData.quality_points.split('\n').filter(line => line.trim() !== "")
      };

      if (editId) {
        await supabase.from('products').update(productData).eq('id', editId);
      } else {
        await supabase.from('products').insert([productData]);
      }

      alert("STASH UPDATED! 🔥");
      router.push('/admin/inventory');
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-12 pb-40">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin/inventory" className="inline-flex items-center gap-2 font-black uppercase italic mb-8 hover:text-jungli-orange transition-colors">
          <ArrowLeft size={20} /> Back to Vault
        </Link>

        <form onSubmit={handleLaunch} className="bg-white border-8 border-black p-6 md:p-12 shadow-brutal relative">
          <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter mb-12 leading-none">
             {editId ? 'EDIT' : 'ADD'} <span className="text-jungli-orange">STASH</span>
          </h1>

          {/* DRAGGABLE GALLERY */}
          <div className="mb-16">
            <label className="block font-black uppercase italic mb-4 text-sm bg-black text-white inline-block px-2 italic">1. Image Sequence</label>
            <Reorder.Group axis="x" values={imageItems} onReorder={setImageItems} className="flex gap-4 overflow-x-auto p-6 bg-gray-50 border-4 border-black border-dashed rounded-none">
              {imageItems.map((item) => (
                <Reorder.Item key={item.id} value={item} className="relative w-40 h-40 bg-white border-4 border-black shadow-brutal-sm cursor-grab active:cursor-grabbing flex-shrink-0 group">
                  <img src={item.url} className="w-full h-full object-contain p-2" alt="" />
                  <div className="absolute top-1 left-1 bg-black text-white text-[8px] px-1 font-black uppercase italic">
                    {imageItems.indexOf(item) === 0 ? "MAIN DISPLAY" : `POS ${imageItems.indexOf(item) + 1}`}
                  </div>
                  <button type="button" onClick={() => setImageItems(prev => prev.filter(i => i.id !== item.id))} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  <GripVertical className="absolute bottom-1 right-1 text-gray-300" size={16} />
                </Reorder.Item>
              ))}
              <label className="w-40 h-40 border-4 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-yellow-50 hover:border-black cursor-pointer transition-all">
                <Plus size={32} className="text-gray-300" /><input type="file" multiple className="hidden" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const newItems = files.map(f => ({ id: Math.random().toString(), file: f, url: URL.createObjectURL(f) }));
                  setImageItems([...imageItems, ...newItems]);
                }} accept="image/*" />
              </label>
            </Reorder.Group>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-10">
              {/* TAGS */}
              <div className="bg-yellow-400 border-4 border-black p-6 shadow-brutal-sm">
                  <label className="font-[1000] uppercase italic mb-4 text-sm flex items-center gap-2"><Flame size={20} fill="black" /> HYPE TAG</label>
                  <select className="w-full p-4 border-4 border-black font-[1000] uppercase italic outline-none bg-white" onChange={e => setFormData({...formData, tag: e.target.value})} value={formData.tag}>
                      <option value="NEW DROP">NEW DROP</option>
                      <option value="SELLING FAST">SELLING FAST</option>
                      <option value="FINAL BATCH">FINAL BATCH</option>
                      <option value="LIMITED EDITION">LIMITED EDITION</option>
                      <option value="1:1 QUALITY">1:1 QUALITY</option>
                  </select>
              </div>

              {/* BUILD INTEL (Separated Fields) */}
              <div className="bg-white border-4 border-black p-6 shadow-brutal-sm space-y-4">
                  <label className="font-[1000] uppercase italic text-sm flex items-center gap-2 text-jungli-orange"><Zap size={20} fill="currentColor" /> BUILD INTEL (Materials)</label>
                  <input placeholder="EXTERIOR UPPER (E.G. TECH SKIN)" value={formData.material_upper} className="w-full p-3 border-2 border-black font-black uppercase italic text-xs outline-none focus:bg-gray-50" onChange={e => setFormData({...formData, material_upper: e.target.value})} />
                  <input placeholder="INTERIOR LINING (E.G. SOFT MESH)" value={formData.material_lining} className="w-full p-3 border-2 border-black font-black uppercase italic text-xs outline-none focus:bg-gray-50" onChange={e => setFormData({...formData, material_lining: e.target.value})} />
                  <input placeholder="TRACTION UNIT (E.G. TPR SOLE)" value={formData.material_sole} className="w-full p-3 border-2 border-black font-black uppercase italic text-xs outline-none focus:bg-gray-50" onChange={e => setFormData({...formData, material_sole: e.target.value})} />
              </div>
            </div>

            {/* DATA FIELDS */}
            <div className="space-y-6">
              <input required value={formData.brand} placeholder="BRAND" className="w-full p-4 border-4 border-black font-[1000] uppercase italic shadow-brutal-sm" onChange={e => setFormData({ ...formData, brand: e.target.value })} />
              <input required value={formData.name} placeholder="MODEL COLORWAY" className="w-full p-4 border-4 border-black font-[1000] uppercase italic shadow-brutal-sm" onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input value={formData.model_group} placeholder="MODEL GROUP ID (LINKING)" className="w-full p-4 border-4 border-black font-[1000] uppercase italic shadow-brutal-sm bg-gray-50" onChange={e => setFormData({ ...formData, model_group: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input required value={formData.luxury_price} type="number" placeholder="LUXURY" className="w-full p-4 border-4 border-black font-black shadow-brutal-sm" onChange={e => setFormData({ ...formData, luxury_price: e.target.value })} />
                <input required value={formData.jungli_price} type="number" placeholder="JUNGLI" className="w-full p-4 border-4 border-black font-black shadow-brutal-sm text-jungli-orange" onChange={e => setFormData({ ...formData, jungli_price: e.target.value })} />
              </div>
            </div>
          </div>

          {/* QUALITY CHECKLIST & STORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-2">
                <label className="font-[1000] uppercase italic text-sm flex items-center gap-2"><ListTodo size={20}/> Quality Checklist (One per line)</label>
                <textarea value={formData.quality_points} rows={6} placeholder="⚡️ 1:1 Precise Silhouette&#10;⚡️ Reinforced Street Stitching&#10;⚡️ Dual-Density Cushioning" className="w-full p-4 border-4 border-black font-black uppercase italic text-xs outline-none shadow-brutal-sm bg-black text-white placeholder:text-gray-600" onChange={e => setFormData({...formData, quality_points: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="font-[1000] uppercase italic text-sm flex items-center gap-2"><FileText size={20}/> The Story (Description)</label>
                <textarea value={formData.description} rows={6} placeholder="WHAT'S THE VIBE OF THIS DROP?" className="w-full p-4 border-4 border-black font-bold uppercase italic outline-none shadow-brutal-sm focus:bg-gray-50" onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          <button disabled={loading} className="w-full bg-black text-white py-10 border-8 border-black font-[1000] text-5xl uppercase italic shadow-brutal hover:translate-x-2 active:scale-95 flex items-center justify-center gap-8 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={60} /> : <>{editId ? 'UPDATE STASH' : 'LAUNCH STASH'} <Zap size={60} fill="white" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AddProduct() {
  return (
    <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-4xl animate-pulse">Accessing Vault...</div>}>
      <AddProductForm />
    </Suspense>
  );
}