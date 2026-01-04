"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Ruler, Info, PackageCheck, Sparkles, Footprints, Zap } from 'lucide-react';

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
        className="w-full py-6 flex justify-between items-center group text-left"
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
            <div className="pb-10 pt-2 px-1">
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
    <div className="mt-12 border-t-8 border-black">
      
      {/* 1. SIZE GUIDE - EXACT RE-DESIGN */}
      <AccordionItem title="Size Guide" icon={<Ruler size={20} />}>
        <div className="bg-[#FFFFEE] border-4 border-black p-4 md:p-8 shadow-brutal relative overflow-hidden">
          {/* Yellow Grid Background Pattern */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>
          
          {/* Cloud Decor Detail */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-xl opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-xl opacity-60" />

          <div className="relative z-10">
            <h4 className="text-4xl font-[1000] uppercase italic text-center mb-8 tracking-tighter text-black underline decoration-yellow-400 decoration-8 underline-offset-[-2px]">
                MEN'S SIZE CHART
            </h4>
            
            <div className="overflow-x-auto border-4 border-black shadow-brutal-sm bg-white">
              <table className="w-full text-center border-collapse min-w-[400px]">
                <thead>
                  <tr className="border-b-4 border-black bg-gray-50 uppercase text-[10px] font-black tracking-[0.2em]">
                    <th className="py-4 px-2">Foot Length (CM)</th>
                    <th className="py-4 px-2 text-white bg-black border-x-4 border-black">UK / IND</th>
                    <th className="py-4 px-2">US (MEN)</th>
                    <th className="py-4 px-2 text-gray-400">EURO</th>
                  </tr>
                </thead>
                <tbody className="font-black uppercase italic text-lg">
                  {[
                    { cm: "24.6 - 25.2", uk: "6", us: "7", eu: "40" },
                    { cm: "25.3 - 26.2", uk: "7", us: "8", eu: "41" },
                    { cm: "26.3 - 27.3", uk: "8", us: "9", eu: "42" },
                    { cm: "27.4 - 28.4", uk: "9", us: "10", eu: "43" },
                    { cm: "28.5 - 29.5", uk: "10", us: "11", eu: "44" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b-2 border-gray-100 hover:bg-yellow-100 transition-colors">
                      <td className="py-4 text-sm">{row.cm}</td>
                      <td className="py-4 text-2xl font-[1000] text-black border-x-4 border-black bg-yellow-400/20">{row.uk}</td>
                      <td className="py-4 text-sm">{row.us}</td>
                      <td className="py-4 text-sm text-gray-300">{row.eu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-4 bg-white border-2 border-black border-dashed p-4">
                <Footprints size={24} className="text-jungli-orange" />
                <p className="text-[10px] font-bold uppercase leading-tight italic text-gray-600">
                    <span className="text-black font-black">HOW TO MEASURE:</span> Place your foot on a sheet of paper, mark the heel and the longest toe. Measure the distance in CM and compare above.
                </p>
            </div>
          </div>
        </div>
      </AccordionItem>

      {/* 2. BUILD REPORTS - HONEST QUALITY SPECS */}
      <AccordionItem title="Build Reports" icon={<Info size={20} />} defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Tech Specs Column */}
          <div className="space-y-8">
            <div>
              <h5 className="font-[1000] uppercase italic text-sm tracking-widest text-jungli-orange mb-4 flex items-center gap-2">
                <Zap size={16} fill="currentColor" /> MATERIAL INTEL
              </h5>
              <div className="space-y-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Exterior Upper</p>
                  <p className="font-bold italic text-sm">{product.materials_json?.upper || "Master-Grade Street Performance Synthetic"}</p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Interior Lining</p>
                  <p className="font-bold italic text-sm">{product.materials_json?.footbed || "Sweat-Wick Technical Mesh (Breathable)"}</p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Traction Unit</p>
                  <p className="font-bold italic text-sm">{product.materials_json?.sole || "Triple-Cushioned High-Grip TPR Unit"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-2 border-black p-4 rotate-[-1deg]">
               <h5 className="font-black uppercase italic text-[10px] mb-2 text-gray-400">Quality Checklist</h5>
               <ul className="space-y-2">
                 {(product.bullet_points || [
                   "Reinforced heavy-duty street stitching",
                   "Indian feet-friendly spacious toe-box",
                   "Anti-scuff performance texture",
                   "All-day dual-density comfort cushioning"
                 ]).map((point: string, i: number) => (
                   <li key={i} className="flex items-center gap-2 font-black uppercase italic text-[10px]">
                     <div className="w-1.5 h-1.5 bg-black rounded-full" /> {point}
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Unboxing Experience Column */}
          <div className="flex flex-col h-full">
            <div className="flex-1 bg-black text-white p-8 border-4 border-black shadow-brutal-sm relative group">
                {/* Visual Sparkle */}
                <Sparkles className="absolute top-4 right-4 text-yellow-400 group-hover:rotate-45 transition-transform" size={24} />
                
                <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-800">
                  <PackageCheck size={28} className="text-jungli-orange" />
                  <p className="font-[1000] italic text-xl uppercase tracking-tighter">THE UNBOXING STASH</p>
                </div>
                
                <p className="text-xs font-bold italic opacity-90 leading-loose uppercase tracking-wider mb-6">
                   Every pair of JUNGLI is secured in our signature <span className="text-jungli-orange">MATTE BLACK VAULT BOX</span>. 
                   <br/><br/>
                   <span className="text-white border-b-2 border-jungli-orange">INCLUDES:</span>
                   <br/>
                   • 2x High-Density Protective Dust Bags
                   <br/>
                   • 1x Authentication & Quality ID Card
                   <br/>
                   • 1x Extra Set of Cotton Flat Laces
                   <br/>
                   • 1x Limited Edition Jungli Keychain
                </p>

                <div className="mt-auto pt-4 border-t-2 border-gray-800 text-[9px] font-black uppercase text-gray-500 text-center">
                    Elevating the game from the moment you cut the tape.
                </div>
            </div>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}