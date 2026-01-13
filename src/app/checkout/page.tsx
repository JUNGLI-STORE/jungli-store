"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Loader2, Lock, X, Tag, CheckCircle2, AlertCircle, Smartphone, Banknote } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function CheckoutPage() {
  const { cart, totalPrice, setIsCartOpen } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // PAYMENT & DISCOUNT STATES
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const upiDiscount = 50; // ₹50 Off for UPI
  const codFee = 50;      // ₹50 Extra for COD
  const [promoInput, setPromoInput] = useState("");
  const [activeHunterCode, setActiveHunterCode] = useState<string | null>(null);
  const [hunterDiscount, setHunterDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", pincode: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyPromo = async () => {
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const { data } = await supabase.from('hunters').select('promo_code, status').eq('promo_code', code).eq('status', 'active').single();
    if (data) {
      setActiveHunterCode(code);
      setHunterDiscount(100); 
    } else {
      setPromoError("INVALID CODE");
      setHunterDiscount(0);
      setActiveHunterCode(null);
    }
  };

  // DYNAMIC PRICING CALCULATION
  const totalDiscounts = hunterDiscount + (paymentMethod === 'UPI' ? upiDiscount : 0);
  const totalFees = (paymentMethod === 'COD' ? codFee : 0);
  const finalTotal = totalPrice - totalDiscounts + totalFees;

  const handleProcessOrder = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!formData.name || !formData.phone || !formData.pincode || !formData.address) {
      alert("PLEASE FILL ALL SHIPPING INTEL!");
      return;
    }

    setLoading(true);

    if (paymentMethod === 'UPI') {
      // --- RAZORPAY LIVE FLOW ---
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalTotal }),
        });
        const order = await response.json();
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Live Key ID in Vercel
          amount: order.amount,
          currency: "INR",
          name: "JUNGLI STORE",
          description: "Stash Secured via UPI",
          image: "/logo.svg",
          order_id: order.id,
          handler: async function (response: any) {
            await supabase.from('orders').insert([{
              customer_name: formData.name,
              email: user.email,
              phone: formData.phone,
              address: formData.address,
              pincode: formData.pincode,
              total_amount: finalTotal,
              payment_id: response.razorpay_payment_id,
              items: cart,
              status: 'paid',
              payment_method: 'UPI',
              applied_promo: activeHunterCode
            }]);
            if (activeHunterCode) await supabase.rpc('increment_hunter_sales', { code_param: activeHunterCode });
            window.location.href = "/success";
          },
          prefill: { contact: formData.phone, email: user.email },
          theme: { color: "#FF5F1F" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) { alert("Payment Failed"); }
      finally { setLoading(false); }

    } else {
      // --- CASH ON DELIVERY FLOW ---
      const { error } = await supabase.from('orders').insert([{
        customer_name: formData.name,
        email: user.email,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        total_amount: finalTotal,
        payment_id: 'COD_PENDING',
        items: cart,
        status: 'pending_cod',
        payment_method: 'COD',
        cod_fee: codFee,
        applied_promo: activeHunterCode
      }]);

      if (!error) {
        if (activeHunterCode) await supabase.rpc('increment_hunter_sales', { code_param: activeHunterCode });
        window.location.href = "/success";
      } else {
        alert("COD order failed");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      <Navbar />

      <main className="min-h-screen bg-gray-100 py-10 px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            {/* 1. SHIPPING INFO */}
            <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal">
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-8 text-black">1. Shipping <span className="text-jungli-orange">Intel</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 uppercase italic font-bold">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px]">Full Name</label>
                    <input name="name" onChange={handleInput} placeholder="YOUR NAME" className="p-4 border-2 border-black outline-none focus:bg-jungli-orange/5" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px]">Phone Number</label>
                    <input name="phone" onChange={handleInput} placeholder="99XXXXXX" className="p-4 border-2 border-black outline-none focus:bg-jungli-orange/5" />
                 </div>
                 <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[10px]">Address</label>
                    <textarea name="address" onChange={handleInput} placeholder="HOUSE NO, STREET, AREA..." className="p-4 border-2 border-black outline-none focus:bg-jungli-orange/5" rows={3} />
                 </div>
              </div>
            </section>

            {/* 2. PAYMENT METHOD SELECTOR */}
            <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal">
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-8 text-black text-center md:text-left">2. Choose Your <span className="text-jungli-orange">Mission</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* UPI Option */}
                <button 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-6 border-4 border-black flex flex-col items-center gap-3 transition-all relative
                    ${paymentMethod === 'UPI' ? 'bg-jungli-orange text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-brutal-sm hover:bg-orange-50'}`}
                >
                  <Smartphone size={32} />
                  <span className="font-[1000] uppercase italic">Pay via UPI</span>
                  <div className="bg-black text-white text-[10px] px-2 py-0.5 font-black border-2 border-white rotate-[-5deg]">SAVE ₹50 EXTRA</div>
                </button>

                {/* COD Option */}
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-6 border-4 border-black flex flex-col items-center gap-3 transition-all
                    ${paymentMethod === 'COD' ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-brutal-sm hover:bg-gray-50'}`}
                >
                  <Banknote size={32} />
                  <span className="font-[1000] uppercase italic">Cash on Delivery</span>
                  <span className="text-[10px] font-black opacity-60 italic">+ ₹50 SHIPPING FEE</span>
                </button>
              </div>
            </section>

            {/* 3. HUNTER CODE */}
            <section className="bg-yellow-400 border-4 border-black p-6 shadow-brutal-sm flex flex-col md:flex-row items-center gap-4">
               <Tag size={24} />
               <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="HUNTER CODE" className="flex-1 p-3 border-4 border-black font-black uppercase italic outline-none" />
               <button onClick={applyPromo} className="bg-black text-white px-8 py-3 border-2 border-black font-black uppercase italic">APPLY</button>
            </section>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="space-y-6">
            <section className="bg-white border-4 border-black p-6 shadow-brutal sticky top-32">
              <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2">Final Stash</h2>
              
              <div className="space-y-3 mb-8 uppercase font-black italic text-xs">
                 <div className="flex justify-between text-gray-400">
                    <span>Items Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                 </div>
                 {hunterDiscount > 0 && <div className="flex justify-between text-green-600"><span>Hunter Credit</span><span>- ₹{hunterDiscount}</span></div>}
                 
                 {paymentMethod === 'UPI' ? (
                   <div className="flex justify-between text-green-600 bg-green-50 p-1 border border-green-200">
                      <span>UPI MISSION DISCOUNT</span>
                      <span>- ₹{upiDiscount}</span>
                   </div>
                 ) : (
                   <div className="flex justify-between text-red-500 bg-red-50 p-1 border border-red-200">
                      <span>COD DELIVERY FEE</span>
                      <span>+ ₹{codFee}</span>
                   </div>
                 )}

                 <div className="flex justify-between text-3xl pt-4 border-t-8 border-black text-black">
                    <span className="tracking-tighter">Total</span>
                    <span className="text-jungli-orange animate-pulse">₹{finalTotal.toLocaleString()}</span>
                 </div>
              </div>

              <button 
                onClick={handleProcessOrder}
                disabled={loading || cart.length === 0}
                className="w-full bg-black text-white text-3xl font-[1000] py-6 border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  paymentMethod === 'UPI' ? "SECURE NOW" : "CONFIRM COD"
                )}
              </button>
              
              <p className="mt-4 text-[9px] font-bold text-gray-400 text-center uppercase italic">
                {paymentMethod === 'UPI' ? "Instant order processing" : "COD orders require WhatsApp verification"}
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}