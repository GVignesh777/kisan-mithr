import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, FileImage, MessageSquare, TrendingUp, Clock, Activity } from 'lucide-react';

import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { toast } from 'react-toastify';

// Mock Data for charts until history API is wired fully
const userGrowthData = [
  { name: 'Mon', users: 400 },
  { name: 'Tue', users: 600 },
  { name: 'Wed', users: 800 },
  { name: 'Thu', users: 750 },
  { name: 'Fri', users: 1200 },
  { name: 'Sat', users: 1400 },
  { name: 'Sun', users: 1700 },
];

const diseaseTrendsData = [
  { name: 'Wheat Rust', count: 120 },
  { name: 'Rice Blast', count: 98 },
  { name: 'Late Blight', count: 86 },
  { name: 'Leaf Spot', count: 45 },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalQueries: 0,
    totalDiseaseReports: 0,
    totalImages: 0,
    activeUsersToday: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100/60 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[180px]"
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${color}`}></div>

      <div className="flex items-start justify-between relative z-10">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-emerald-100/50">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>

      <div className="mt-6 relative z-10">
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-slate-600 transition-colors">{title}</p>
        {isLoading ? (
          <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl"></div>
        ) : (
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-500">
            {value.toLocaleString()}
          </h3>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Good Evening, Admin 👋</h2>
          <p className="text-slate-500 font-bold mt-2">Here's what's happening with Kisan Mithr today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Farmers" value={stats.totalFarmers} icon={Users} color="bg-emerald-500 text-emerald-600" trend="+12%" delay={0.1} />
        <StatCard title="AI Queries" value={stats.totalQueries} icon={MessageSquare} color="bg-blue-500 text-blue-600" trend="+24%" delay={0.2} />
        <StatCard title="Disease Alerts" value={stats.totalDiseaseReports} icon={AlertTriangle} color="bg-amber-500 text-amber-600" trend="-5%" delay={0.3} />
        <StatCard title="Global Media" value={stats.totalImages} icon={FileImage} color="bg-purple-500 text-purple-600" trend="+8%" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="xl:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100/60 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-500" /> Platform Adoption
              </h3>
              <p className="text-sm text-slate-500 font-bold mt-1">Daily new user registration trends</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-4 py-2 text-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '12px 20px'
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: '900', fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Disease Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100/60 flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> Critical Issues
            </h3>
            <p className="text-sm text-slate-500 font-bold mt-1">Most frequent crop diseases detected</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={diseaseTrendsData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 8" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} width={100} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 12, 12, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Insight</span>
            </div>
            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
              "Wheat Rust cases have increased by 15% in the last 48 hours. Consider broadcast alert."
            </p>
          </div>
        </motion.div>
      </div>

      {/* System Health Status */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative group overflow-hidden rounded-[3rem] shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 group-hover:scale-105 transition-transform duration-700"></div>
        <div className="relative p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-xl group-hover:rotate-6 transition-transform duration-500">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-white tracking-tighter">Operational Excellence</h4>
              <p className="text-emerald-50/80 font-bold mt-1 text-lg">All core services are responding with <span className="text-white underline underline-offset-4">99.9% uptime</span>.</p>
            </div>
          </div>
          <div className="flex items-center gap-12 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-white/20 pt-8 lg:pt-0 lg:pl-12">
            <div className="text-center group-hover:scale-110 transition-transform">
              <p className="text-4xl font-black text-white tracking-tighter">{stats.activeUsersToday.toLocaleString()}</p>
              <p className="text-emerald-200/60 text-[10px] uppercase tracking-[0.2em] font-black mt-1">Live Users</p>
            </div>
            <div className="text-center group-hover:scale-110 transition-transform">
              <p className="text-4xl font-black text-white tracking-tighter">42ms</p>
              <p className="text-emerald-200/60 text-[10px] uppercase tracking-[0.2em] font-black mt-1">Latency</p>
            </div>
            <div className="text-center group-hover:scale-110 transition-transform">
              <p className="text-4xl font-black text-white tracking-tighter">Healthy</p>
              <p className="text-emerald-200/60 text-[10px] uppercase tracking-[0.2em] font-black mt-1">AI Node</p>
            </div>
          </div>
        </div>
    </motion.div>

    </div >
  );
};

export default AdminDashboard;
