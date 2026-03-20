import React from "react";
import { Settings, Shield, Bell, Lock, Smartphone, Palette, Globe } from "lucide-react";

const BuyerSettings = () => {
  const sections = [
    { title: "Security Matrix", icon: Shield, desc: "Manage authentication and encryption protocols" },
    { title: "Communication", icon: Bell, desc: "Real-time alert and notification preferences" },
    { title: "Device Sync", icon: Smartphone, desc: "Connected devices and login session logs" },
    { title: "Appearance", icon: Palette, desc: "HUD theme and layout configuration" },
    { title: "Regional Data", icon: Globe, desc: "Language and localized market nodes" },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
         <h2 className="text-3xl font-black text-white tracking-tight">System Configuration</h2>
         <p className="text-zinc-500 font-medium mt-1">Fine-tune your dashboard operational parameters</p>
      </div>

      <div className="space-y-4">
         {sections.map((section, i) => (
           <div key={i} className="group cursor-pointer bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:bg-zinc-800/40 hover:border-white/10 transition-all flex items-center justify-between">
              <div className="flex items-center gap-5">
                 <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-green-500/10 transition-colors">
                    <section.icon size={22} className="text-zinc-400 group-hover:text-green-400 transition-colors" />
                 </div>
                 <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{section.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{section.desc}</p>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Lock size={16} className="text-zinc-500" />
              </div>
           </div>
         ))}
      </div>

      <div className="pt-8 border-t border-white/5">
         <button className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            Deactivate Dashboard Node
         </button>
      </div>
    </div>
  );
};

export default BuyerSettings;
