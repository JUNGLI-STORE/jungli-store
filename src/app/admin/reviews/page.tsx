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

      // 2. Insert Data (With defaults for empty fields)
      const { error } = await supabase.from('site_reviews').insert([{
        customer_name: formData.name.trim() || "ANONYMOUS HUNTER", // Default if empty
        comment: formData.comment.trim(), // Can be empty
        rating: formData.rating,
        product_name: formData.product_name.trim(), // Can be empty
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

  // DELETE FUNCTION
  const deleteReview = async (id: string) => {
    if(!confirm("ARE YOU SURE? THIS WILL DELETE THE REVIEW PERMANENTLY.")) return;
    
    const { error } = await supabase.from('site_reviews').delete().eq('id', id);
    
    if (!error) {
        // Refresh the list immediately after deleting
        setReviews(reviews.filter(r => r.id !== id));
    } else {
        alert("Delete failed: " + error.message);
    }
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
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Customer Name (Optional)</label>
                            <input 
                                placeholder="ANONYMOUS HUNTER" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                className="w-full p-3 border-2 border-black font-bold uppercase italic outline-none focus:bg-gray-50" 
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Product Name (Optional)</label>
                            <input 
                                placeholder="E.G. TRAVIS SCOTT LOW" 
                                value={formData.product_name} 
                                onChange={e => setFormData({...formData, product_name: e.target.value})} 
                                className="w-full p-3 border-2 border-black font-bold uppercase italic outline-none focus:bg-gray-50" 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400">Feedback (Optional)</label>
                            <textarea 
                                placeholder="WRITE FEEDBACK..." 
                                rows={3} 
                                value={formData.comment} 
                                onChange={e => setFormData({...formData, comment: e.target.value})} 
                                className="w-full p-3 border-2 border-black font-bold uppercase italic outline-none focus:bg-gray-50" 
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-black uppercase text-xs">Rating:</span>
                            <select value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="p-2 border-2 border-black font-black w-full outline-none">
                                <option value="5">5 STARS (Recommended)</option>
                                <option value="4">4 STARS</option>
                                <option value="3">3 STARS</option>
                                <option value="2">2 STARS</option>
                                <option value="1">1 STAR</option>
                            </select>
                        </div>

                        <div className="border-2 border-black border-dashed p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-2">
                                <Upload size={20} />
                                <span className="text-xs font-black uppercase">{imageFile ? "IMAGE SELECTED" : "UPLOAD PHOTO (OPTIONAL)"}</span>
                            </div>
                        </div>

                        <button disabled={uploading} className="w-full bg-black text-white py-4 font-[1000] uppercase italic hover:bg-jungli-orange transition-colors">
                            {uploading ? <Loader2 className="animate-spin mx-auto" /> : "PUBLISH REVIEW"}
                        </button>
                    </div>
                </form>
            </div>

            {/* RIGHT: MANAGEMENT LIST */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="font-black uppercase italic text-lg border-b-4 border-black pb-2">Live Reviews ({reviews.length})</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border-4 border-black p-4 shadow-brutal-sm flex gap-4 items-center">
                            {/* Image Thumbnail */}
                            <div className="w-20 h-20 bg-gray-100 border-2 border-black flex-shrink-0">
                                {review.image_url ? (
                                    <img src={review.image_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-300"/></div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-[1000] uppercase italic text-lg leading-none">{review.customer_name}</h4>
                                        {review.product_name && <span className="text-[10px] font-black bg-gray-100 px-1 uppercase">{review.product_name}</span>}
                                    </div>
                                    <div className="flex text-jungli-orange">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-gray-500 italic mt-2 line-clamp-2">
                                    {review.comment ? `"${review.comment}"` : <span className="opacity-50">No text provided</span>}
                                </p>
                            </div>

                            {/* DELETE BUTTON */}
                            <button 
                                onClick={() => deleteReview(review.id)} 
                                className="bg-red-600 text-white p-3 border-2 border-black hover:bg-black transition-colors shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
                                title="Delete Review"
                            >
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}