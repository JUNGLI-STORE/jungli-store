"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // 1. Import Supabase client

export default function CheckoutPage() {
  const { cart, totalPrice, setIsCartOpen } = useCart();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!formData.name || !formData.phone || !formData.pincode || !formData.address) {
      alert("Please fill in all shipping details!");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Razorpay Order on Server
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || "Order creation failed");

      // 2. Initialize Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "JUNGLI STORE",
        description: "Premium Sneaker Purchase",
        image: "/logo.svg", 
        order_id: order.id,
        handler: async function (response: any) {
          // 3. THIS IS THE PRO STEP: Save to Supabase on Success
          setLoading(true);
          
          const { error } = await supabase.from('orders').insert([{
            customer_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            pincode: formData.pincode,
            total_amount: totalPrice,
            payment_id: response.razorpay_payment_id,
            items: cart, // Stores the array of shoes, sizes, and quantities
            status: 'paid'
          }]);

          if (error) {
            console.error("Database Error:", error);
            alert("Payment successful but failed to save order details. Please screenshot this: " + response.razorpay_payment_id);
          } else {
            // Redirect to success page
            window.location.href = "/success";
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#FF5F1F", // Jungli Orange
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      <Navbar />

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
                    <label className="font-black uppercase text-xs italic tracking-widest">Full Name</label>
                    <input name="name" onChange={handleInput} type="text" placeholder="e.g. Aryan Sharma" className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic tracking-widest">Email Address</label>
                    <input name="email" onChange={handleInput} type="email" placeholder="name@email.com" className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic tracking-widest">Phone (UPI Linked)</label>
                    <input name="phone" onChange={handleInput} type="text" placeholder="+91 XXXXX XXXXX" className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-black uppercase text-xs italic tracking-widest">Pincode</label>
                    <input name="pincode" onChange={handleInput} type="text" placeholder="110001" className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-black uppercase text-xs italic tracking-widest">Detailed Address</label>
                    <textarea name="address" onChange={handleInput} rows={3} placeholder="House No, Street, Landmark..." className="p-4 border-2 border-black font-bold focus:bg-jungli-orange/5 outline-none shadow-brutal-sm" required />
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-4 bg-green-100 border-2 border-black p-4 italic font-bold text-sm">
                <ShieldCheck className="text-green-700" />
                Payments are handled by Razorpay. Your data is 100% secure.
              </div>
            </div>

            <div className="space-y-6">
              <section className="bg-white border-4 border-black p-6 shadow-brutal sticky top-32">
                <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2">
                  Summary
                </h2>

                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <p className="font-bold text-gray-400 italic">Your bag is empty.</p>
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
                   <div className="flex justify-between">
                      <span className="text-gray-400">Items Total</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-green-600 font-black">FREE</span>
                   </div>
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
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>Pay Now <CreditCard size={24} /></>
                  )}
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}