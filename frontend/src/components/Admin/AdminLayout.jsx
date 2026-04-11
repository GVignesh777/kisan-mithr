import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  MessageCircle,
  Camera,
  LineChart,
  MapPin,
  Bell,
  MessageSquare,
  Activity,
  Menu,
  X,
  LogOut,
  Bot
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import useUserStore from '../../store/useUserStore';
import logo1 from '../../assets/logo1.jpg';

const menuItems = [
  { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin-dashboard/users', icon: Users },
  { name: 'Disease Reports', path: '/admin-dashboard/reports', icon: Camera },
  { name: 'AI Conversations', path: '/admin-dashboard/conversations', icon: MessageCircle },
  { name: 'Image Moderation', path: '/admin-dashboard/moderation', icon: ImageIcon },
  { name: 'Market Prices', path: '/admin-dashboard/market', icon: LineChart },
  { name: 'Analytics', path: '/admin-dashboard/analytics', icon: LineChart },
  { name: 'Farmer Locations', path: '/admin-dashboard/map', icon: MapPin },
  { name: 'Notifications', path: '/admin-dashboard/notifications', icon: Bell },
  { name: 'Feedback', path: '/admin-dashboard/feedback', icon: MessageSquare },
  { name: 'System Health', path: '/admin-dashboard/health', icon: Activity },
  { name: 'AI Assistant', path: '/admin-dashboard/ai', icon: Bot },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotif, setLatestNotif] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) {
        // Optional: keep it closed or auto-open on larger screens
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(res.data.count);
      setLatestNotif(res.data);
    } catch (err) {
      console.error('Failed to fetch unread count');
      if (err?.response?.status === 401) {
        // Corrupted or expired token detected, auto-purge the session safely
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminDetails');
        navigate('/admin-login');
      }
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminDetails');
    // Clear user tokens to prevent PublicRoute trapped loops
    localStorage.removeItem('auth_token');
    useUserStore.getState().clearUser();

    toast.info('Logged out from Admin Portal');
    navigate('/user-login'); // Explicitly requested by user
  };

  const handleNotificationClick = async () => {
    navigate('/admin-dashboard/notifications');
    if (unreadCount > 0) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/notifications/all/mark-read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to mark notifications as read');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden font-sans text-slate-900">
      {/* Sidebar Backdrop Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 288 : (isMobile ? 0 : 0),
          x: (isMobile && !isSidebarOpen) ? -288 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-800 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-24 px-8 shrink-0">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { navigate('/admin-dashboard'); if (isMobile) setIsSidebarOpen(false); }}>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              {/* <span className="font-black text-2xl text-white italic">K</span> */}
              {logo1 ? (
                <img src={logo1} />
              ) : (
                <span className="font-black text-2xl text-white italic">K</span>
              )}
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight leading-none text-white">KISAN MITHR</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mt-1">Admin Portal</p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Main Menu</p>
          </div>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin-dashboard');

            return (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`nav-item w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all relative group ${isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-emerald-400'
                  }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'group-hover:bg-emerald-400/10'} transition-colors`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                </div>
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-white shadow-lg">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-slate-500 truncate">admin@kisanmithr.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-widest border border-red-500/20 group"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Logout System
          </button>
        </div>
      </motion.aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 lg:px-12 z-40 sticky top-0 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block">
              <p className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.2em] mb-1">Navigation /</p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                {menuItems.find(item => item.path === location.pathname)?.name || 'System Overview'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden xl:flex items-center bg-slate-100/80 rounded-2xl px-5 py-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all w-72 group text-slate-900 overflow-hidden">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Quick Search..." className="bg-transparent border-none focus:ring-0 text-sm font-semibold ml-3 text-slate-700 w-full placeholder:text-slate-400" />
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="relative p-3 bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-slate-200 transition-all group active:scale-95 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <Bell className="w-6 h-6 group-hover:animate-swing" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-red-500 text-white text-[10px] font-black rounded-lg flex items-center justify-center px-1 border-4 border-white shadow-lg ring-2 ring-red-500/20 animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showTooltip && latestNotif?.latestMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 border border-slate-100 p-6 z-[100] ring-1 ring-slate-900/5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Latest from {latestNotif.latestSender || 'Farmer'}</span>
                      </div>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed italic line-clamp-3">
                        "{latestNotif.latestMessage}"
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400">Click to expand</span>
                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center"><svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl pl-3 pr-5 py-2 ring-1 ring-white">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden p-0.5">
                    <div className="w-full h-full rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xs">SA</div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">Super Admin</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 relative bg-[#f8fafc]">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-[1600px] mx-auto h-full"
          >
            <Outlet />
          </motion.div>

          <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
          <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes swing {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(5deg); }
          60% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-swing {
          animation: swing 1s ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .nav-item:hover {
          transform: translateX(4px);
        }
      `}} />
    </div>
  );
};

export default AdminLayout;
