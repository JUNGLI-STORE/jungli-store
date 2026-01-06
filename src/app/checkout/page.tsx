"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Loader2, Lock, X, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, totalPrice, setIsCartOpen } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // HUNTER PROMO STATES
  const [promoInput, setPromoInput] = useState("");
  const [activeHunterCode, setActiveHunterCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
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

  // 1. LOGIC: Validate Hunter Promo Code
  const applyPromo = async () => {
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    
    if (!code) return;

    // Check if hunter exists and is active
    const { data, error } = await supabase
      .from('hunters')
      .select('promo_code, status')
      .eq('promo_code', code)
      .eq('status', 'active')
      .single();

    if (data) {
      setActiveHunterCode(code);
      setDiscount(100); // Standard ₹100 discount
    } else {
      setPromoError("INVALID CODE: NO STASH DISCOUNT FOUND");
      setDiscount(0);
      setActiveHunterCode(null);
    }
  };

  const finalTotal = totalPrice - discount;

  const handlePayment = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.name || !formData.phone || !formData.pincode || !formData.address) {
      alert("MISSION FAILED: PLEASE FILL ALL SHIPPING INTEL!");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay Order with the DISCOUNTED amount
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "JUNGLI STORE",
        description: activeHunterCode ? `Hunter Code: ${activeHunterCode}` : "Standard Stash Purchase",
        image: "/logo.svg", 
        order_id: order.id,
        handler: async function (response: any) {
          setLoading(true);

          // 2. Save Order to Supabase with the Promo Code record
          const { error } = await supabase.from('orders').insert([{
            customer_name: formData.name,
            email: user?.email || formData.email, 
            phone: formData.phone,
            address: formData.address,
            pincode: formData.pincode,
            total_amount: finalTotal,
            payment_id: response.razorpay_payment_id,
            items: cart,
            status: 'paid',
            applied_promo: activeHunterCode // Link the sale to the Hunter
          }]);

          // 3. Increment Hunter sales and earnings automatically via RPC
          if (activeHunterCode) {
             await supabase.rpc('increment_hunter_sales', { code_param: activeHunterCode });
          }

          if (error) {
            console.error("Database Error:", error);
            alert("PAYMENT SUCCESS, BUT SYNC FAILED. ID: " + response.razorpay_payment_id);
          } else {
            window.location.href = "/success";
          }
        },
        prefill: {
          name: formData.name,
          email: user?.email,
          contact: formData.phone,
        },
        theme: { color: "#FF5F1F" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("SYSTEM ERROR. TRY AGAIN LATER.");
    } finally {
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
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-2 border-black p-1 hover:bg-black hover:text-white"><X size={20} /></button>
              <div className="bg-yellow-400 w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 -mt-20 rotate-12 shadow-brutal-sm text-black"><Lock size={40} /></div>
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4 leading-none">HOLD UP!<br/><span className="text-jungli-orange">ACCESS DENIED</span></h2>
              <p className="font-bold italic text-gray-500 mb-8 uppercase text-xs tracking-widest leading-relaxed text-center">Join the jungle to secure this drip. Login to continue.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-5 border-4 border-black font-black uppercase shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all italic">Go to Login —&gt;</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-gray-100 py-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          
          <Link href="/" className="inline-flex items-center gap-2 font-black uppercase italic mb-8 hover:text-jungli-orange transition-colors">
            <ArrowLeft size={20} /> Back to Hunting
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* SHIPPING FORM */}
              <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal">
                <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-8 text-black">Shipping <span className="text-jungli-orange">Intel</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic">Full Name</label>
                    <input name="name" onChange={handleInput} type="text" placeholder="YOUR NAME" className="p-4 border-2 border-black font-bold uppercase italic focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic">Email Address</label>
                    <input name="email" onChange={handleInput} type="email" placeholder="your@email.com" className="p-4 border-2 border-black font-bold outline-none shadow-brutal-sm text-black lowercase placeholder:uppercase italic" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic">Phone (UPI Linked)</label>
                    <input name="phone" onChange={handleInput} type="text" placeholder="+91 XXXXX XXXXX" className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic">Pincode</label>
                    <input name="pincode" onChange={handleInput} type="text" placeholder="110001" className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-black uppercase text-xs italic text-gray-400">Detailed Address</label>
                    <textarea name="address" onChange={handleInput} rows={3} placeholder="HOUSE NO, STREET, LANDMARK..." className="p-4 border-2 border-black font-bold uppercase italic focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                </div>
              </section>

              {/* HUNTER CODE SECTION */}
              <section className="bg-yellow-400 border-4 border-black p-6 shadow-brutal-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-3">
                  <Tag size={28} className="text-black" />
                  <div>
                    <p className="font-[1000] uppercase italic text-sm leading-none">Hunter Code?</p>
                    <p className="text-[8px] font-black text-black/50 uppercase mt-1">Get ₹100 Off Instantly</p>
                  </div>
                </div>
                
                <div className="flex flex-1 w-full gap-2 relative">
                   <input 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="ENTER CODE"
                    className="flex-1 p-3 border-4 border-black font-[1000] uppercase italic outline-none shadow-none text-black placeholder:text-black/20"
                   />
                   <button 
                    onClick={applyPromo}
                    className="bg-black text-white px-8 py-2 border-4 border-black font-[1000] uppercase italic text-sm hover:bg-white hover:text-black transition-all active:translate-y-1 active:shadow-none"
                   >
                     APPLY
                   </button>
                </div>

                {activeHunterCode && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-800 font-[1000] text-xs uppercase italic bg-white border-2 border-black px-3 py-1 shadow-brutal-sm">
                    <CheckCircle2 size={16} /> DISCOUNT SECURED
                  </motion.div>
                )}
                {promoError && (
                  <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase italic">
                    <AlertCircle size={14} /> {promoError}
                  </div>
                )}
              </section>

              <div className="flex items-center gap-4 bg-green-50 border-2 border-black p-4 italic font-bold text-sm text-green-800">
                <ShieldCheck size={24} />
                Payments handled by Razorpay. 100% Secure Transaction.
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="space-y-6">
              <section className="bg-white border-4 border-black p-6 shadow-brutal sticky top-32">
                <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2 text-black">Summary</h2>

                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id + item.size} className="flex justify-between items-start gap-4 border-b-2 border-gray-100 pb-2">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 border-2 border-black flex-shrink-0 bg-gray-50 overflow-hidden">
                          <img src={item.image} className="w-full h-full object-contain" alt="" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase leading-tight text-black">{item.name}</p>
                          <p className="text-[8px] font-bold text-gray-500 italic uppercase">SIZE: {item.size} | QTY: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-black text-sm text-jungli-orange italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-8 uppercase font-black italic text-sm text-black">
                   <div className="flex justify-between">
                      <span className="text-gray-400">Stash Total</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                   </div>
                   
                   {/* DISCOUNT LINE ITEM */}
                   <AnimatePresence>
                     {discount > 0 && (
                       <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-green-600">
                          <span>Hunter Credit</span>
                          <span>- ₹{discount}</span>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <div className="flex justify-between text-3xl pt-4 border-t-8 border-black">
                      <span className="tracking-tighter">Total</span>
                      <span className="text-jungli-orange">₹{finalTotal.toLocaleString()}</span>
                   </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-black text-white text-3xl font-[1000] py-6 border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Pay Now <CreditCard size={24} /></>}
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}