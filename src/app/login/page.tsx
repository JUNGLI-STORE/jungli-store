"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Mail, Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Trigger the Magic Link
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // This ensures that when the user clicks the link in their email,
          // they land directly on their order profile.
          emailRedirectTo: `${window.location.origin}/profile`, 
        },
      });

      if (error) {
        setMessage("ERROR: " + error.message.toUpperCase());
      } else {
        // 2. Success Feedback
        setMessage("STASH ACCESS SENT! CHECK YOUR INBOX.");
      }
    } catch (err) {
      setMessage("SYSTEM ERROR. TRY AGAIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-20">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full bg-white border-8 border-black p-10 shadow-brutal relative overflow-hidden"
        >
          {/* Top orange accent bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-jungli-orange" />
          
          <h1 className="text-5xl font-[1000] uppercase italic tracking-tighter mb-2">
            JOIN THE <span className="text-jungli-orange">JUNGLE</span>
          </h1>
          <p className="font-bold text-gray-500 italic mb-8 uppercase text-xs tracking-widest leading-tight">
            Enter your email to track your stash & get early access to limited drops.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              {/* Background shadow that moves on focus */}
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all"></div>
              
              <div className="relative flex items-center bg-white border-4 border-black p-1">
                <Mail className="ml-4 text-black" size={20} />
                <input 
                  type="email" 
                  placeholder="YOUR@EMAIL.COM" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 font-black uppercase italic outline-none placeholder:text-gray-300 text-lg"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black text-white text-2xl font-[1000] py-6 border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>GET MAGIC LINK <Zap size={24} fill="white"/></>
              )}
            </button>
          </form>

          {/* Dynamic Status Message */}
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="mt-8 font-black text-center text-black uppercase italic bg-yellow-400 p-4 border-4 border-black shadow-brutal-sm"
            >
              {message}
            </motion.div>
          )}

          {/* Footer detail */}
          <p className="mt-8 text-[10px] font-black text-gray-400 uppercase italic text-center">
            No password required. Pure frictionless drip.
          </p>
        </motion.div>
      </main>
    </>
  );
}