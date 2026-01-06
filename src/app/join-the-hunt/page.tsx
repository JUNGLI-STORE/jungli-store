"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Instagram, Phone, User, Users, CheckCircle, Zap, ShieldCheck, CreditCard, Loader2 } from "lucide-react";

export default function JoinTheHunt() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    insta_id: "",
    followers: "",
    upi_id: "",
    agreed: false
  });

  // Auto-generate: Take handle, remove '@', add '100'
  const generatedCode = formData.insta_id 
    ? formData.insta_id.replace(/[@\s]/g, "").toUpperCase() + "100" 
    : "CODE100";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) return alert("You must agree to the Terms of the Hunt!");
    setLoading(true);

    const { error } = await supabase.from('hunters').insert([{
      name: formData.name,
      contact_number: formData.contact,
      insta_handle: formData.insta_id,
      followers_count: formData.followers,
      promo_code: generatedCode,
      upi_id: formData.upi_id,
      agreed_to_terms: true
    }]);

    if (!error) setSubmitted(true);
    else alert("Error: Maybe this Insta ID is already registered?");
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-8 border-black p-10 shadow-[15px_15px_0px_#FF5F1F] max-w-md">
            <Zap size={80} className="mx-auto text-jungli-orange mb-6 animate-bounce" />
            <h2 className="text-4xl font-[1000] uppercase italic mb-4">APPLICATION FILLED!</h2>
            <p className="font-bold text-gray-600 mb-8 italic uppercase text-sm">
              We are reviewing your profile. If you qualify for the JUNGLI CREW, your code <span className="text-jungli-orange underline">{generatedCode}</span> will be live within 24 hours.
            </p>
            <button onClick={() => window.location.href = "/"} className="w-full bg-black text-white py-4 border-4 border-black font-black uppercase italic shadow-brutal-sm hover:shadow-none transition-all">Back to Vault</button>
        </motion.div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-[1000] uppercase italic tracking-tighter text-black leading-none">
            JOIN THE <span className="text-jungli-orange">HUNTERS CLUB</span>
          </h1>
          <p className="font-black text-gray-400 italic mt-4 uppercase tracking-widest">India's #1 Sneaker Affiliate Movement</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-8 border-black p-8 md:p-12 shadow-brutal space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="font-black uppercase italic text-xs flex items-center gap-2 text-gray-400">Hunter Name</label>
              <input required placeholder="YOUR FULL NAME" className="w-full p-4 border-4 border-black font-[1000] uppercase italic outline-none focus:bg-jungli-orange/5" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase italic text-xs flex items-center gap-2 text-gray-400">WhatsApp Intel</label>
              <input required placeholder="PHONE NUMBER" className="w-full p-4 border-4 border-black font-[1000] uppercase italic outline-none focus:bg-jungli-orange/5" 
              onChange={e => setFormData({...formData, contact: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase italic text-xs flex items-center gap-2 text-gray-400">Instagram Handle</label>
              <input required placeholder="@USERNAME" className="w-full p-4 border-4 border-black font-[1000] uppercase italic outline-none focus:bg-jungli-orange/5" 
              onChange={e => setFormData({...formData, insta_id: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="font-black uppercase italic text-xs flex items-center gap-2 text-gray-400">Follower Count</label>
              <input required placeholder="E.G. 10K" className="w-full p-4 border-4 border-black font-[1000] uppercase italic outline-none focus:bg-jungli-orange/5" 
              onChange={e => setFormData({...formData, followers: e.target.value})} />
            </div>
          </div>

          <div className="bg-yellow-400 border-4 border-black p-6 shadow-brutal-sm">
            <h3 className="font-[1000] uppercase italic text-xl mb-4 flex items-center gap-2">
               <CreditCard /> Payout Intel
            </h3>
            <input required placeholder="YOUR UPI ID (e.g. name@okaxis)" className="w-full p-4 border-4 border-black font-black uppercase italic outline-none bg-white" 
            onChange={e => setFormData({...formData, upi_id: e.target.value})} />
            <p className="text-[10px] font-black uppercase italic mt-4 text-black/60">
              ⚡️ Commission  is settled on every Weekend via UPI.
            </p>
          </div>

          <div className="bg-black text-white p-6 border-4 border-black text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-jungli-orange animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-50">Your Unique Hunter Code</p>
              <p className="text-5xl font-[1000] italic text-jungli-orange tracking-tighter">{generatedCode}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border-2 border-black bg-gray-50">
                <input required type="checkbox" className="mt-1 w-6 h-6 border-4 border-black cursor-pointer accent-black" 
                onChange={e => setFormData({...formData, agreed: e.target.checked})} />
                <div className="text-[10px] font-bold uppercase italic text-gray-600 leading-tight">
                  
                    <ul>
                      <li>I declare that all intel provided is true.</li>
                      <li>I agree to promote JUNGLI ethically.</li>
                      <li>I agree to accept my payment via UPI</li>
                      <li> understand that payouts are only for <span className="text-black font-black">Successfully Delivered Orders</span>.</li>
                    </ul>
                </div>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-black text-white py-6 border-4 border-black font-[1000] text-3xl uppercase italic shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <>SEND APPLICATION <Zap size={28} fill="white" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}