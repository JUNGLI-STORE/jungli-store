"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Ruler, PackageCheck, 
  Footprints, Zap, ShieldCheck, FileText 
} from 'lucide-react';

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem = ({ title, icon, children, defaultOpen = false }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b-4 border-black last:border-b-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center group text-left px-2"
      >
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-2 border-2 border-black group-hover:bg-jungli-orange transition-colors shadow-brutal-sm">
            {icon}
          </div>
          <span className="font-[1000] uppercase italic text-xl md:text-2xl tracking-tighter text-black">
            {title}
          </span>
        </div>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronDown size={28} strokeWidth={4} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-10 pt-2 px-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductAccordion({ product }: { product: any }) {
  return (
    <div className="mt-4 border-t-8 border-black">
      
      {/* 1. DESCRIPTION SECTION (The Story) */}
      <AccordionItem title="Description" icon={<FileText size={20} />} defaultOpen={true}>
        <div className="bg-gray-50 border-l-8 border-jungli-orange p-6 shadow-brutal-sm">
          {/* whitespace-pre-line is the critical fix for your formatting */}
          <p className="font-bold italic text-black leading-relaxed text-sm md:text-base uppercase whitespace-pre-line">
            {product.description || "Highest-tier materials, re-engineered street beast. Secure your pair before the stash runs dry."}
          </p>
        </div>
      </AccordionItem>

      {/* 2. BUILD REPORTS (Material Intel & Speciality) */}
      <AccordionItem title="Build Reports" icon={<Zap size={20} />}>
        <div className="grid grid-cols-1 gap-6">
          
          {/* 🛠 MATERIAL INTEL */}
          <div className="bg-white border-4 border-black p-5 shadow-brutal-sm">
            <h5 className="font-[1000] uppercase italic text-sm tracking-widest text-jungli-orange mb-4 flex items-center gap-2">
              <Zap size={16} fill="currentColor" /> 🛡️ MATERIAL INTEL
            </h5>
            <div className="space-y-4 font-black uppercase italic text-[11px]">
              <div className="border-l-4 border-black pl-4">
                <p className="text-gray-400 tracking-widest">Exterior Upper</p>
                <p className="text-black text-xs">
                  {product.materials_json?.upper || "Master-Grade Street Performance Synthetic"}
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-gray-400 tracking-widest">Interior Lining</p>
                <p className="text-black text-xs">
                  {product.materials_json?.footbed || "Sweat-Wick Technical Mesh (Breathable)"}
                </p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-gray-400 tracking-widest">Traction Unit</p>
                <p className="text-black text-xs">
                  {product.materials_json?.sole || "Triple-Cushioned High-Grip TPR Unit"}
                </p>
              </div>
            </div>
          </div>

          {/* ⚡ SPECIALITY (Quality Checkpoints) */}
          <div className="bg-black text-white border-4 border-black p-5 shadow-brutal-sm">
            <h5 className="font-[1000] uppercase italic text-sm tracking-widest text-yellow-400 mb-6 flex items-center gap-2">
              <ShieldCheck size={18} /> ⚡ SPECIALITY
            </h5>
            <ul className="space-y-4">
               {(product.bullet_points || [
                 "Reinforced heavy-duty street stitching",
                 "Indian feet-friendly spacious toe-box",
                 "Anti-scuff performance texture",
                 "All-day dual-density comfort cushioning"
               ]).map((point: string, i: number) => (
                 <li key={i} className="flex items-start gap-3">
                   <span className="text-jungli-orange font-black text-sm">⚡️</span>
                   <p className="font-black uppercase italic text-[11px] leading-tight tracking-tight">
                     {point}
                   </p>
                 </li>
               ))}
            </ul>
          </div>
        </div>

        {/* 📦 THE UNBOXING STASH (What's Inside) */}
        <div className="mt-8 bg-jungli-green text-white p-6 border-4 border-black shadow-brutal-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12"><PackageCheck size={120}/></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-white/20">
                  <PackageCheck size={24} className="text-yellow-400" />
                  <p className="font-[1000] italic text-lg uppercase tracking-tighter">THE UNBOXING STASH</p>
                </div>
                <p className="text-[10px] font-bold italic opacity-90 leading-relaxed uppercase tracking-widest">
                   Every pair of JUNGLI is secured in our signature <span className="text-yellow-400 font-[1000]">MATTE BLACK VAULT BOX</span>. 
                   Includes premium protective dust bags, authenticity cards, extra laces, 
                   and a limited edition keychain.
                </p>
            </div>
        </div>
      </AccordionItem>

      {/* 3. SIZE GUIDE (Yellow Grid Chart) */}
      <AccordionItem title="Size Guide" icon={<Ruler size={20} />}>
        <div className="bg-[#FFFFEE] border-4 border-black p-4 md:p-8 shadow-brutal relative overflow-hidden">
          {/* Yellow Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          <div className="relative z-10">
            <h4 className="text-3xl font-[1000] uppercase italic text-center mb-8 tracking-tighter text-black underline decoration-yellow-400 decoration-8 underline-offset-[-2px]">
                MEN'S SIZE CHART
            </h4>
            
            <div className="overflow-x-auto border-4 border-black shadow-brutal-sm bg-white">
              <table className="w-full text-center border-collapse min-w-[350px]">
                <thead>
                  <tr className="border-b-4 border-black bg-gray-50 uppercase text-[9px] font-black">
                    <th className="py-4 px-2 tracking-widest">Foot Length (CM)</th>
                    <th className="py-4 px-2 text-white bg-black border-x-4 border-black tracking-widest">UK / IND</th>
                    <th className="py-4 px-2 text-gray-400 tracking-widest">EURO</th>
                  </tr>
                </thead>
                <tbody className="font-black uppercase italic text-base">
                  {[
                    { cm: "24.6 - 25.2", uk: "6", eu: "40" },
                    { cm: "25.3 - 26.2", uk: "7", eu: "41" },
                    { cm: "26.3 - 27.3", uk: "8", eu: "42" },
                    { cm: "27.4 - 28.4", uk: "9", eu: "43" },
                    { cm: "28.5 - 29.5", uk: "10", eu: "44" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b-2 border-gray-100 hover:bg-yellow-100 transition-colors">
                      <td className="py-4 text-xs tracking-tighter">{row.cm}</td>
                      <td className="py-4 text-2xl font-[1000] text-black border-x-4 border-black bg-yellow-400/20">{row.uk}</td>
                      <td className="py-4 text-xs text-gray-300">{row.eu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-4 bg-white border-2 border-black border-dashed p-4">
                <Footprints size={24} className="text-jungli-orange" />
                <p className="text-[10px] font-bold uppercase leading-tight italic text-gray-600">
                    <span className="text-black font-black underline">HOW TO MEASURE:</span> Place your foot on a sheet of paper, mark heel and toe. Measure distance in CM and compare above.
                </p>
            </div>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}