"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Loader2, Lock, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, totalPrice, setIsCartOpen } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  // 1. Check Auth Status on load
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

  const handlePayment = async () => {
    // 2. THE LOGIN GUARD: Trigger popup if not logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.name || !formData.phone || !formData.pincode || !formData.address) {
      alert("Please fill in all shipping details!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "JUNGLI STORE",
        description: "Premium Sneaker Purchase",
        image: "/logo.svg", 
        order_id: order.id,
        handler: async function (response: any) {
          setLoading(true);
          const { error } = await supabase.from('orders').insert([{
            customer_name: formData.name,
            email: formData.email || user.email, // Use form email or auth email
            phone: formData.phone,
            address: formData.address,
            pincode: formData.pincode,
            total_amount: totalPrice,
            payment_id: response.razorpay_payment_id,
            items: cart,
            status: 'paid'
          }]);

          if (error) {
            console.error("Database Error:", error);
            alert("Payment success, but record failed. ID: " + response.razorpay_payment_id);
          } else {
            window.location.href = "/success";
          }
        },
        prefill: {
          name: formData.name,
          email: user?.email || formData.email,
          contact: formData.phone,
        },
        theme: { color: "#FF5F1F" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      <Navbar />

      {/* AUTH WARNING MODAL (Comic Style) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, rotate: 2 }}
              className="relative bg-white border-8 border-black p-10 max-w-sm w-full shadow-[15px_15px_0px_#FF5F1F] text-center"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 border-2 border-black p-1 hover:bg-black hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <div className="bg-yellow-400 w-20 h-20 border-4 border-black flex items-center justify-center mx-auto mb-6 -mt-20 rotate-12 shadow-brutal-sm text-black">
                <Lock size={40} />
              </div>

              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-4 leading-none text-black">
                HOLD UP!<br/><span className="text-jungli-orange">ACCESS DENIED</span>
              </h2>
              
              <p className="font-bold italic text-gray-500 mb-8 uppercase text-xs tracking-widest leading-relaxed">
                You must be part of the jungle to secure this drip. Login to finalize your order.
              </p>

              <button 
                onClick={() => router.push('/login')}
                className="w-full bg-black text-white py-5 border-4 border-black font-black uppercase italic shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Go to Login —&gt;
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          
          <Link href="/" className="inline-flex items-center gap-2 font-black uppercase italic mb-8 hover:text-jungli-orange transition-colors">
            <ArrowLeft size={20} /> Back to Hunting
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white border-4 border-black p-6 md:p-10 shadow-brutal">
                <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-8">
                  Shipping <span className="text-jungli-orange">Intel</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic">Full Name</label>
                    <input name="name" onChange={handleInput} type="text" placeholder="ARYAN SHARMA" className="p-4 border-2 border-black font-bold uppercase italic focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic">Email Address</label>
                    {/* FIXED: No forced uppercase for the email input field */}
                    <input 
                      name="email" 
                      onChange={handleInput} 
                      type="email" 
                      placeholder="your@email.com" 
                      className="p-4 border-2 border-black font-bold italic focus:bg-jungli-orange/5 outline-none shadow-brutal-sm placeholder:uppercase text-black" 
                    />
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
                    <label className="font-black uppercase text-xs italic">Detailed Address</label>
                    <textarea name="address" onChange={handleInput} rows={3} placeholder="HOUSE NO, STREET, LANDMARK..." className="p-4 border-2 border-black font-bold uppercase italic focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-4 bg-green-100 border-2 border-black p-4 italic font-bold text-sm">
                <ShieldCheck className="text-green-700" />
                Payments handled by Razorpay. 100% Secure Transaction.
              </div>
            </div>

            <div className="space-y-6">
              <section className="bg-white border-4 border-black p-6 shadow-brutal sticky top-32">
                <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2">Summary</h2>

                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <p className="font-bold text-gray-400 italic">Bag is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id + item.size} className="flex justify-between items-start gap-4 border-b-2 border-gray-100 pb-2">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 border-2 border-black flex-shrink-0 bg-gray-50">
                            <img src={item.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase leading-tight">{item.name}</p>
                            <p className="text-[10px] font-bold text-gray-500 italic uppercase">SIZE: {item.size} | QTY: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-black text-sm text-jungli-orange italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 mb-8 uppercase font-black italic text-sm">
                   <div className="flex justify-between text-2xl pt-4 border-t-4 border-black">
                      <span>Total</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                   </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-black text-white text-2xl font-[1000] py-6 border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50"
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