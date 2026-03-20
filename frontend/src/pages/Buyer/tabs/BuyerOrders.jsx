import React from "react";
import { Package, Clock, CheckCircle2, AlertCircle, Search, FileText } from "lucide-react";

const BuyerOrders = () => {
  const orders = [
    { id: "ORD-K772-B", crop: "Organic Tomatoes", qty: "1,200 KG", total: "₹1,24,000", date: "Oct 24, 2026", status: "In Transit", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: "ORD-K891-W", crop: "Premium Wheat", qty: "4,500 KG", total: "₹2,10,000", date: "Oct 22, 2026", status: "Processing", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: "ORD-K902-C", crop: "Basmati Rice", qty: "850 KG", total: "₹92,500", date: "Oct 20, 2026", status: "Delivered", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: "ORD-K114-X", crop: "Andhra Chilies", qty: "1,100 KG", total: "₹1,55,000", date: "Oct 18, 2026", status: "Delayed", icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Order Management</h2>
           <p className="text-zinc-500 font-medium mt-1">Track and manage your procurement lifecycle</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search order ID..." 
                className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-green-500/20 w-64 text-sm"
              />
           </div>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5">
                     <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Order Details</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quantity</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Value</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {orders.map((order, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-all">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-xl ${order.bg} ${order.color}`}>
                                <Package size={20} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white">{order.crop}</p>
                                <p className="text-xs font-mono text-zinc-500 mt-1">{order.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-sm font-bold text-zinc-400">{order.date}</td>
                       <td className="px-8 py-6 text-sm font-bold text-zinc-400">{order.qty}</td>
                       <td className="px-8 py-6 text-base font-black text-white">{order.total}</td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end gap-2">
                             <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.bg} ${order.color}`}>
                                {order.status}
                             </span>
                             <button className="text-xs font-bold text-zinc-500 hover:text-green-400 flex items-center gap-1 transition-colors">
                                <FileText size={12} /> Invoice
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default BuyerOrders;
