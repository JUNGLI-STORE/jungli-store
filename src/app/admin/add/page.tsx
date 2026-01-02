"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X, ArrowLeft, Loader2, Zap, Video, Image as ImageIcon, CheckCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    luxury_price: "",
    jungli_price: "",
    tag: "NEW DROP",
    description: ""
  });

  // Media States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 1. Admin Security Check (Replace with your email)
  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); // Redirect if not you
      } else {
        setIsAdmin(true);
      }
    }
    checkAdmin();
  }, [router]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Helper function to upload files to Supabase Storage
  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sneaker-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('sneaker-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("SNEAKER IMAGE IS MANDATORY!");
    setLoading(true);

    try {
      // 1. Upload Assets
      const imageUrl = await uploadFile(imageFile, 'images');
      let videoUrl = "";
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'videos');
      }

      // 2. Save to Database
      const { error } = await supabase.from('products').insert([{
        name: formData.name.toUpperCase(),
        luxury_price: Number(formData.luxury_price),
        jungli_price: Number(formData.jungli_price),
        image_url: imageUrl,
        video_url: videoUrl,
        tag: formData.tag.toUpperCase(),
        description: formData.description,
        is_available: true
      }]);

      if (error) throw error;

      alert("LAUNCH SUCCESSFUL! 🚀");
      router.push('/'); // Go home to see the new drop
    } catch (err: any) {
      console.error(err);
      alert("FAIL: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null; // Prevent flicker while checking auth

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <Link href="/" className="inline-flex items-center gap-2 font-black uppercase italic mb-8 hover:text-jungli-orange transition-colors">
            <ArrowLeft size={20} /> Abort Mission
          </Link>

          <form onSubmit={handleLaunch} className="bg-white border-8 border-black p-8 md:p-12 shadow-brutal relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter leading-none">
                    ADD NEW <span className="text-jungli-orange">STASH</span>
                </h1>
                <div className="bg-black text-white px-4 py-1 border-2 border-black font-black uppercase italic text-xs rotate-2 shadow-brutal-sm">
                    Admin Portal
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* LEFT SIDE: MEDIA UPLOAD */}
              <div className="space-y-8">
                {/* Image Upload */}
                <div className="group">
                  <label className="block font-black uppercase italic mb-2 text-xs tracking-widest">Sneaker Shot (PNG/JPG)</label>
                  <div className="relative border-4 border-dashed border-black aspect-square flex flex-col items-center justify-center bg-gray-50 hover:bg-yellow-50 transition-colors cursor-pointer overflow-hidden shadow-brutal-sm">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-contain p-4" alt="Preview" />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon size={48} className="mx-auto mb-2 text-gray-300 group-hover:text-black transition-colors" />
                        <p className="font-black uppercase italic text-[10px] text-gray-400 group-hover:text-black">Drop Hero Image</p>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block font-black uppercase italic mb-2 text-xs tracking-widest text-gray-400">Sneaker Clip (MP4 - OPTIONAL)</label>
                  <div className="relative border-4 border-dashed border-gray-300 p-6 flex items-center justify-center bg-gray-50 hover:border-black transition-all cursor-pointer">
                    <Video size={24} className={videoFile ? "text-green-500" : "text-gray-300"} />
                    <p className="ml-3 font-black uppercase italic text-[10px] text-gray-400 truncate">
                      {videoFile ? videoFile.name : "Upload Reel/Video"}
                    </p>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} accept="video/*" />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: DATA FIELDS */}
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic">Model Name</label>
                    <input required placeholder="E.G. RETRO BRED 1" className="w-full p-4 border-4 border-black font-black uppercase italic outline-none shadow-brutal-sm focus:bg-jungli-orange/5 transition-all" 
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-black uppercase text-xs italic text-gray-400">Luxury (₹)</label>
                        <input required type="number" placeholder="18000" className="w-full p-4 border-4 border-black font-black italic outline-none shadow-brutal-sm focus:bg-gray-50" 
                        onChange={e => setFormData({...formData, luxury_price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="font-black uppercase text-xs italic text-jungli-orange">Jungli (₹)</label>
                        <input required type="number" placeholder="3499" className="w-full p-4 border-4 border-black font-black italic outline-none shadow-brutal-sm focus:bg-orange-50 text-jungli-orange" 
                        onChange={e => setFormData({...formData, jungli_price: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic">Drop Tag</label>
                    <select 
                      className="w-full p-4 border-4 border-black font-black uppercase italic outline-none shadow-brutal-sm bg-white"
                      onChange={e => setFormData({...formData, tag: e.target.value})}
                    >
                        <option value="NEW DROP">NEW DROP</option>
                        <option value="LIMITED">LIMITED EDITION</option>
                        <option value="BEST SELLER">BEST SELLER</option>
                        <option value="ARCHIVE">ARCHIVE</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="font-black uppercase text-xs italic">The Story (Description)</label>
                    <textarea rows={4} placeholder="Why is this pair special?" className="w-full p-4 border-4 border-black font-bold uppercase italic outline-none shadow-brutal-sm focus:bg-gray-50" 
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full mt-12 bg-black text-white py-8 border-4 border-black font-[1000] text-4xl uppercase italic shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center justify-center gap-6 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={40} />
              ) : (
                <>LAUNCH DRIP <Zap size={40} fill="white" /></>
              )}
            </motion.button>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase italic text-gray-400 tracking-widest">
                <CheckCircle size={12} /> Real-time sync with global storefront
            </div>
          </form>
        </div>
      </main>
    </>
  );
}