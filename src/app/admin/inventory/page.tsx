"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, Edit3, Eye, EyeOff, Plus, Video, 
  Copy, BarChart3, Package, Users, ArrowUpRight, Search, X, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ revenue: 0, active: 0, totalOrders: 0 });
  const router = useRouter();

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

  // Filter products locally as you type (No Lag)
  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  async function fetchData() {
    setLoading(true);
    // 1. Fetch Products
    const { data: productData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    
    // 2. Fetch Stats (From Orders table)
    const { data: orderData } = await supabase.from('orders').select('total_amount');
    
    if (productData) {
      setProducts(productData);
      setFilteredProducts(productData);
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
    if (window.confirm("ARE YOU SURE? THIS WILL REMOVE THE DRIP PERMANENTLY.")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="font-[1000] text-4xl animate-pulse italic uppercase tracking-tighter text-jungli-orange">Scanning Vault...</p>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-4 md:p-12 pb-40">
        <div className="max-w-7xl mx-auto">
          
          {/* 1. HEADER & ACTION BAR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none text-black">
                MASTER <span className="text-jungli-orange">STASH</span>
              </h1>
              <p className="font-black uppercase italic text-gray-400 tracking-widest bg-white inline-block px-2 border-2 border-black">
                Ops Command Center
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Search Field */}
                <div className="relative group flex-1">
                    <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all"></div>
                    <div className="relative flex items-center bg-white border-4 border-black p-1">
                        <Search className="ml-3 text-gray-400" size={20} />
                        <input 
                            placeholder="FIND MODEL / BRAND..." 
                            className="w-full p-3 font-black uppercase italic outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Link href="/admin/add" className="bg-jungli-orange text-white px-10 py-5 border-4 border-black font-[1000] text-xl uppercase italic shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
                  <Plus size={24} /> New Drop
                </Link>
            </div>
          </div>

          {/* 2. STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { label: "Total Revenue", val: `₹${stats.revenue.toLocaleString()}`, icon: BarChart3, color: "bg-yellow-400" },
              { label: "Active Drops", val: stats.active, icon: Package, color: "bg-black text-white" },
              { label: "Total Orders", val: stats.totalOrders, icon: Users, color: "bg-white text-black" },
            ].map((s, i) => (
              <div key={i} className={`${s.color} border-8 border-black p-8 shadow-brutal flex items-center justify-between`}>
                <div>
                  <p className="text-xs font-[1000] uppercase italic opacity-60 mb-1">{s.label}</p>
                  <p className="text-4xl font-[1000] uppercase italic tracking-tighter">{s.val}</p>
                </div>
                <s.icon size={40} className="opacity-20" />
              </div>
            ))}
          </div>

          {/* 3. INVENTORY LIST */}
          <div className="space-y-6">
            <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter border-l-8 border-jungli-orange pl-4 mb-8">Current Inventory ({filteredProducts.length})</h2>
            
            <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={product.id} 
                    className="bg-white border-4 border-black p-4 flex flex-col md:flex-row items-center gap-8 shadow-brutal-sm hover:shadow-brutal transition-all"
                >
                    {/* Visual Media Indicator */}
                    <div className="w-28 h-28 border-4 border-black bg-gray-100 flex-shrink-0 relative group overflow-hidden">
                        <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                        <div className="absolute top-1 left-1 flex gap-1">
                             {product.images?.length > 1 && <div className="bg-black text-white p-1 rounded-sm"><ImageIcon size={10}/></div>}
                             {product.video_urls?.length > 0 && <div className="bg-jungli-orange text-white p-1 rounded-sm"><Video size={10}/></div>}
                        </div>
                    </div>

                    {/* Shoe Info */}
                    <div className="flex-1 text-center md:text-left">
                        <span className="text-[10px] font-black uppercase text-jungli-orange tracking-widest bg-orange-50 px-2 border border-jungli-orange">
                            {product.brand || 'NO BRAND'}
                        </span>
                        <h3 className="font-[1000] uppercase italic text-3xl leading-none text-black mt-2">{product.name}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                            <span className="font-black text-2xl">₹{product.jungli_price.toLocaleString()}</span>
                            <span className="text-xs font-bold text-gray-300 line-through italic">₹{product.luxury_price.toLocaleString()}</span>
                            <span className="text-[10px] font-black bg-yellow-400 px-1 border border-black">{product.tag}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 italic">Sizes: {product.available_sizes?.join(', ')}</p>
                    </div>

                    {/* Stock Status Toggle */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[8px] font-black uppercase text-gray-400">Visibility</p>
                        <button 
                            onClick={() => toggleStock(product.id, product.is_available)}
                            className={`px-6 py-2 border-4 border-black font-black uppercase italic text-xs shadow-brutal-sm transition-all
                                ${product.is_available ? 'bg-green-400 hover:bg-green-500' : 'bg-red-500 text-white hover:bg-red-600'}`}
                        >
                            {product.is_available ? 'LIVE' : 'HIDDEN'}
                        </button>
                    </div>

                    {/* Action Suite */}
                    <div className="flex gap-2">
                        {/* EDIT BUTTON */}
                        <button 
                            onClick={() => router.push(`/admin/add?editId=${product.id}`)}
                            className="p-4 border-4 border-black hover:bg-yellow-400 transition-all shadow-brutal-sm active:translate-y-1"
                            title="Edit Drip"
                        >
                            <Edit3 size={24} />
                        </button>

                        {/* CLONE BUTTON */}
                        <button 
                            onClick={() => router.push(`/admin/add?cloneId=${product.id}`)}
                            className="p-4 border-4 border-black hover:bg-blue-400 transition-all shadow-brutal-sm active:translate-y-1"
                            title="Clone Colorway"
                        >
                            <Copy size={24} />
                        </button>

                        {/* PREVIEW BUTTON */}
                        <Link href={`/shop/${product.id}`} target="_blank" className="p-4 border-4 border-black hover:bg-black hover:text-white transition-all shadow-brutal-sm active:translate-y-1">
                            <ArrowUpRight size={24} />
                        </Link>

                        {/* DELETE BUTTON */}
                        <button 
                            onClick={() => deleteProduct(product.id)}
                            className="p-4 border-4 border-black hover:bg-red-600 hover:text-white transition-all shadow-brutal-sm active:translate-y-1"
                            title="Destroy"
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-40 bg-white border-8 border-dashed border-gray-200 shadow-brutal">
               <Package size={80} className="mx-auto text-gray-200 mb-4" />
               <p className="text-4xl font-[1000] uppercase italic text-gray-300">Vault No Results</p>
               <button onClick={() => setSearchTerm("")} className="mt-4 text-jungli-orange underline font-black uppercase italic">Show All Stash</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}