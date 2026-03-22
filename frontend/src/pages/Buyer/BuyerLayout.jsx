import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Wallet, Package, User, Settings, 
  BarChart3, Search, Bell, LogOut, Menu, X, 
  Clock, ShieldCheck, Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import useUserStore from "../../store/useUserStore";
import LanguageSwitcher from "../more-section/LanguageSwitcher";
import logo from "../../assets/logo.jpg";

const BuyerLayout = () => {
  const { user, clearUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userName = user?.username || user?.googleName || "Valued Buyer";
  const userRole = user?.role || "Premium Buyer";
  const profilePic = user?.profilePicture || user?.googlePhoto;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sidebarItems = [
    { name: "Dashboard", icon: BarChart3, path: "/buyer-dashboard" },
    { name: "Browse Crops", icon: Leaf, path: "/buyer-dashboard/market" },
    { name: "My Orders", icon: Package, path: "/buyer-dashboard/orders" },
    { name: "Inventory", icon: Clock, path: "/buyer-dashboard/inventory" },
    { name: "Payments", icon: Wallet, path: "/buyer-dashboard/payments" },
    { name: "Profile", icon: User, path: "/buyer-dashboard/profile" },
    { name: "Settings", icon: Settings, path: "/buyer-dashboard/settings" },
  ];


  const handleLogout = () => {
    clearUser();
    navigate("/user-login");
  };

  const activeTab = sidebarItems.find(item => 
    item.path === location.pathname || (item.path === "/buyer-dashboard" && location.pathname === "/buyer-dashboard/")
  )?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (isMobile ? 0 : 80),
          x: isMobile && !isSidebarOpen ? -280 : 0
        }}
        className={`fixed lg:relative z-[70] h-full bg-zinc-900/90 lg:bg-zinc-900/50 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out overflow-hidden`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
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
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
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
                </Link>
              </li>
            ))}
          </ul>
        </nav>

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
        <header className={`sticky top-0 z-40 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between transition-all duration-300 border-b ${
          scrolled ? "bg-zinc-950/80 backdrop-blur-md border-white/5 shadow-xl" : "bg-transparent border-transparent"
        }`}>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-[10px] md:text-sm font-bold text-zinc-500 uppercase tracking-widest">{activeTab}</h2>
              <p className="text-base md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-none">
                {isMobile ? `Hi, ${userName.split(' ')[0]}` : `Welcome back, ${userName.split(' ')[0]} 👋`}
              </p>
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
            <div className="flex items-center gap-2 md:gap-3">
               <div className="hidden sm:block">
                 <LanguageSwitcher scrolled={true} />
               </div>
               <button className="p-2.5 md:p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 relative group">
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-green-500 rounded-full border-2 border-zinc-950"></span>
               </button>
               <div className="h-6 md:h-8 w-px bg-white/10 mx-1"></div>
               <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={() => navigate('/buyer-dashboard/profile')}>
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden group-hover:border-green-500/50 transition-colors bg-gradient-to-br from-green-500/10 to-blue-500/10 p-0.5">
                    {profilePic ? (
                      <img src={profilePic} alt="User" className="w-full h-full rounded-[9px] object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-green-400 uppercase tracking-tighter">
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

        {/* Dynamic Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
               className="h-full"
             >
               <Outlet />
             </motion.div>
          </AnimatePresence>
        </div>

      </main>

    </div>
  );
};

export default BuyerLayout;
