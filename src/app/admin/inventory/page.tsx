"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, Edit3, Eye, EyeOff, Plus, Video, 
  Copy, BarChart3, Package, Users, ArrowUpRight 
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, active: 0, totalOrders: 0 });
  const router = useRouter();

  // REPLACE THIS with your own email for security
  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }
      fetchData();
    }
    init();
  }, []);

  async function fetchData() {
    setLoading(true);
    // 1. Fetch Products
    const { data: productData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    
    // 2. Fetch Stats (From Orders table)
    const { data: orderData } = await supabase.from('orders').select('total_amount');
    
    if (productData) {
      setProducts(productData);
      const rev = orderData?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
      const active = productData.filter(p => p.is_available).length;
      setStats({ revenue: rev, active, totalOrders: orderData?.length || 0 });
    }
    setLoading(false);
  }

  const toggleStock = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', id);
    if (!error) fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("DELETE THIS STASH PERMANENTLY?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="font-[1000] text-4xl animate-bounce italic uppercase tracking-tighter text-gray-300">Opening Vault...</p>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-4 md:p-12">
        <div className="max-w-7xl mx-auto">
          
          {/* 1. HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none text-black">
                MASTER <span className="text-jungli-orange">STASH</span>
              </h1>
              <p className="mt-4 font-black uppercase italic text-gray-400 tracking-widest">Inventory & Ops Command</p>
            </div>
            <Link href="/admin/add" className="w-full md:w-auto bg-black text-white px-10 py-5 border-4 border-black font-[1000] text-xl uppercase italic shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
              <Plus size={24} /> New Drop
            </Link>
          </div>

          {/* 2. QUICK STATS BAR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Total Revenue", val: `₹${stats.revenue.toLocaleString()}`, icon: BarChart3, color: "bg-yellow-400" },
              { label: "Active Drops", val: stats.active, icon: Package, color: "bg-jungli-orange text-white" },
              { label: "Total Orders", val: stats.totalOrders, icon: Users, color: "bg-white" },
            ].map((s, i) => (
              <div key={i} className={`${s.color} border-4 border-black p-6 shadow-brutal-sm flex items-center justify-between`}>
                <div>
                  <p className="text-[10px] font-black uppercase italic opacity-80">{s.label}</p>
                  <p className="text-3xl font-[1000] uppercase italic">{s.val}</p>
                </div>
                <s.icon size={32} />
              </div>
            ))}
          </div>

          {/* 3. PRODUCT LIST */}
          <div className="grid gap-4">
            {products.map((product) => (
              <motion.div 
                layout
                key={product.id} 
                className="bg-white border-4 border-black p-4 flex flex-col md:flex-row items-center gap-6 shadow-brutal-sm hover:shadow-brutal transition-all"
              >
                {/* Image */}
                <div className="w-24 h-24 border-4 border-black bg-gray-100 flex-shrink-0 relative group">
                  <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                  {product.video_url && (
                    <div className="absolute -top-2 -right-2 bg-black text-white p-1 border-2 border-white shadow-brutal-sm">
                      <Video size={12}/>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase italic leading-none mb-1">{product.brand || 'No Brand'}</p>
                  <h3 className="font-[1000] uppercase italic text-2xl leading-none text-black">{product.name}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                    <span className="font-black text-jungli-orange">₹{product.jungli_price.toLocaleString()}</span>
                    <span className="text-xs font-bold text-gray-300 line-through">₹{product.luxury_price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Status */}
                <div className={`px-4 py-2 border-4 border-black font-black uppercase italic text-xs shadow-brutal-sm
                  ${product.is_available ? 'bg-green-400' : 'bg-red-500 text-white'}`}>
                  {product.is_available ? 'LIVE' : 'SOLD OUT'}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 flex-wrap justify-center">
                  <button 
                    onClick={() => toggleStock(product.id, product.is_available)}
                    className="p-3 border-2 border-black hover:bg-yellow-400 transition-all shadow-brutal-sm active:translate-y-0.5"
                    title="Toggle Stock"
                  >
                    {product.is_available ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                  {/* CLONE BUTTON: Redirects with cloneId */}
                  <button 
                    onClick={() => router.push(`/admin/add?cloneId=${product.id}`)}
                    className="p-3 border-2 border-black hover:bg-blue-400 transition-all shadow-brutal-sm active:translate-y-0.5"
                    title="Clone Product"
                  >
                    <Copy size={20} />
                  </button>

                  <Link href={`/shop/${product.id}`} target="_blank" className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm active:translate-y-0.5">
                    <ArrowUpRight size={20} />
                  </Link>

                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-3 border-2 border-black hover:bg-red-600 hover:text-white transition-all shadow-brutal-sm active:translate-y-0.5"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-20 border-8 border-dashed border-gray-200">
               <p className="text-4xl font-[1000] uppercase italic text-gray-200">Vault is empty</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}