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

  // 1. MAGIC LINK LOGIC
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // Redirects to our callback route which now defaults to /profile
          emailRedirectTo: `${window.location.origin}/auth/callback`, 
        },
      });

      if (error) {
        setMessage("ERROR: " + error.message.toUpperCase());
      } else {
        setMessage("STASH ACCESS SENT! CHECK YOUR INBOX.");
      }
    } catch (err) {
      setMessage("SYSTEM ERROR. TRY AGAIN.");
    } finally {
      setLoading(false);
    }
  };

  // 2. GOOGLE LOGIN LOGIC
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirects to our callback route which now defaults to /profile
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setMessage("GOOGLE ERROR: " + error.message.toUpperCase());
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
          <div className="absolute top-0 left-0 w-full h-2 bg-jungli-orange" />
          
          <h1 className="text-5xl font-[1000] uppercase italic tracking-tighter mb-2 text-black">
            JOIN THE <span className="text-jungli-orange">JUNGLE</span>
          </h1>
          <p className="font-bold text-gray-500 italic mb-8 uppercase text-xs tracking-widest leading-tight">
            Track your stash & get early access to limited drops.
          </p>

          {/* EMAIL FORM */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-all"></div>
              <div className="relative flex items-center bg-white border-4 border-black p-1">
                <Mail className="ml-4 text-black" size={20} />
                <input 
                  type="email" 
                  placeholder="YOUR@EMAIL.COM" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // FIXED: Removed 'uppercase' class. Added 'lowercase' for clarity.
                  // 'placeholder:uppercase' keeps the vibe of your design until they start typing.
                  className="w-full p-4 font-bold lowercase italic outline-none placeholder:uppercase text-black text-lg"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black text-white text-2xl font-[1000] py-6 border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>GET MAGIC LINK <Zap size={24} fill="white"/></>}
            </button>
          </form>

          {/* VISUAL SEPARATOR */}
          <div className="relative flex items-center my-10">
            <div className="flex-grow border-t-4 border-black"></div>
            <span className="mx-4 font-[1000] italic text-sm uppercase text-black">OR JOIN VIA</span>
            <div className="flex-grow border-t-4 border-black"></div>
          </div>

          {/* GOOGLE BUTTON */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full bg-white text-black text-xl font-[1000] py-5 border-4 border-black shadow-brutal hover:bg-yellow-400 hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic flex items-center justify-center gap-4 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
            Sign in with Google
          </button>

          {/* STATUS MESSAGE */}
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="mt-8 font-black text-center text-black uppercase italic bg-yellow-400 p-4 border-4 border-black shadow-brutal-sm"
            >
              {message}
            </motion.div>
          )}

          <p className="mt-8 text-[10px] font-black text-gray-400 uppercase italic text-center">
            No password required. Frictionless entrance.
          </p>
        </motion.div>
      </main>
    </>
  );
}