"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Edit3, Eye, EyeOff, Plus, Video } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // Instant Availability Toggle (No code needed later!)
  const toggleStock = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchProducts();
  };

  if (loading) return <div className="p-20 font-black italic">OPENING THE VAULT...</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex justify-between items-end mb-12">
            <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter">
              MASTER <span className="text-jungli-orange">STASH</span>
            </h1>
            <Link href="/admin/add" className="bg-black text-white px-8 py-4 border-4 border-black font-black uppercase italic shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
              <Plus size={20} /> Add New Drip
            </Link>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white border-4 border-black p-4 flex flex-col md:flex-row items-center gap-6 shadow-brutal-sm hover:shadow-brutal transition-all">
                
                {/* Product Thumbnail */}
                <div className="w-24 h-24 border-2 border-black bg-gray-100 flex-shrink-0 relative">
                  <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                  {product.video_url && <div className="absolute -top-2 -right-2 bg-black p-1 text-white"><Video size={12}/></div>}
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-black uppercase italic text-xl leading-none">{product.name}</h3>
                  <p className="font-bold text-jungli-orange mt-1">₹{product.jungli_price.toLocaleString()}</p>
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-1 border-2 border-black font-black uppercase italic text-[10px] 
                  ${product.is_available ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                  {product.is_available ? 'LIVE ON SITE' : 'OUT OF STOCK'}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStock(product.id, product.is_available)}
                    className="p-3 border-2 border-black hover:bg-yellow-400 transition-colors"
                    title="Toggle Visibility"
                  >
                    {product.is_available ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button className="p-3 border-2 border-black hover:bg-black hover:text-white transition-colors">
                    <Edit3 size={20} />
                  </button>
                  <button className="p-3 border-2 border-black hover:bg-red-600 hover:text-white transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}