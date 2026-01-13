"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Lock, Share2 } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-black text-white border-8 border-black p-10 shadow-brutal mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-jungli-orange opacity-10 rounded-full -mr-16 -mt-16" />
          <h1 className="text-6xl font-[1000] uppercase italic tracking-tighter leading-none mb-4">
            PRIVACY <span className="text-jungli-orange">INTEL</span>
          </h1>
          <p className="font-bold italic text-gray-400 uppercase tracking-widest text-sm">
            How we protect your data in the jungle.
          </p>
        </motion.div>

        {/* Content Block */}
        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-brutal space-y-12 text-black">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-jungli-orange">
                <Eye size={24} />
                <h2 className="text-2xl font-[1000] uppercase italic tracking-tight text-black">1. Information Collection</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-sm">
              When you secure a pair from JUNGLI, we collect your name, email, phone number, and shipping address. 
              If you log in via Google, we receive your basic profile info to speed up your hunt.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-jungli-orange">
                <ShieldCheck size={24} />
                <h2 className="text-2xl font-[1000] uppercase italic tracking-tight text-black">2. How We Use Your Stash Data</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-sm">
              We use your intel strictly to fulfill orders, process payments via Razorpay, and notify you of restocks via Resend. 
              We do not sell your personal data to third-party advertisers. Ever.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-jungli-orange">
                <Share2 size={24} />
                <h2 className="text-2xl font-[1000] uppercase italic tracking-tight text-black">3. Third-Party Operatives</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-sm">
              To keep the site "No Lag," we use Supabase for data storage and Vercel for hosting. 
              Your payment details are processed securely by Razorpay; JUNGLI never sees or stores your full card or UPI PIN.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-jungli-orange">
                <Lock size={24} />
                <h2 className="text-2xl font-[1000] uppercase italic tracking-tight text-black">4. Security Oath</h2>
            </div>
            <p className="font-bold text-gray-600 leading-relaxed uppercase text-sm italic border-l-4 border-black pl-4">
              All data transmitted is encrypted via SSL. We treat your personal info like a 1:1 Grail—with maximum respect.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-gray-100 p-6 border-2 border-black border-dashed">
            <h3 className="font-black uppercase text-xs mb-2">Questions or Data Deletion?</h3>
            <p className="font-bold text-sm">Contact the Stash Manager: <span className="underline text-jungli-orange lowercase">drop@jungli.store</span></p>
          </section>

        </div>

        <div className="mt-12 text-center">
            <p className="text-[10px] font-black uppercase text-gray-400 italic">Last Updated: January 2026</p>
        </div>
      </div>
    </main>
  );
}