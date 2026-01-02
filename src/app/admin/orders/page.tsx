"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Package, Truck, CheckCircle, Clock, ExternalLink, 
  Search, Filter, Smartphone, MapPin, User as UserIcon, Loader2 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // 1. ADMIN GATEKEEPER
  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
      } else {
        fetchOrders();
      }
    }
    checkAdmin();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  // 2. UPDATE ORDER STATUS LOGIC
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-jungli-orange" size={40} />
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-4 md:p-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none">
                ORDER <span className="text-jungli-orange">INTEL</span>
              </h1>
              <p className="mt-4 font-black uppercase italic text-gray-400">Total Revenue: ₹{orders.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString()}</p>
            </div>

            {/* Search within orders */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
              <div className="relative flex items-center bg-white border-4 border-black p-1">
                <Search className="ml-3" size={20} />
                <input 
                  placeholder="SEARCH NAME / PHONE..." 
                  className="w-full p-3 font-black uppercase italic outline-none text-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid gap-8">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  className="bg-white border-8 border-black p-6 md:p-10 shadow-brutal flex flex-col lg:flex-row gap-10 relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className={`absolute top-0 right-0 px-6 py-2 font-[1000] uppercase italic border-l-8 border-b-8 border-black 
                    ${order.status === 'paid' ? 'bg-green-400' : order.status === 'shipped' ? 'bg-blue-400' : 'bg-black text-white'}`}>
                    {order.status}
                  </div>

                  {/* Customer Block */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-jungli-orange">
                       <Clock size={16} />
                       <p className="font-black uppercase italic text-xs">
                         Placed {new Date(order.created_at).toLocaleString()}
                       </p>
                    </div>
                    
                    <h3 className="text-4xl font-[1000] uppercase italic leading-none">{order.customer_name}</h3>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-bold text-gray-600 uppercase italic text-sm">
                            <Smartphone size={16} className="text-black" /> {order.phone}
                        </div>
                        <div className="flex items-start gap-2 font-bold text-gray-600 uppercase italic text-sm">
                            <MapPin size={16} className="text-black mt-1 flex-shrink-0" /> 
                            <span>{order.address}, {order.pincode}</span>
                        </div>
                    </div>
                  </div>

                  {/* Items Block */}
                  <div className="flex-1 border-t-4 md:border-t-0 md:border-l-4 border-dashed border-gray-200 pt-6 md:pt-0 md:pl-10">
                    <p className="font-black uppercase italic text-xs mb-4 bg-yellow-400 inline-block px-2 border-2 border-black">Stash Content:</p>
                    <div className="space-y-4">
                        {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 border-2 border-black bg-gray-100">
                                    <img src={item.image} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-black uppercase italic text-sm leading-none">{item.name}</p>
                                    <p className="font-bold text-[10px] text-gray-400 mt-1 uppercase">SZ: {item.size} | QTY: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Action Block */}
                  <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                    <div className="text-center mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Total Collected</p>
                        <p className="text-3xl font-[1000] italic leading-none text-black">₹{order.total_amount.toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => updateStatus(order.id, 'shipped')}
                      className="bg-black text-white py-4 border-4 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> Mark Shipped
                    </button>
                    
                    <button 
                      onClick={() => updateStatus(order.id, 'delivered')}
                      className="bg-white text-black py-4 border-4 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Mark Delivered
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}