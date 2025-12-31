"use client";
import { useEffect, useState } from "react";
import { User, Package, MapPin, LogOut, ChevronRight, Loader2} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getProfileAndOrders() {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 2. Fetch real orders from Supabase using the user's email
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', user.email) // Security: Only show orders for this email
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(orderData || []);
      }

      setLoading(false);
    }

    getProfileAndOrders();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-jungli-orange mb-4" size={40} />
        <p className="font-black uppercase italic tracking-widest text-gray-400">Verifying Identity...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* 1. SIDEBAR: USER INFO */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="bg-white border-4 border-black p-6 shadow-brutal flex flex-col items-center text-center"
            >
                <div className="w-24 h-24 bg-jungli-orange border-4 border-black rounded-full mb-4 flex items-center justify-center text-white font-black text-4xl italic shadow-brutal-sm">
                    {user?.email?.[0].toUpperCase()}
                </div>
                <h2 className="text-xl font-[1000] uppercase italic tracking-tighter break-all">
                  {user?.email?.split('@')[0]}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user?.email}</p>
            </motion.div>

            <nav className="bg-white border-4 border-black overflow-hidden shadow-brutal-sm">
                <button className="w-full flex items-center justify-between p-4 font-black uppercase italic border-b-4 border-black bg-yellow-400">
                    <div className="flex items-center gap-3">
                        <Package size={20} /> My Stash
                    </div>
                    <ChevronRight size={16} />
                </button>
                <button className="w-full flex items-center justify-between p-4 font-black uppercase italic border-b-2 border-black hover:bg-gray-50 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3 text-gray-400">
                        <MapPin size={20} /> Addresses
                    </div>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 font-black uppercase italic text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} /> Logout
                </button>
            </nav>
          </div>

          {/* 2. MAIN CONTENT: ORDER HISTORY */}
          <div className="lg:col-span-3 space-y-8">
            <section className="bg-white border-4 border-black p-8 shadow-brutal">
              <h3 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-8 underline decoration-jungli-orange decoration-8 underline-offset-4">
                RECENT DROPS
              </h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 border-4 border-dashed border-gray-200">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-2xl font-black text-gray-300 uppercase italic">Your Stash is Empty</p>
                  <button onClick={() => router.push('/')} className="mt-6 text-jungli-orange font-black underline uppercase italic">Go Hunt for drip</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <motion.div 
                      key={order.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="border-4 border-black p-6 relative group hover:bg-gray-50 transition-all bg-white shadow-brutal-sm"
                    >
                      <div className={`absolute top-4 right-4 text-white font-black px-3 py-1 text-[10px] border-2 border-black uppercase rotate-2 shadow-brutal-sm
                        ${order.status === 'paid' ? 'bg-green-600' : 'bg-black'}`}>
                        {order.status}
                      </div>
                      
                      <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Reference</p>
                              <h4 className="font-black uppercase italic text-lg leading-tight mb-4">#{order.payment_id?.slice(-10) || order.id.slice(0,8)}</h4>
                              
                              {/* Item Previews from JSONB column */}
                              <div className="flex flex-wrap gap-4 mt-4">
                                  {order.items?.map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 bg-gray-100 p-2 border-2 border-black">
                                          <img src={item.image} className="w-12 h-12 border-2 border-black bg-white object-cover" alt="" />
                                          <div>
                                              <p className="text-[10px] font-black uppercase leading-none">{item.name}</p>
                                              <p className="text-[8px] font-bold text-gray-500 italic mt-1">SZ: {item.size} | QTY: {item.quantity}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <div className="flex flex-col md:items-end justify-between border-t-2 md:border-t-0 md:border-l-2 border-dashed border-black pt-4 md:pt-0 md:pl-8">
                              <div className="text-left md:text-right">
                                  <p className="text-[10px] font-black text-gray-400 uppercase">Total Damage</p>
                                  <p className="text-3xl font-[1000] text-black italic leading-none">₹{order.total_amount.toLocaleString()}</p>
                                  <p className="text-[10px] font-bold text-gray-500 mt-2 italic">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <button className="mt-4 bg-black text-white px-8 py-3 border-2 border-black font-black uppercase italic text-xs shadow-brutal-hover hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                  Support
                              </button>
                          </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}