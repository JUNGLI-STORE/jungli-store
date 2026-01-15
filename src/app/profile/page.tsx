"use client";
import { useEffect, useState } from "react";
import { Package, User, MapPin, LogOut, ChevronRight, Loader2, ShoppingBag, Save, Settings, CheckCircle2 } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ username: "", full_name: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Get Session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/login");
          return;
        }
        setUser(authUser);

        // 2. Fetch Profile Details (Cleaned up logic)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle(); 

        if (profileData) {
          setProfile(profileData);
        } else {
          setProfile({ 
            username: authUser.email?.split('@')[0] || "hunter", 
            full_name: "" 
          });
        }

        // 3. Fetch Orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('email', authUser.email) 
          .order('created_at', { ascending: false });

        if (orderData) setOrders(orderData);
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: profile.username.toLowerCase().replace(/\s+/g, '_'),
        full_name: profile.full_name,
        updated_at: new Date(),
      });

    if (error) {
      alert("ERROR: Handle might be taken or invalid!");
    } else {
      alert("IDENTITY SECURED ⚡️");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-jungli-orange mb-4" size={40} />
        <p className="font-[1000] uppercase italic tracking-tighter text-gray-300 text-2xl animate-pulse">Syncing Stash...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BRANDED HEADER */}
        <div className="bg-white border-8 border-black p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-jungli-orange border-4 border-black rounded-full flex items-center justify-center text-white font-[1000] text-4xl italic shadow-brutal-sm">
                {profile?.username?.[0]?.toUpperCase() || user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-black leading-none mb-2">
                {profile?.full_name || "STASH HUNTER"}
              </h1>
              <p className="font-bold text-gray-400 uppercase text-xs italic tracking-widest lowercase">@{profile?.username || "hunter"}</p>
            </div>
          </div>
          
          {/* TAB CONTROLS */}
          <div className="flex bg-gray-100 border-4 border-black p-1 shadow-brutal-sm w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 md:flex-none px-8 py-3 font-[1000] uppercase italic text-xs transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'text-black hover:bg-white'}`}
            >
              My Stash
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 md:flex-none px-8 py-3 font-[1000] uppercase italic text-xs transition-all ${activeTab === 'settings' ? 'bg-black text-white' : 'text-black hover:bg-white'}`}
            >
              Settings
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1 space-y-6">
            <nav className="bg-white border-4 border-black overflow-hidden shadow-brutal-sm sticky top-32">
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between p-5 font-[1000] uppercase italic border-b-4 border-black transition-colors ${activeTab === 'orders' ? 'bg-yellow-400' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3"><Package size={20} /> Orders</div>
                    <ChevronRight size={16} />
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center justify-between p-5 font-[1000] uppercase italic border-b-4 border-black transition-colors ${activeTab === 'settings' ? 'bg-yellow-400' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3"><Settings size={20} /> Account</div>
                    <ChevronRight size={16} />
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-5 font-[1000] uppercase italic text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={20} /> Abandon Jungle
                </button>
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' ? (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal min-h-[500px]">
                    <h3 className="text-4xl font-[1000] uppercase italic tracking-tighter text-black mb-10 border-b-8 border-black pb-4">ORDER TRACKING</h3>
                    
                    {orders.length === 0 ? (
                      <div className="text-center py-24 bg-gray-50 border-4 border-dashed border-gray-200">
                        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-2xl font-[1000] text-gray-300 uppercase italic">Vault is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {orders.map((order) => (
                          <div key={order.id} className="border-4 border-black p-6 bg-white hover:shadow-brutal transition-all relative">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`px-3 py-1 border-2 border-black font-black uppercase text-[10px] italic shadow-brutal-sm 
                                      ${order.status === 'paid' ? 'bg-green-400' : 
                                        order.status === 'verified_cod' ? 'bg-purple-600 text-white' :
                                        order.status === 'pending_cod' ? 'bg-yellow-400' :
                                        'bg-blue-400 text-white'}`}>
                                        {order.status === 'pending_cod' ? 'COD PENDING' : 
                                         order.status === 'verified_cod' ? 'VERIFIED COD' : 
                                         order.status}
                                    </span>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">#{order.payment_id?.slice(-8)}</p>
                                </div>
                                <h4 className="text-2xl font-[1000] uppercase italic leading-none mb-6 text-black tracking-tighter">₹{order.total_amount.toLocaleString()}</h4>
                                
                                {/* TRACKING VISUALIZER (UPDATED LOGIC) */}
                                <div className="flex items-center gap-2 max-w-xs">
                                    {/* 1. Verified Dot */}
                                    <div className={`h-4 w-4 rounded-full border-2 border-black ${order.is_verified ? 'bg-black' : 'bg-white'}`} />
                                    
                                    <div className="h-1 flex-1 bg-black" />
                                    
                                    {/* 2. On Road Dot */}
                                    <div className={`h-4 w-4 rounded-full border-2 border-black ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-black' : 'bg-gray-100'}`} />
                                    
                                    <div className={`h-1 flex-1 ${order.status === 'delivered' ? 'bg-black' : 'bg-gray-100'}`} />
                                    
                                    {/* 3. Stashed (Delivered) Dot */}
                                    <div className={`h-4 w-4 rounded-full border-2 border-black ${order.status === 'delivered' ? 'bg-black' : 'bg-gray-100'}`} />
                                </div>
                                <div className="flex justify-between max-w-xs mt-2 text-[8px] font-black uppercase italic text-gray-500">
                                    <span className={order.is_verified ? "text-black" : ""}>Verified</span>
                                    <span className={order.status === 'shipped' ? "text-black" : "ml-4"}>On Road</span>
                                    <span className={order.status === 'delivered' ? "text-black" : ""}>Stashed</span>
                                </div>
                              </div>
                              
                              <div className="flex -space-x-4 h-fit self-center">
                                {order.items?.map((item: any, i: number) => (
                                  <img key={i} src={item.image} className="w-16 h-16 border-4 border-black bg-white object-contain" alt="" />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </motion.div>
              ) : (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal max-w-2xl min-h-[500px]">
                    <h3 className="text-4xl font-[1000] uppercase italic tracking-tighter text-black mb-10 border-b-8 border-black pb-4">ACCOUNT INTEL</h3>
                    
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="font-[1000] uppercase italic text-xs text-gray-400">Sneakerhead Handle (Username)</label>
                            <input 
                                value={profile.username}
                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                className="w-full p-4 border-4 border-black font-black uppercase italic outline-none focus:bg-jungli-orange/5 shadow-brutal-sm" 
                                placeholder="STASH_HUNTER_69"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-[1000] uppercase italic text-xs text-gray-400">Legal Identifier (Full Name)</label>
                            <input 
                                value={profile.full_name}
                                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                className="w-full p-4 border-4 border-black font-black uppercase italic outline-none focus:bg-jungli-orange/5 shadow-brutal-sm" 
                                placeholder="ARYAN SHARMA"
                            />
                        </div>

                        <button 
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="w-full bg-black text-white py-6 border-4 border-black font-[1000] uppercase italic text-2xl shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <><Save size={24} /> Update Identity</>}
                        </button>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}