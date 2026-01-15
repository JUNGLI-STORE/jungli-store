"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Star, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    comment: "",
    rating: 5,
    product_name: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch Reviews
  const fetchReviews = async () => {
    const { data } = await supabase.from('site_reviews').select('*').order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => { fetchReviews(); }, []);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = "";

    try {
      // 1. Upload Image if exists
      if (imageFile) {
        const path = `reviews/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('sneaker-assets').upload(path, imageFile);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('sneaker-assets').getPublicUrl(path);
        finalImageUrl = urlData.publicUrl;
      }

      // 2. Insert Data
      const { error } = await supabase.from('site_reviews').insert([{
        customer_name: formData.name,
        comment: formData.comment,
        rating: formData.rating,
        product_name: formData.product_name,
        image_url: finalImageUrl
      }]);

      if (error) throw error;

      alert("REVIEW PUBLISHED! 🌟");
      setFormData({ name: "", comment: "", rating: 5, product_name: "" });
      setImageFile(null);
      fetchReviews();

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if(!confirm("Delete this review?")) return;
    await supabase.from('site_reviews').delete().eq('id', id);
    fetchReviews();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-12 pb-40">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-5xl font-[1000] uppercase italic tracking-tighter">MANAGE <span className="text-jungli-orange">HYPE</span></h1>
            <Link href="/admin/inventory" className="font-black underline uppercase">Back to Inventory</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT: FORM */}
            <div className="lg:col-span-1">
                <form onSubmit={handleSubmit} className="bg-white border-4 border-black p-6 shadow-brutal sticky top-10">
                    <h3 className="text-2xl font-[1000] uppercase italic mb-6">Add New Review</h3>
                    
                    <div className="space-y-4">
                        <input required placeholder="CUSTOMER NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border-2 border-black font-bold uppercase italic outline-none" />
                        
                        <input placeholder="PRODUCT BOUGHT (OPTIONAL)" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} className="w-full p-3 border-2 border-black font-bold uppercase italic outline-none" />

                        <textarea required placeholder="THEIR FEEDBACK..." rows={3} value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} className="w-full p-3 border-2 border-black font-bold uppercase italic outline-none" />

                        <div className="flex items-center gap-2">
                            <span className="font-black uppercase text-xs">Rating:</span>
                            <select value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="p-2 border-2 border-black font-black">
                                <option value="5">5 STARS</option>
                                <option value="4">4 STARS</option>
                                <option value="3">3 STARS</option>
                            </select>
                        </div>

                        <div className="border-2 border-black border-dashed p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-2">
                                <Upload size={20} />
                                <span className="text-xs font-black uppercase">{imageFile ? "IMAGE SELECTED" : "UPLOAD PHOTO"}</span>
                            </div>
                        </div>

                        <button disabled={uploading} className="w-full bg-black text-white py-4 font-[1000] uppercase italic hover:bg-jungli-orange transition-colors">
                            {uploading ? <Loader2 className="animate-spin mx-auto" /> : "PUBLISH REVIEW"}
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT: LIST */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white border-4 border-black p-4 shadow-brutal-sm flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 border-2 border-black flex-shrink-0">
                            {review.image_url ? (
                                <img src={review.image_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-300"/></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-[1000] uppercase italic">{review.customer_name}</h4>
                                <button onClick={() => deleteReview(review.id)} className="text-red-600 hover:scale-110"><Trash2 size={16}/></button>
                            </div>
                            <div className="flex text-jungli-orange my-1">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                            <p className="text-xs font-bold text-gray-500 italic line-clamp-2">"{review.comment}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </main>
  );
}