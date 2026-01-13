"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Users, Zap, CheckCircle, XCircle, 
  Copy, ExternalLink, Smartphone, Wallet, 
  Search, ArrowUpRight, Loader2, Ban, ShieldCheck, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminScoutDashboard() {
  const [scouts, setScouts] = useState<any[]>([]);
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
        fetchScouts();
      }
    }
    init();
  }, [router]);

  async function fetchScouts() {
    const { data } = await supabase
      .from('hunters') // Database table remains 'hunters' for technical consistency
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setScouts(data);
    setLoading(false);
  }

  // 1. SMART STATUS TOGGLE (Approve / Ban / Unban)
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('hunters')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) fetchScouts();
  };

  // 2. PAYOUT LOGIC
  const handlePayout = async (scout: any) => {
    const amount = scout.pending_commission;
    if (amount <= 0) return alert("NO PENDING STASH TO PAY!");

    const utr = prompt(`Enter UPI Ref/UTR Number for ₹${amount} payment to ${scout.name}:`);
    if (!utr) return;

    const { error: payoutErr } = await supabase.from('hunter_payouts').insert([{
      hunter_id: scout.id,
      amount: amount,
      utr_number: utr
    }]);

    const { error: updateErr } = await supabase.from('hunters').update({
      pending_commission: 0,
      total_paid: (scout.total_paid || 0) + amount
    }).eq('id', scout.id);

    if (!payoutErr && !updateErr) {
      alert("PAYOUT LOGGED & STASH RESET! 💸");
      fetchScouts();
    }
  };

  const filteredScouts = scouts.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.promo_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-jungli-orange" size={48} />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-12 pb-40">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none">
              SCOUT <span className="text-jungli-orange">INTEL</span>
            </h1>
            <div className="mt-4 flex flex-wrap gap-3">
               <div className="bg-black text-white px-4 py-1 border-2 border-black font-black uppercase text-[10px] italic">
                  Total Debt: ₹{scouts.reduce((acc, curr) => acc + (curr.pending_commission || 0), 0).toLocaleString()}
               </div>
               <div className="bg-white text-black px-4 py-1 border-2 border-black font-black uppercase text-[10px] italic shadow-brutal-sm">
                  Active Scouts: {scouts.filter(s => s.status === 'active').length}
               </div>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-2 transition-all"></div>
            <div className="relative flex items-center bg-white border-4 border-black p-1">
              <Search className="ml-3 text-gray-400" size={20} />
              <input 
                placeholder="FIND SCOUT BY NAME / CODE..." 
                className="w-full p-3 font-black uppercase italic outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SCOUTS LIST */}
        <div className="grid gap-8">
          <AnimatePresence>
            {filteredScouts.map((scout) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={scout.id} 
                className={`bg-white border-8 border-black p-6 md:p-10 shadow-brutal flex flex-col lg:flex-row gap-10 relative overflow-hidden transition-opacity ${scout.status === 'banned' ? 'opacity-60 grayscale' : 'opacity-100'}`}
              >
                {/* Status Badge */}
                <div className={`absolute top-0 left-0 px-6 py-2 font-[1000] uppercase italic border-r-8 border-b-8 border-black 
                  ${scout.status === 'active' ? 'bg-green-400' : scout.status === 'pending' ? 'bg-yellow-400' : 'bg-red-600 text-white'}`}>
                  {scout.status === 'active' ? 'APPROVED' : scout.status}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-6 pt-6">
                  <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gray-100 border-4 border-black rounded-none flex items-center justify-center font-[1000] text-3xl italic shadow-brutal-sm uppercase">
                          {scout.name[0]}
                      </div>
                      <div>
                          <h3 className="text-4xl font-[1000] uppercase italic tracking-tighter leading-none">{scout.name}</h3>
                          <div className="flex gap-4 mt-3">
                            <a href={`https://instagram.com/${scout.insta_handle.replace('@','')}`} target="_blank" className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase italic flex items-center gap-1 hover:bg-jungli-orange transition-colors">
                                <ArrowUpRight size={10} /> {scout.insta_handle}
                            </a>
                            <span className="text-gray-400 font-black text-[10px] uppercase italic tracking-widest">{scout.followers_count} FOLLOWERS</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 font-black italic uppercase text-xs">
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-2 border-2 border-black">
                          <Smartphone size={16} className="text-black" /> {scout.contact_number}
                      </div>
                      <div 
                        className="flex items-center gap-2 text-black bg-yellow-50 px-3 py-2 border-2 border-black cursor-pointer hover:bg-yellow-100 transition-colors group"
                        onClick={() => {navigator.clipboard.writeText(scout.upi_id); alert('UPI INTEL COPIED!')}}
                      >
                          <Wallet size={16} className="text-jungli-orange" /> {scout.upi_id}
                          <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex-1 grid grid-cols-2 gap-4 border-t-4 lg:border-t-0 lg:border-l-4 border-black border-dashed pt-10 lg:pt-0 lg:pl-10">
                    <div className="bg-gray-100 p-6 border-4 border-black text-center shadow-brutal-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Hunters Brought</p>
                        <p className="text-4xl font-[1000] italic leading-none mt-1">{scout.total_sales}</p>
                    </div>
                    <div className="bg-black text-white p-6 border-4 border-black text-center shadow-[4px_4px_0px_#FF5F1F]">
                        <p className="text-[10px] font-black uppercase opacity-60">Pending Payout</p>
                        <p className="text-4xl font-[1000] italic leading-none text-jungli-orange mt-1">₹{scout.pending_commission}</p>
                    </div>
                </div>

                {/* Admin Controls */}
                <div className="flex flex-col gap-3 justify-center min-w-[220px]">
                  <div className="border-4 border-black p-4 bg-orange-50 text-center mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hunter Code</p>
                      <p className="text-2xl font-[1000] italic text-black">{scout.promo_code}</p>
                  </div>

                  {scout.status === 'pending' && (
                    <button 
                        onClick={() => updateStatus(scout.id, 'active')}
                        className="w-full bg-green-400 py-4 border-4 border-black font-[1000] uppercase italic text-sm shadow-brutal-sm hover:translate-x-1 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={18}/> Approve Scout
                    </button>
                  )}

                  <button 
                    onClick={() => handlePayout(scout)}
                    disabled={scout.pending_commission <= 0}
                    className="w-full bg-black text-white py-4 border-4 border-black font-[1000] uppercase italic text-sm shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-20"
                  >
                    <Zap size={18} fill="#FF5F1F" className="text-jungli-orange"/> Settle Stash
                  </button>

                  <div className="flex gap-2 mt-2">
                    {scout.status === 'banned' ? (
                      <button 
                        onClick={() => updateStatus(scout.id, 'active')}
                        className="flex-1 bg-white text-green-600 py-2 border-4 border-black font-black uppercase italic text-[10px] hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14}/> Unban Scout
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(scout.id, 'banned')}
                        className="flex-1 bg-white text-red-600 py-2 border-4 border-black font-black uppercase italic text-[10px] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Ban size={14}/> Ban Scout
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function CheckCircle2({size}: {size: number}) {
    return <CheckCircle size={size} />
}