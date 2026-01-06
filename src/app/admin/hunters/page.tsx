"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Users, Zap, CheckCircle, XCircle, 
  Copy, ExternalLink, Smartphone, Wallet, 
  Search, ArrowUpRight, Loader2, Ban 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHunterDashboard() {
  const [hunters, setHunters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const ADMIN_EMAIL = "2.0dandotiya@gmail.com"; 

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); 
      } else {
        fetchHunters();
      }
    }
    init();
  }, []);

  async function fetchHunters() {
    const { data } = await supabase
      .from('hunters')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setHunters(data);
    setLoading(false);
  }

  // 1. APPROVE / BAN LOGIC
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('hunters')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) fetchHunters();
  };

  // 2. PAYOUT LOGIC
  const handlePayout = async (hunter: any) => {
    const amount = hunter.pending_commission;
    if (amount <= 0) return alert("NO PENDING STASH TO PAY!");

    const utr = prompt(`Enter UPI Ref/UTR Number for ₹${amount} payment:`);
    if (!utr) return;

    // A. Add to Payout History
    const { error: payoutErr } = await supabase.from('hunter_payouts').insert([{
      hunter_id: hunter.id,
      amount: amount,
      utr_number: utr
    }]);

    // B. Reset pending and move to total_paid
    const { error: updateErr } = await supabase.from('hunters').update({
      pending_commission: 0,
      total_paid: hunter.total_paid + amount
    }).eq('id', hunter.id);

    if (!payoutErr && !updateErr) {
      alert("PAYOUT LOGGED! 💸");
      fetchHunters();
    }
  };

  const filteredHunters = hunters.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.promo_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-jungli-orange" size={40} /></div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 p-4 md:p-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none">
                HUNTER <span className="text-jungli-orange">INTEL</span>
              </h1>
              <div className="mt-4 flex gap-4">
                 <div className="bg-black text-white px-4 py-1 border-2 border-black font-black uppercase text-xs">
                    Total Payout Owed: ₹{hunters.reduce((acc, curr) => acc + curr.pending_commission, 0).toLocaleString()}
                 </div>
              </div>
            </div>

            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
              <div className="relative flex items-center bg-white border-4 border-black p-1">
                <Search className="ml-3" size={18} />
                <input 
                  placeholder="FIND HUNTER..." 
                  className="w-full p-3 font-black uppercase italic outline-none text-xs"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <AnimatePresence>
              {filteredHunters.map((hunter) => (
                <motion.div 
                  layout
                  key={hunter.id} 
                  className="bg-white border-8 border-black p-6 md:p-8 shadow-brutal flex flex-col lg:flex-row gap-8 relative overflow-hidden"
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 px-4 py-1 font-black text-[10px] uppercase italic border-r-4 border-b-4 border-black 
                    ${hunter.status === 'active' ? 'bg-green-400' : hunter.status === 'pending' ? 'bg-yellow-400' : 'bg-red-500 text-white'}`}>
                    {hunter.status}
                  </div>

                  {/* Profile Section */}
                  <div className="flex-1 space-y-4 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center font-[1000] text-2xl italic">
                            {hunter.name[0]}
                        </div>
                        <div>
                            <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-none">{hunter.name}</h3>
                            <a href={`https://instagram.com/${hunter.insta_handle.replace('@','')}`} target="_blank" className="text-jungli-orange font-black uppercase italic text-xs hover:underline flex items-center gap-1 mt-1">
                                <ArrowUpRight size={12} /> {hunter.insta_handle} ({hunter.followers_count})
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 bg-gray-50 border-2 border-black px-3 py-1 text-xs font-bold uppercase italic">
                            <Smartphone size={14}/> {hunter.contact_number}
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 border-2 border-black px-3 py-1 text-xs font-bold uppercase italic group cursor-pointer" onClick={() => {navigator.clipboard.writeText(hunter.upi_id); alert('UPI COPIED!')}}>
                            <Wallet size={14}/> {hunter.upi_id} <Copy size={12} className="opacity-40 group-hover:opacity-100"/>
                        </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="flex-1 grid grid-cols-2 gap-4 border-t-4 lg:border-t-0 lg:border-l-4 border-black border-dashed pt-6 lg:pt-0 lg:pl-8">
                    <div className="bg-gray-50 p-4 border-4 border-black">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Stashes Secured</p>
                        <p className="text-3xl font-[1000] italic leading-none">{hunter.total_sales}</p>
                    </div>
                    <div className="bg-black text-white p-4 border-4 border-black shadow-[4px_4px_0px_#FF5F1F]">
                        <p className="text-[10px] font-black uppercase opacity-60">Pending Stash</p>
                        <p className="text-3xl font-[1000] italic leading-none text-jungli-orange">₹{hunter.pending_commission}</p>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                    {hunter.status === 'pending' && (
                        <button onClick={() => updateStatus(hunter.id, 'active')} className="w-full bg-green-400 py-3 border-4 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:translate-x-1 transition-all flex items-center justify-center gap-2">
                            <CheckCircle size={16}/> Activate Hunter
                        </button>
                    )}
                    
                    <button 
                        onClick={() => handlePayout(hunter)}
                        disabled={hunter.pending_commission <= 0}
                        className="w-full bg-black text-white py-3 border-4 border-black font-black uppercase italic text-xs shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                    >
                        <Zap size={16} fill="#FF5F1F" className="text-jungli-orange"/> Settle Payout
                    </button>

                    <div className="flex gap-2">
                        <button onClick={() => updateStatus(hunter.id, 'banned')} className="flex-1 bg-white py-2 border-4 border-black font-black uppercase italic text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1">
                            <Ban size={12}/> Ban
                        </button>
                    </div>
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