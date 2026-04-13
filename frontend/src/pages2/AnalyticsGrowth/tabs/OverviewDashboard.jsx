import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Sprout, TrendingUp, CircleDollarSign, Activity, ArrowUpRight, ArrowDownRight, PlusCircle, LayoutGrid, CreditCard } from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import DataFormModal from '../components/DataFormModal';
import { useAuth } from '../../../context/AuthContext';

const OverviewDashboard = ({ overviewData, loading, onRefresh }) => {
  const [trends, setTrends] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('farm');

  const { user } = useAuth();

  useEffect(() => {
    const fetchTrends = async () => {
      if (!user) return; // 🚫 Block API if not logged in

      try {
        const res = await axiosInstance.get('/analytics/financial-trends');
        setTrends(res.data.data);
      } catch (error) {
        if (error.response?.status === 401) return; // 🔇 Silent fail
        console.error("Trends error:", error);
      }
    };
    
    if (user) {
      fetchTrends();
    }
  }, [user]);

  const openForm = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-zinc-800 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-800 animate-pulse rounded-3xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-zinc-800 animate-pulse rounded-3xl"></div>
          <div className="h-[400px] bg-zinc-800 animate-pulse rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      title: "Total Land", 
      value: overviewData?.totalLand || "0 Acres", 
      sub: "Active profiling", 
      icon: Sprout, 
      trend: overviewData?.totalLand ? "Recorded" : "Missing",
      positive: !!overviewData?.totalLand 
    },
    { 
      title: "Active Crops", 
      value: overviewData?.activeCropsCount || 0, 
      sub: "Current season", 
      icon: TrendingUp, 
      trend: `${overviewData?.activeCropsCount || 0} Crops`, 
      positive: true 
    },
    { 
      title: "Net Profit", 
      value: `₹${(overviewData?.netProfit || 0).toLocaleString()}`, 
      sub: "Real-time returns", 
      icon: CircleDollarSign, 
      trend: "Current", 
      positive: (overviewData?.netProfit || 0) >= 0 
    },
    { 
      title: "Farm Score", 
      value: `${overviewData?.healthScore || 0}/100`, 
      sub: "System analysis", 
      icon: Activity, 
      trend: "Calculated", 
      positive: true 
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Farm Overview</h2>
          <p className="text-zinc-400 mt-1">Production-ready agricultural intelligence</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openForm('farm')}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-green-500/50 rounded-2xl transition-all text-sm font-bold text-white"
          >
            <PlusCircle className="w-4 h-4 text-green-400" />
            Add Farm Data
          </button>
          <button 
            onClick={() => openForm('crop')}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-2xl transition-all text-sm font-bold text-black shadow-lg shadow-green-500/20"
          >
            <LayoutGrid className="w-4 h-4" />
            Add Crop
          </button>
        </div>
      </div>

      {!overviewData?.hasData && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-8 rounded-[2.5rem] mb-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Welcome to your Smart Dashboard!</h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">To generate precise analytics and insights, we need some details about your farm. Let's get started!</p>
          <button 
            onClick={() => openForm('farm')}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-2xl shadow-xl shadow-green-500/20 transition-all active:scale-95"
          >
            Get Started with Farm Profile
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 p-7 rounded-[2rem] relative overflow-hidden group hover:border-green-500/30 transition-all shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-green-500/20 transition-all">
                  <Icon className="w-6 h-6 text-green-400" />
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-xl ${kpi.positive ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {kpi.trend}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-1">{kpi.value}</h3>
                <p className="text-zinc-500 text-sm font-medium">{kpi.title}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{kpi.sub}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Financial Trends</h3>
              <p className="text-zinc-500 text-sm">Income vs Expenses based on your inputs</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-zinc-400">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-zinc-400">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full" style={{ minHeight: "350px" }}>
            {trends && trends.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
  
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val>=1000 ? val/1000+'k' : val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Action Center / Quick Stats */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
           <div>
            <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>
            <p className="text-zinc-500 text-sm mb-8">Maintain record accuracy</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => openForm('expense')}
                className="w-full flex items-center justify-between p-5 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-green-500/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 rounded-xl">
                    <CreditCard className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="font-bold text-white">Log Expense</span>
                </div>
                <PlusCircle className="w-5 h-5 text-zinc-600 group-hover:text-green-500 transition-colors" />
              </button>
              
              <button 
                onClick={() => openForm('crop')}
                className="w-full flex items-center justify-between p-5 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-green-500/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <Sprout className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-bold text-white">New Plantation</span>
                </div>
                <PlusCircle className="w-5 h-5 text-zinc-600 group-hover:text-green-500 transition-colors" />
              </button>
            </div>
           </div>

           <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
             <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">System Status</p>
             <div className="flex items-center justify-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm text-green-500 font-bold">Synchronized with MongoDB</span>
             </div>
           </div>
        </div>
      </div>

      <DataFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default OverviewDashboard;
