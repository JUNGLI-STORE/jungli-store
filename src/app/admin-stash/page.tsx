"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Package, Truck, CheckCircle, Clock, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // REPLACE THIS with your own email
  const ADMIN_EMAIL = "your-email@gmail.com"; 

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); // Kick out non-admins
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }
    checkAuthAndFetch();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
    }
  };

  if (loading) return <div className="p-20 font-black italic">LOADING MASTER STASH...</div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter mb-12">
            ORDER <span className="text-jungli-orange">CONTROL</span>
          </h1>

          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border-4 border-black p-6 shadow-brutal flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 border-2 border-black font-black uppercase text-[10px] shadow-brutal-sm 
                      ${order.status === 'paid' ? 'bg-green-400' : order.status === 'shipped' ? 'bg-blue-400' : 'bg-yellow-400'}`}>
                      {order.status}
                    </span>
                    <p className="font-bold text-xs text-gray-400 uppercase">Ref: {order.payment_id}</p>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic">{order.customer_name}</h3>
                  <p className="font-bold text-gray-600">{order.address}, {order.pincode}</p>
                  <p className="font-bold text-jungli-orange mt-2">{order.phone}</p>
                </div>

                <div className="flex-1 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-black pt-4 md:pt-0 md:pl-6">
                  <p className="font-black uppercase text-xs mb-2">Items Bought:</p>
                  {order.items?.map((item: any, i: number) => (
                    <p key={i} className="font-bold italic text-sm text-gray-500">
                      • {item.name} (SZ: {item.size} | QTY: {item.quantity})
                    </p>
                  ))}
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <button 
                    onClick={() => updateStatus(order.id, 'shipped')}
                    className="bg-black text-white px-6 py-3 border-2 border-black font-black uppercase italic text-xs hover:bg-jungli-orange transition-all"
                  >
                    Mark Shipped
                  </button>
                  <button 
                    onClick={() => updateStatus(order.id, 'delivered')}
                    className="bg-white text-black px-6 py-3 border-2 border-black font-black uppercase italic text-xs hover:bg-green-400 transition-all"
                  >
                    Mark Delivered
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