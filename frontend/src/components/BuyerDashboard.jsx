import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Wallet, Package, User, Settings, 
  BarChart3, Search, Bell, LogOut, Menu, X, 
  ArrowUpRight, TrendingUp, Clock, ShieldCheck,
  ChevronRight, Play, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useUserStore from "../store/useUserStore";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "../pages/more-section/LanguageSwitcher";
import logo from "../assets/logo.jpg";

const BuyerDashboard = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [scrolled, setScrolled] = useState(false);

  const userName = user?.username || user?.googleName || "Valued Buyer";
  const userRole = user?.role || "Premium Buyer";
  const profilePic = user?.profilePicture || user?.googlePhoto;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { title: "Total Procurement", value: "₹4.2L", change: "+12.5%", icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Active Orders", value: "18", change: "+3 today", icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Wallet Balance", value: "₹28,450", change: "Safe", icon: Wallet, color: "text-amber-400", bg: "bg-amber-500/10" },
    { title: "Price Savings", value: "₹12,200", change: "Top 5%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  const sidebarItems = [
    { name: "Dashboard", icon: BarChart3 },
    { name: "Marketplace", icon: ShoppingBag },
    { name: "My Orders", icon: Package },
    { name: "Inventory", icon: Clock },
    { name: "Payments", icon: Wallet },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    clearUser();
    navigate("/user-login");
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-50 bg-zinc-900/50 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out"
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-0.5 shadow-lg shadow-green-500/20 shrink-0">
              <img src={logo} alt="Logo" className="w-full h-full rounded-[10px] object-cover" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-xl tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400"
                >
                  Kisan Mithr
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
                    activeTab === item.name 
                    ? "bg-green-500 text-black font-bold shadow-lg shadow-green-500/20" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon size={22} className={activeTab === item.name ? "text-black" : "group-hover:scale-110 transition-transform"} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!isSidebarOpen && activeTab === item.name && (
                    <div className="absolute left-0 w-1 h-6 bg-black rounded-r-full"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer / User Section */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut size={22} className="group-hover:rotate-180 transition-transform duration-500" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Dashboard Header */}
        <header className={`sticky top-0 z-40 px-8 py-4 flex items-center justify-between transition-all duration-300 border-b ${
          scrolled ? "bg-zinc-950/80 backdrop-blur-md border-white/5 shadow-xl" : "bg-transparent border-transparent"
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors lg:flex hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{activeTab}</h2>
              <p className="text-xl font-bold text-white">Welcome back, {userName.split(' ')[0]} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search crops, orders..." 
                className="bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all w-64 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
               <LanguageSwitcher scrolled={true} />
               <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 relative group">
                  <Bell size={20} className="group-hover:shake" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-green-500 rounded-full border-2 border-zinc-950"></span>
               </button>
               <div className="h-8 w-px bg-white/10 mx-1"></div>
               <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden group-hover:border-green-500/50 transition-colors bg-gradient-to-br from-green-500/10 to-blue-500/10 p-0.5">
                    {profilePic ? (
                      <img src={profilePic} alt="User" className="w-full h-full rounded-[9px] object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-green-400 uppercase tracking-tighter shadow-inner">
                        {userName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-bold text-white leading-none">{userName}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{userRole}</p>
                  </div>
               </div>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Hero Banner Section */}
          <section className="relative h-48 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-green-950/20">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-400 group-hover:scale-105 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="relative z-10 h-full p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md border border-white/10 w-fit">
                <ShieldCheck size={12} /> Secure Trade Protocol Active
              </div>
              <h3 className="text-3xl font-black text-white leading-none mb-2 tracking-tight">Access Direct-Farm Sourcing</h3>
              <p className="text-white/80 font-medium opacity-90">Procure from 5,000+ verified farmers with blockchain-tracked quality assurance.</p>
            </div>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <ArrowUpRight className="absolute right-10 bottom-10 text-white opacity-40 group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all" size={32} />
          </section>

          {/* Key Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-800/40 transition-all group hover:border-white/10 group shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.title}</p>
                    <p className="text-2xl font-black text-white mt-1 tracking-tight">{stat.value}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest">Growth Rate</span>
                  <span className={`px-2 py-1 rounded-lg ${stat.change.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'} font-black`}>
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Lower Grid: Main Content Units */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
            
            {/* Recent Procurement Activity */}
            <section className="xl:col-span-2 bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h4 className="text-xl font-black text-white tracking-tight">Active Procurement</h4>
                   <p className="text-zinc-500 text-sm font-medium mt-1">Status of your ongoing cargo shipments</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                    <Filter size={18} className="text-zinc-400" />
                  </button>
                  <button className="bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/20">
                    View Archive
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identification</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Commodity Type</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Volume (KG)</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Capital Inbound</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Operation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { id: "#K772-B", crop: "Organic Tomatoes", qty: "1,200", price: "₹1,24,000", status: "In Transit", color: "text-blue-400", bg: "bg-blue-400/10" },
                      { id: "#K891-W", crop: "Premium Wheat", qty: "4,500", price: "₹2,10,000", status: "Processing", color: "text-amber-400", bg: "bg-amber-400/10" },
                      { id: "#K902-C", crop: "Basmati Rice", qty: "850", price: "₹92,500", status: "Verified", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { id: "#K114-X", crop: "Andhra Chilies", qty: "1,100", price: "₹1,55,000", status: "Delayed", color: "text-red-400", bg: "bg-red-400/10" },
                      { id: "#K221-A", crop: "Cotton Seeds", qty: "2,200", price: "₹88,000", status: "Processing", color: "text-amber-400", bg: "bg-amber-400/10" },
                    ].map((order, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="py-5 font-mono text-xs text-white group-hover:text-green-400 transition-colors font-bold">{order.id}</td>
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black">
                              {order.crop.charAt(0)}
                            </div>
                            <span className="text-sm font-bold opacity-90">{order.crop}</span>
                          </div>
                        </td>
                        <td className="py-5 font-mono text-sm text-zinc-400">{order.qty}</td>
                        <td className="py-5 font-black text-white">{order.price}</td>
                        <td className="py-5 text-right">
                          <span className={`${order.bg} ${order.color} px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-inner`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Side Panel: Insights & Wallet */}
            <div className="flex flex-col gap-8">
              
              {/* Card 1: Virtual Wallet */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white flex flex-col justify-between h-64 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Buyer Escrow Wallet</p>
                    <div className="w-12 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center flex-col gap-1 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-black tracking-tight mb-2">₹28,450.00</p>
                    <p className="text-xs font-mono opacity-60">ID: 4492-B821-KM</p>
                  </div>
                </div>
                <div className="relative z-10 flex gap-4 mt-4">
                  <button className="flex-1 py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Top Up</button>
                  <button className="flex-1 py-3 bg-white/20 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all backdrop-blur-md">Settings</button>
                </div>
              </div>

              {/* Card 2: Market Snapshot */}
              <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 flex-1 flex flex-col shadow-2xl">
                <h5 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                   <div className="p-2 bg-zinc-800 rounded-xl border border-white/5">
                      <TrendingUp size={18} className="text-green-500" />
                   </div>
                   Market Intelligence
                </h5>
                <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                   {[
                     { crop: "Cotton", price: "₹230/kg", trend: "up", change: "+4.2%" },
                     { crop: "Wheat", price: "₹45/kg", trend: "down", change: "-1.5%" },
                     { crop: "Paddy", price: "₹28/kg", trend: "up", change: "+2.1%" },
                     { crop: "Maize", price: "₹32/kg", trend: "stable", change: "0%" }
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-2 transition-transform">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover:bg-zinc-800">
                             <Play size={14} className="text-zinc-600 group-hover:text-green-500 transition-colors" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{item.crop}</p>
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{item.price}</p>
                           </div>
                        </div>
                        <div className={`text-right ${item.trend === 'up' ? 'text-green-400' : item.trend === 'down' ? 'text-red-400' : 'text-zinc-500'}`}>
                           <p className="text-xs font-black">{item.change}</p>
                           <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full py-4 mt-8 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 shadow-inner">
                  Open Global Market UI
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default BuyerDashboard;