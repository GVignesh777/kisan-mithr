import React from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, History, Landmark, CreditCard } from "lucide-react";

const BuyerPayments = () => {
  const transactions = [
    { type: "debit", label: "Payment for Order #K772", amount: "-₹1,24,000", date: "Today, 2:45 PM", status: "Success" },
    { type: "credit", label: "Wallet Top-up", amount: "+₹50,000", date: "Yesterday, 10:20 AM", status: "Success" },
    { type: "debit", label: "Brokerage Fee", amount: "-₹2,500", date: "Oct 22, 2026", status: "Success" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Escrow Balance</p>
                        <h3 className="text-5xl font-black mt-2 tracking-tight">₹28,450.00</h3>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                        <Wallet size={32} />
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button className="flex-1 py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">Add Capital</button>
                     <button className="flex-1 py-4 bg-indigo-500/30 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Withdraw</button>
                  </div>
               </div>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black text-white flex items-center gap-3">
                     <History className="text-zinc-500" /> Transaction Audit
                  </h4>
                  <button className="text-zinc-500 font-bold text-sm hover:text-white transition-colors">View All</button>
               </div>
               <div className="space-y-4">
                  {transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${tx.type === 'debit' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                             {tx.type === 'debit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{tx.label}</p>
                             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{tx.date}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-sm font-black ${tx.type === 'debit' ? 'text-white' : 'text-green-400'}`}>{tx.amount}</p>
                          <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{tx.status}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
               <h4 className="text-lg font-bold text-white mb-6 tracking-tight">Saved Methods</h4>
               <div className="space-y-4">
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-blue-500/30">
                     <div className="flex items-center gap-4">
                        <CreditCard className="text-zinc-400" />
                        <div>
                           <p className="text-sm font-bold text-white">HDFC Bank •••• 4492</p>
                           <p className="text-[10px] font-bold text-zinc-600 uppercase">Default Payout</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-white/20">
                     <div className="flex items-center gap-4">
                        <Landmark className="text-zinc-400" />
                        <div>
                           <p className="text-sm font-bold text-white">SBI Corp •••• 8821</p>
                           <p className="text-[10px] font-bold text-zinc-600 uppercase">Secondary</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8">
               <div className="flex items-center gap-3 text-emerald-400 mb-4">
                  <ShieldCheck size={24} />
                  <span className="font-black uppercase tracking-widest text-xs">Security Advisory</span>
               </div>
               <p className="text-emerald-400/80 text-sm font-medium leading-relaxed">
                  Escrow services are currently active. All payments are held securely until commodity verification is completed.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BuyerPayments;
