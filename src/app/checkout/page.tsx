"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { 
  ShieldCheck, Truck, ArrowLeft, CreditCard, 
  Loader2, Lock, X, Tag, CheckCircle2, 
  AlertCircle, Smartphone, Banknote 
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, totalPrice, setIsCartOpen } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // PAYMENT & DISCOUNT LOGIC
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const upiDiscountAmt = 50; 
  const codFeeAmt = 50;      
  
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

  // FINAL CALCULATIONS
  const deliveryCharge = paymentMethod === 'COD' ? codFeeAmt : 0;
  const upiDiscount = paymentMethod === 'UPI' ? upiDiscountAmt : 0;
  const finalTotal = totalPrice - hunterDiscount - upiDiscount + deliveryCharge;

  const handleProcessOrder = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!formData.name || !formData.phone || !formData.pincode || !formData.address) {
      alert("FILL ALL SHIPPING INTEL!");
      return;
    }

    setLoading(true);

    if (paymentMethod === 'UPI') {
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalTotal }),
        });
        const order = await response.json();
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
        applied_promo: activeHunterCode
      }]);

      if (!error) {
        if (activeHunterCode) await supabase.rpc('increment_hunter_sales', { code_param: activeHunterCode });
        window.location.href = "/success";
      } else { alert("COD order failed"); }
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAuthModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} className="relative bg-white border-8 border-black p-10 max-w-sm w-full shadow-[15px_15px_0px_#FF5F1F] text-center" >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-2 border-black p-1"><X size={20} /></button>
              <div className="bg-yellow-400 w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 -mt-20 rotate-12 shadow-brutal-sm"><Lock size={40} /></div>
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4 leading-none text-black">HOLD UP!<br/><span className="text-jungli-orange">ACCESS DENIED</span></h2>
              <p className="font-bold italic text-gray-500 mb-8 uppercase text-xs tracking-widest text-center">Join the jungle to secure this drip. Login to continue.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-5 border-4 border-black font-black uppercase shadow-brutal hover:translate-x-1 transition-all">Go to Login —&gt;</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-gray-100 py-10 px-4 md:px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* --- FORMS SECTION (Vertical Stack) --- */}
          <div className="space-y-8">
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
                    <textarea name="address" onChange={handleInput} placeholder="HOUSE NO, STREET, AREA..." className="p-4 border-2 border-black outline-none focus:bg-jungli-orange/5" rows={2} />
                 </div>
                 <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[10px]">Pincode</label>
                    <input name="pincode" onChange={handleInput} placeholder="000000" className="p-4 border-2 border-black outline-none focus:bg-jungli-orange/5" />
                 </div>
              </div>
            </section>

            <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal">
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-8 text-black">2. Payment <span className="text-jungli-orange">Mission</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setPaymentMethod('UPI')} className={`p-6 border-4 border-black flex flex-col items-center gap-3 transition-all ${paymentMethod === 'UPI' ? 'bg-jungli-orange text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-brutal-sm hover:bg-orange-50'}`}>
                  <Smartphone size={32} />
                  <span className="font-[1000] uppercase italic">Pay via UPI</span>
                  <div className="bg-black text-white text-[10px] px-2 py-0.5 font-black border-2 border-white rotate-[-5deg]">SAVE ₹50 EXTRA</div>
                </button>
                <button onClick={() => setPaymentMethod('COD')} className={`p-6 border-4 border-black flex flex-col items-center gap-3 transition-all ${paymentMethod === 'COD' ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-brutal-sm hover:bg-gray-50'}`}>
                  <Banknote size={32} />
                  <span className="font-[1000] uppercase italic">Cash on Delivery</span>
                  <span className="text-[10px] font-black opacity-60 italic">+ ₹50 SHIPPING FEE</span>
                </button>
              </div>
            </section>

            <section className="bg-yellow-400 border-4 border-black p-6 shadow-brutal-sm flex flex-col md:flex-row items-center gap-4">
               <Tag size={24} />
               <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="HUNTER CODE" className="flex-1 p-3 border-4 border-black font-black uppercase italic outline-none" />
               <button onClick={applyPromo} className="bg-black text-white px-8 py-3 border-2 border-black font-black uppercase italic hover:bg-white hover:text-black transition-all">APPLY</button>
            </section>
          </div>

          {/* --- THE REDESIGNED "WIDE & SHORT" FINAL STASH BOX --- */}
          <section className="bg-white border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              
              {/* LEFT SIDE: Breakdown */}
              <div className="flex-1 w-full space-y-4">
                 <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter mb-4 text-black leading-none">
                    FINAL <br/><span className="text-jungli-orange">STASH</span>
                 </h2>
                 <div className="h-1 bg-black w-20 mb-4" /> 

                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm md:text-base border-b border-dashed border-gray-300 pb-2">
                       <span className="font-[1000] uppercase italic text-gray-500">Items Total</span>
                       <span className="font-[1000] text-black">₹{totalPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm md:text-base border-b border-dashed border-gray-300 pb-2">
                       <span className="font-[1000] uppercase italic text-gray-500">Delivery</span>
                       <span className={`font-[1000] ${deliveryCharge === 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {deliveryCharge === 0 ? 'FREE' : `+ ₹${deliveryCharge}`}
                       </span>
                    </div>

                    {paymentMethod === 'UPI' && (
                       <div className="flex justify-between items-center text-sm md:text-base text-green-600 bg-green-50 px-2 py-1">
                           <span className="font-[1000] uppercase italic">UPI Discount</span>
                           <span className="font-[1000]">- ₹{upiDiscountAmt}</span>
                       </div>
                    )}
                    
                    {hunterDiscount > 0 && (
                       /* --- CHANGED TO GREEN STYLE HERE --- */
                       <div className="flex justify-between items-center text-sm md:text-base text-green-600 bg-green-50 px-2 py-1">
                           <span className="font-[1000] uppercase italic">Hunter Credit Applied</span>
                           <span className="font-[1000]">- ₹{hunterDiscount}</span>
                       </div>
                    )}
                 </div>
              </div>

              {/* RIGHT SIDE: Total & Action */}
              <div className="flex-1 w-full md:border-l-4 md:border-black md:pl-8 flex flex-col gap-4">
                 <div className="flex justify-between items-end md:block">
                    <p className="font-black uppercase italic text-xs text-gray-400 mb-1">Total Payable Amount</p>
                    <p className="text-6xl font-[1000] text-black italic tracking-tighter leading-none">
                      ₹{finalTotal.toLocaleString()}
                    </p>
                 </div>

                 <button 
                  onClick={handleProcessOrder}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-black text-white text-3xl font-[1000] py-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,95,31,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "SECURE NOW"}
                </button>
                
                <p className="text-center md:text-left font-black uppercase italic text-gray-400 text-[10px] tracking-widest">
                   {paymentMethod === 'UPI' ? '⚡️ Instant Processing' : '📞 Verification Call Required'}
                </p>
              </div>

            </div>
          </section>

        </div>
      </main>
    </>
  );
}