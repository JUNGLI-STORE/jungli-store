"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Truck, CheckCircle, Clock, Search, 
  Smartphone, MapPin, Loader2, Tag, 
  Mail, X, Archive, Ban, Trash2, AlertOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // TABS STATE
  const [activeTab, setActiveTab] = useState('all');

  const router = useRouter();
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
  }, [router]);

  async function fetchOrders() {
    // Fetch everything, including is_archived and is_verified
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  // 1. UPDATE STATUS (Ship, Deliver, Cancel)
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
    }
  };

  // 2. VERIFY COD ORDER (NEW)
  const verifyOrder = async (orderId: string) => {
    if(!confirm("Confirm that you have spoken to the customer?")) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ is_verified: true, status: 'verified_cod' }) 
      .eq('id', orderId);

    if (!error) {
        setOrders(orders.map(o => o.id === orderId ? {...o, is_verified: true, status: 'verified_cod'} : o));
    }
  };

  // 3. SOFT DELETE (Move to History)
  const archiveOrder = async (orderId: string) => {
    if(!confirm("Move to History? This hides it from the main list.")) return;

    const { error } = await supabase
      .from('orders')
      .update({ is_archived: true })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? {...o, is_archived: true} : o));
    }
  };

  // 4. HARD DELETE (Permanent Delete)
  const deletePermanently = async (orderId: string) => {
    if(!confirm("⚠️ PERMANENT DELETE: This cannot be undone. Are you sure?")) return;

    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    
    if (!error) {
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  // 5. FILTERING LOGIC
  const getFilteredOrders = () => {
    // First, filter by Search Term
    let filtered = orders.filter(o => 
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.phone?.includes(searchTerm) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then, filter by Tabs
    if (activeTab === 'history') {
        return filtered.filter(o => o.is_archived === true);
    } 
    
    // For all other tabs, exclude archived
    filtered = filtered.filter(o => o.is_archived === false);

    switch (activeTab) {
        case 'all': return filtered;
        case 'paid': return filtered.filter(o => o.status === 'paid' || o.payment_method === 'UPI');
        case 'cod': return filtered.filter(o => o.payment_method === 'COD');
        case 'shipped': return filtered.filter(o => o.status === 'shipped');
        case 'delivered': return filtered.filter(o => o.status === 'delivered');
        case 'cancelled': return filtered.filter(o => o.status === 'cancelled');
        default: return filtered;
    }
  };

  const displayOrders = getFilteredOrders();

  const TabButton = ({ id, label, color, count }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 font-[1000] uppercase italic text-xs md:text-sm border-r-4 border-black transition-all hover:bg-gray-100 flex-shrink-0
        ${activeTab === id ? `bg-${color}-100 border-b-4 border-b-${color}-500` : 'bg-white border-b-4 border-black'}
      `}
    >
      {label} <span className="bg-black text-white px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
    </button>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-jungli-orange" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-12 pb-40">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none">
              ORDER <span className="text-jungli-orange">OPS</span>
            </h1>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
            <div className="relative flex items-center bg-white border-4 border-black p-1">
              <Search className="ml-3 text-gray-400" size={20} />
              <input 
                placeholder="SEARCH NAME / EMAIL / ID..." 
                className="w-full p-3 font-black uppercase italic outline-none text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto border-4 border-black mb-10 bg-white custom-scrollbar">
            <TabButton id="all" label="All Active" color="gray" count={orders.filter(o => !o.is_archived).length} />
            <TabButton id="paid" label="Paid (UPI)" color="green" count={orders.filter(o => !o.is_archived && o.payment_method === 'UPI').length} />
            <TabButton id="cod" label="COD Ops" color="yellow" count={orders.filter(o => !o.is_archived && o.payment_method === 'COD').length} />
            <TabButton id="shipped" label="Shipped" color="blue" count={orders.filter(o => !o.is_archived && o.status === 'shipped').length} />
            <TabButton id="delivered" label="Delivered" color="green" count={orders.filter(o => !o.is_archived && o.status === 'delivered').length} />
            <TabButton id="cancelled" label="Cancelled" color="red" count={orders.filter(o => !o.is_archived && o.status === 'cancelled').length} />
            
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 font-[1000] uppercase italic text-xs md:text-sm transition-all ml-auto flex-shrink-0
                ${activeTab === 'history' ? 'bg-black text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}
              `}
            >
              <Archive size={16} /> History ({orders.filter(o => o.is_archived).length})
            </button>
        </div>

        {/* ORDERS LIST */}
        <div className="grid gap-8">
          <AnimatePresence mode="popLayout">
            {displayOrders.length === 0 ? (
                <div className="text-center py-20 bg-white border-4 border-dashed border-gray-300">
                    <p className="font-[1000] uppercase italic text-gray-300 text-2xl">No Orders Found in {activeTab}</p>
                </div>
            ) : (
              displayOrders.map((order) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={order.id} 
                  className={`bg-white border-8 border-black p-6 md:p-8 shadow-brutal flex flex-col lg:flex-row gap-8 relative overflow-hidden group
                    ${activeTab === 'history' ? 'opacity-70 grayscale hover:grayscale-0 transition-all' : ''}
                  `}
                >
                  {/* --- HISTORY / ARCHIVE BUTTON --- */}
                  {activeTab === 'history' ? (
                      <button 
                        onClick={() => deletePermanently(order.id)}
                        className="absolute top-0 right-0 bg-red-600 text-white p-3 border-l-4 border-b-4 border-black hover:bg-red-700 z-10"
                        title="Delete Permanently"
                      >
                        <X size={24} strokeWidth={3} />
                      </button>
                  ) : (
                      <button 
                        onClick={() => archiveOrder(order.id)}
                        className="absolute top-0 right-0 bg-gray-200 text-gray-500 p-2 border-l-4 border-b-4 border-black hover:bg-black hover:text-white z-10 transition-colors"
                        title="Archive to History"
                      >
                        <Archive size={20} />
                      </button>
                  )}

                  {/* STATUS BADGE */}
                  <div className={`absolute top-0 left-0 px-4 py-1 font-[1000] uppercase italic border-r-4 border-b-4 border-black text-[10px] tracking-widest
                    ${order.status === 'paid' ? 'bg-green-400' : 
                      order.status === 'pending_cod' ? 'bg-yellow-400' : 
                      order.status === 'verified_cod' ? 'bg-purple-600 text-white' :
                      order.status === 'shipped' ? 'bg-blue-400 text-white' : 
                      order.status === 'cancelled' ? 'bg-red-600 text-white' :
                      'bg-black text-white'}`}>
                    {order.status === 'pending_cod' ? 'COD PENDING' : 
                     order.status === 'verified_cod' ? 'VERIFIED COD' :
                     order.status}
                  </div>

                  {/* CUSTOMER INFO */}
                  <div className="flex-1 space-y-4 pt-6">
                    <div>
                        <h3 className="text-3xl font-[1000] uppercase italic leading-none text-black">{order.customer_name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-jungli-orange font-bold text-xs uppercase italic">
                            <Mail size={14} /> {order.email}
                        </div>
                    </div>
                    
                    {order.applied_promo && (
                        <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-400 px-2 py-1 text-xs font-black uppercase text-yellow-700">
                            <Tag size={12} /> Hunter Code: {order.applied_promo}
                        </div>
                    )}

                    <div className="space-y-1 pt-2 border-t-2 border-dashed border-gray-200">
                        <div className="flex items-center gap-2 font-bold text-gray-600 uppercase italic text-xs">
                            <Smartphone size={14} className="text-black" /> {order.phone}
                        </div>
                        <div className="flex items-start gap-2 font-bold text-gray-600 uppercase italic text-xs">
                            <MapPin size={14} className="text-black mt-0.5 flex-shrink-0" /> 
                            <span className="leading-tight">{order.address}, {order.pincode}</span>
                        </div>
                    </div>
                  </div>

                  {/* ORDER ITEMS */}
                  <div className="flex-1 lg:border-l-4 lg:border-dashed border-black lg:pl-8 pt-4 lg:pt-0">
                    <p className="font-black uppercase italic text-[10px] text-gray-400 mb-4 tracking-widest">Manifest ({order.items?.length})</p>
                    <div className="space-y-3">
                        {order.items?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-12 h-12 border-2 border-black bg-gray-50 flex-shrink-0">
                                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                                </div>
                                <div>
                                    <p className="font-[1000] uppercase italic text-xs leading-none">{item.name}</p>
                                    <p className="font-black text-gray-500 text-[10px]">
                                      UK {item.size} <span className="mx-1 text-gray-300">|</span> Qty: {item.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-black flex justify-between items-center">
                        <span className="font-black uppercase text-xs">Total Amount</span>
                        <span className="font-[1000] text-2xl italic text-jungli-orange">₹{order.total_amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Payment: {order.payment_method} | ID: {order.payment_id}</p>
                  </div>

                  {/* ACTIONS (Hidden in History) */}
                  {activeTab !== 'history' && (
                      <div className="flex flex-col gap-2 justify-center min-w-[180px] pt-4 lg:pt-0 border-t-4 lg:border-t-0 lg:border-l-4 border-black">
                        
                        {/* --- NEW: VERIFY COD BUTTON --- */}
                        {order.payment_method === 'COD' && !order.is_verified && (
                            <button 
                            onClick={() => verifyOrder(order.id)}
                            className="bg-purple-600 text-white py-3 border-2 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:translate-x-1 transition-all flex items-center justify-center gap-2"
                            >
                            <CheckCircle size={16} /> Verify Order
                            </button>
                        )}

                        {/* SHIP (Only if Paid OR Verified COD) */}
                        {(order.status === 'paid' || order.status === 'verified_cod') && (
                            <button 
                            onClick={() => updateStatus(order.id, 'shipped')}
                            className="bg-blue-600 text-white py-3 border-2 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:translate-x-1 transition-all flex items-center justify-center gap-2"
                            >
                            <Truck size={16} /> Ship Order
                            </button>
                        )}
                        
                        {/* DELIVER */}
                        {order.status === 'shipped' && (
                            <button 
                            onClick={() => updateStatus(order.id, 'delivered')}
                            className="bg-green-500 text-white py-3 border-2 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:translate-x-1 transition-all flex items-center justify-center gap-2"
                            >
                            <CheckCircle size={16} /> Mark Delivered
                            </button>
                        )}

                        {/* CANCEL (Available unless delivered) */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button 
                            onClick={() => {
                                if(confirm("Cancel this order? This will stop fulfillment.")) updateStatus(order.id, 'cancelled')
                            }}
                            className="bg-white text-red-600 py-3 border-2 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                            <Ban size={16} /> Cancel Order
                            </button>
                        )}

                        {/* STATUS DISPLAY if terminal state */}
                        {(order.status === 'delivered' || order.status === 'cancelled') && (
                            <div className={`text-center p-3 border-2 border-black font-black uppercase italic text-xs 
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                Order {order.status}
                            </div>
                        )}
                      </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}