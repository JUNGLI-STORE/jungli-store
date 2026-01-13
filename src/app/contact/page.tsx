"use client";
import { motion } from "framer-motion";
import { 
  Mail, Instagram, Clock, 
  MessageCircle, Phone, ArrowUpRight, Zap, AlertCircle 
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 md:px-6 flex flex-col items-center">
      <div className="max-w-5xl w-full">
        
        {/* HERO HEADER */}
        <div className="text-center mb-16 space-y-4">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="text-6xl md:text-8xl font-[1000] uppercase italic tracking-tighter leading-none"
            >
                ESTABLISH <span className="text-jungli-orange">COMMS</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-black uppercase italic text-gray-400 tracking-widest text-sm"
            >
                Direct lines to the Jungle Ops Team. No bots. Real Hunters.
            </motion.p>
        </div>

        {/* PRIMARY CONTACT OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* 1. WHATSAPP (Primary) */}
            <motion.a 
                href="https://wa.me/919713524844" 
                target="_blank"
                initial={{ x: -20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02, rotate: -1 }}
                className="group bg-[#25D366] border-8 border-black p-10 shadow-[15px_15px_0px_#000] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all cursor-pointer relative overflow-hidden"
            >
                {/* --- CUSTOM WHATSAPP ICON COMPOSITION --- */}
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
                    <div className="relative">
                        {/* The Chat Bubble */}
                        <MessageCircle size={130} strokeWidth={1.5} />
                        {/* The Phone Inside */}
                        <div className="absolute inset-0 flex items-center justify-center -ml-1 -mt-2">
                            <Phone size={60} strokeWidth={2.5} className="fill-current" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-black text-white w-fit px-3 py-1 font-black uppercase text-[10px] italic mb-4">
                        Fastest Response ⚡️
                    </div>
                    <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter text-black mb-2 flex items-center gap-3">
                        WhatsApp <ArrowUpRight size={32} />
                    </h2>
                    <p className="font-bold text-black/80 text-lg">+91 97135 24844</p>
                    <p className="font-black uppercase italic text-xs mt-6 text-black/60">
                        Tap to chat instantly regarding Orders & Sizes.
                    </p>
                </div>
            </motion.a>

            {/* 2. EMAIL (Secondary) */}
            <motion.a 
                href="mailto:junglistore.help@gmail.com"
                initial={{ x: 20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02, rotate: 1 }}
                className="group bg-white border-8 border-black p-10 shadow-[15px_15px_0px_#FF5F1F] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all cursor-pointer relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mail size={120} />
                </div>
                <div className="relative z-10">
                    <div className="bg-gray-100 border-2 border-black text-black w-fit px-3 py-1 font-black uppercase text-[10px] italic mb-4">
                        Official Inquiries
                    </div>
                    <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter text-black mb-2 flex items-center gap-3">
                        Email Ops <ArrowUpRight size={32} />
                    </h2>
                    <p className="font-bold text-gray-500 text-lg break-all">junglistore.help@gmail.com</p>
                    <p className="font-black uppercase italic text-xs mt-6 text-gray-400">
                        For bulk orders, detailed defects, or business.
                    </p>
                </div>
            </motion.a>
        </div>

        {/* IMPORTANT NOTE SECTION */}
        <div className="mb-12 border-4 border-black border-dashed bg-yellow-50 p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="bg-red-600 text-white p-3 border-4 border-black rotate-[-5deg] shadow-brutal-sm shrink-0">
                <AlertCircle size={32} />
            </div>
            <div>
                <h3 className="text-2xl font-[1000] uppercase italic text-black leading-none mb-2">
                    Reporting an Order Issue?
                </h3>
                <p className="font-bold uppercase italic text-sm text-gray-700 leading-relaxed">
                    To help us secure a fast resolution, please provide <span className="underline decoration-red-600 decoration-4 text-black font-black">FULL DETAILS</span> immediately.
                    <br/><br/>
                    <span className="bg-white border-2 border-black px-2 py-0.5 text-xs">Required Intel:</span> Attach clear images of the <span className="font-black">Bill / Invoice</span>, the <span className="font-black">Product</span>, and the <span className="font-black">Packaging</span>. 
                    The deeper the info you provide, the faster we can help.
                </p>
            </div>
        </div>

        {/* SECONDARY INFO GRID - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* TIMINGS */}
            <div className="bg-gray-100 p-8 border-4 border-black shadow-brutal-sm">
                <h3 className="text-xl font-[1000] uppercase italic mb-4 text-black flex items-center gap-3">
                    <Clock size={24} /> Ops Hours
                </h3>
                <p className="font-bold uppercase italic text-sm leading-loose text-gray-600">
                    Active 24x7 / 365 Days<br/>
                    <span className="text-green-600 font-[1000]">ALWAYS HUNTING.</span><br/>
                    We respond as soon as we see the signal.
                </p>
            </div>

            {/* SOCIAL */}
            <a href="https://instagram.com/jungli_store" target="_blank" className="bg-black text-white p-8 border-4 border-black shadow-brutal-sm hover:bg-jungli-orange transition-colors group">
                <h3 className="text-xl font-[1000] uppercase italic mb-4 flex items-center gap-3">
                    <Instagram size={24} /> Instagram
                </h3>
                <p className="font-bold uppercase italic text-sm leading-loose text-gray-400 group-hover:text-black/70">
                    Follow for Daily Drops & Flash Sales.<br/>
                    @jungli_store
                </p>
            </a>

        </div>

        {/* FOOTER NOTE */}
        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400 border-2 border-black px-4 py-2 rotate-[-2deg]">
                <Zap size={16} fill="black" />
                <span className="font-black uppercase italic text-xs">
                    Average Response Time: Less than 1 Hour
                </span>
            </div>
        </div>

      </div>
    </main>
  );
}