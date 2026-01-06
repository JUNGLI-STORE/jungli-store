"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, Edit3, Eye, EyeOff, Plus, Video, 
  Copy, BarChart3, Package, Users, ArrowUpRight, Search, X, 
  Image as ImageIcon, AlertCircle, ShoppingBag, Mail,Loader2
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
  const [viewMode, setViewMode] = useState<'all' | 'out-of-stock'>('all');
  const [stats, setStats] = useState({ revenue: 0, active: 0, outOfStock: 0, totalOrders: 0 });
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

  useEffect(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (viewMode === 'out-of-stock') {
      result = result.filter(p => p.is_available === false);
    }
    setFilteredProducts(result);
  }, [searchTerm, products, viewMode]);

  async function fetchData() {
    setLoading(true);
    const { data: productData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    
    const { data: orderData } = await supabase.from('orders').select('total_amount');
    
    if (productData) {
      setProducts(productData);
      setFilteredProducts(productData);
      const rev = orderData?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
      const active = productData.filter(p => p.is_available).length;
      const out = productData.filter(p => !p.is_available).length;
      setStats({ revenue: rev, active, outOfStock: out, totalOrders: orderData?.length || 0 });
    }
    setLoading(false);
  }

  // --- UPDATED TOGGLE LOGIC WITH EMAIL AUTOMATION ---
  const toggleStock = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // 1. Update the Product Status
    const { error } = await supabase
      .from('products')
      .update({ is_available: newStatus })
      .eq('id', id);

    if (error) {
      alert("DB Error: " + error.message);
      return;
    }

    // 2. If item is now BACK IN STOCK, trigger the Waitlist Emails
    if (newStatus === true) {
      const product = products.find(p => p.id === id);

      // Find all hunters waiting for this specific sneaker
      const { data: subscribers } = await supabase
        .from('restock_notifications')
        .select('email')
        .eq('product_id', id)
        .eq('notified', false);

      if (subscribers && subscribers.length > 0 && product) {
        // Trigger the professional email API we built
        const response = await fetch('/api/send-restock-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            subscribers, 
            productId: id,
            productName: product.name,
            productImage: product.image_url 
          })
        });

        if (response.ok) {
           // Mark them as notified so they don't get the email again
           await supabase
            .from('restock_notifications')
            .update({ notified: true })
            .eq('product_id', id);
           
           alert(`RESTOCK SUCCESS! ${subscribers.length} EMAILS BLASTED! 📧🔥`);
        }
      }
    }
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("ARE YOU SURE? THIS WILL REMOVE THE DRIP PERMANENTLY.")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin text-jungli-orange mx-auto mb-4" size={48} />
        <p className="font-[1000] text-2xl italic uppercase tracking-tighter text-black">Opening Vault...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-12 pb-40">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none text-black">
              MASTER <span className="text-jungli-orange">STASH</span>
            </h1>
            <p className="font-black uppercase italic text-gray-400 tracking-widest bg-white inline-block px-2 border-2 border-black">
              Inventory & Ops Command
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative group flex-1">
                  <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
                  <div className="relative flex items-center bg-white border-4 border-black p-1">
                      <Search className="ml-3 text-gray-400" size={20} />
                      <input 
                          placeholder="SEARCH MODEL..." 
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

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-yellow-400 border-8 border-black p-6 shadow-brutal flex items-center justify-between">
              <div><p className="text-xs font-[1000] uppercase italic opacity-60">Total Revenue</p><p className="text-4xl font-[1000] uppercase italic tracking-tighter">₹{stats.revenue.toLocaleString()}</p></div>
              <BarChart3 size={40} className="opacity-20" />
          </div>
          <div className="bg-black text-white border-8 border-black p-6 shadow-brutal flex items-center justify-between">
              <div><p className="text-xs font-[1000] uppercase italic opacity-60">In Stash</p><p className="text-4xl font-[1000] uppercase italic tracking-tighter">{stats.active}</p></div>
              <Package size={40} className="opacity-20 text-white" />
          </div>
          <div className="bg-white border-8 border-black p-6 shadow-brutal flex items-center justify-between">
              <div><p className="text-xs font-[1000] uppercase italic opacity-60 text-red-500">Out of Stash</p><p className="text-4xl font-[1000] uppercase italic tracking-tighter">{stats.outOfStock}</p></div>
              <AlertCircle size={40} className="opacity-20 text-red-500" />
          </div>
        </div>

        {/* STOCK MANAGER BAR */}
        <div className="mb-12 flex flex-col md:flex-row items-center gap-6 bg-white border-4 border-black p-4 shadow-brutal-sm">
          <p className="font-[1000] uppercase italic text-sm">Quick View:</p>
          <div className="flex bg-gray-100 p-1 border-2 border-black">
              <button onClick={() => setViewMode('all')} className={`px-8 py-2 font-black uppercase italic text-xs transition-all ${viewMode === 'all' ? 'bg-black text-white' : 'hover:bg-white text-black'}`}>
                All Items ({products.length})
              </button>
              <button onClick={() => setViewMode('out-of-stock')} className={`px-8 py-2 font-black uppercase italic text-xs transition-all flex items-center gap-2 ${viewMode === 'out-of-stock' ? 'bg-red-600 text-white shadow-inner' : 'hover:bg-white text-red-600'}`}>
                <ShoppingBag size={14} /> Sold Out ({stats.outOfStock})
              </button>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={product.id} 
                  className={`border-4 border-black p-4 flex flex-col md:flex-row items-center gap-8 shadow-brutal-sm hover:shadow-brutal transition-all ${product.is_available ? 'bg-white' : 'bg-gray-50 opacity-80'}`}
              >
                  <div className="w-28 h-28 border-4 border-black bg-gray-100 flex-shrink-0 relative overflow-hidden">
                      <img src={product.image_url} className={`w-full h-full object-contain p-1 ${!product.is_available && 'grayscale'}`} alt="" />
                      {!product.is_available && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-red-600 text-white font-black uppercase text-[8px] px-1 border-2 border-black rotate-[-10deg]">DEPLETED</span>
                          </div>
                      )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                      <span className="text-[10px] font-black uppercase text-jungli-orange tracking-widest bg-white px-2 border border-black italic">{product.brand || 'PREMIUM'}</span>
                      <h3 className="font-[1000] uppercase italic text-3xl leading-none text-black mt-2">{product.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Stocked Sizes: {product.available_sizes?.join(', ')}</p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                      <p className="text-[8px] font-black uppercase text-gray-400">Stock Switch</p>
                      <button onClick={() => toggleStock(product.id, product.is_available)}
                          className={`w-36 py-3 border-4 border-black font-[1000] uppercase italic text-xs shadow-brutal-sm transition-all active:scale-95
                              ${product.is_available ? 'bg-green-400' : 'bg-black text-red-500 border-red-500'}`}>
                          {product.is_available ? '✓ IN STASH' : '⚠ REFILL STASH'}
                      </button>
                  </div>

                  <div className="flex gap-2">
                      <button onClick={() => router.push(`/admin/add?editId=${product.id}`)} className="p-4 border-4 border-black bg-white hover:bg-yellow-400 transition-all shadow-brutal-sm"><Edit3 size={24} /></button>
                      <button onClick={() => router.push(`/admin/add?cloneId=${product.id}`)} className="p-4 border-4 border-black bg-white hover:bg-blue-400 transition-all shadow-brutal-sm"><Copy size={24} /></button>
                      <button onClick={() => deleteProduct(product.id)} className="p-4 border-4 border-black bg-white hover:bg-red-600 hover:text-white transition-all shadow-brutal-sm"><Trash2 size={24} /></button>
                  </div>
              </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}