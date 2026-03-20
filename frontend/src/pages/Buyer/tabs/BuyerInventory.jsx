import React from "react";
import { Clock, Download, Package, Filter, TrendingUp } from "lucide-react";

const BuyerInventory = () => {
  const stock = [
    { name: "Organic Tomatoes", qty: "12 Tons", location: "Warehouse A-12", health: "Optimal", color: "bg-green-500" },
    { name: "Mustard Seeds", qty: "5.5 Tons", location: "Hub Chennai", health: "Aging", color: "bg-amber-500" },
    { name: "Basmati Rice", qty: "20.2 Tons", location: "Global Port", health: "Optimal", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center text-left">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Stock Inventory</h2>
           <p className="text-zinc-500 font-medium mt-1">Monitor your procured commodities in storage</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
           <Download size={16} /> Export Sheet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {stock.map((item, i) => (
           <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-green-400 transition-colors">
                       <Package size={24} />
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest text-white ${item.color}`}>
                       {item.health}
                    </span>
                 </div>
                 <h4 className="text-xl font-black text-white tracking-tight leading-none mb-1">{item.name}</h4>
                 <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-6">{item.location}</p>
                 <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                       <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Available Volume</p>
                       <p className="text-base font-black text-white">{item.qty}</p>
                    </div>
                    <TrendingUp size={20} className="text-zinc-600" />
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default BuyerInventory;
