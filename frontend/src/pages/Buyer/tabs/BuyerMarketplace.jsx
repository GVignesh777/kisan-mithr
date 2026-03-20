import React from "react";
import { Search, Filter, ShoppingBag, MapPin, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BuyerMarketplace = () => {
  const categories = ["All Crops", "Grains", "Vegetables", "Fruits", "Spices", "Oilseeds"];
  
  const crops = [
    { name: "Sonalika Wheat", price: "₹2,100/ क्विंटल", farmer: "Vikram Singh", location: "Punjab", rating: 4.8, stock: "500kg" },
    { name: "Basmati Rice", price: "₹4,500/ क्विंटल", farmer: "Amrit Pal", location: "Haryana", rating: 4.9, stock: "1000kg" },
    { name: "Desi Tomatoes", price: "₹1,200/ क्विंटल", farmer: "Rahul Kumar", location: "UP", rating: 4.5, stock: "200kg" },
    { name: "Andhra Chilies", price: "₹15,000/ क्विंटल", farmer: "Srinivas Rao", location: "Andhra", rating: 4.7, stock: "300kg" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Marketplace Explorer</h2>
           <p className="text-zinc-500 font-medium mt-1">Discover premium farm-direct commodities</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search specific crops..." 
                className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all w-64 text-sm"
              />
           </div>
           <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
              <Filter size={20} className="text-zinc-400" />
           </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
         {categories.map((cat, i) => (
           <button 
             key={i} 
             className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
               i === 0 ? "bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/20" : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:border-white/10"
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {crops.map((crop, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.05 }}
             className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden group hover:border-green-500/30 transition-all"
           >
             <div className="h-40 bg-zinc-800 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                   {crop.stock} Avail.
                </div>
             </div>
             <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-black text-white tracking-tight">{crop.name}</h3>
                   <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black">{crop.rating}</span>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold mb-4">
                   <MapPin size={12} /> {crop.location} • By {crop.farmer}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pricing</p>
                      <p className="text-sm font-black text-green-400">{crop.price}</p>
                   </div>
                   <button className="p-3 rounded-xl bg-green-500 text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20">
                      <ShoppingBag size={18} />
                   </button>
                </div>
             </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
};

export default BuyerMarketplace;
