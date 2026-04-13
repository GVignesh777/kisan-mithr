import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { IndianRupee, TrendingUp, Wallet, ArrowRightCircle, Plus, Download, FileText } from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import DataFormModal from '../components/DataFormModal';
import { useAuth } from '../../../context/AuthContext';
import { exportToCSV, exportToTXT, exportToPDF } from '../../../utils/exportUtils';

import { toast } from 'react-toastify';


const ProfitExpenses = ({ overviewData, loading: globalLoading, onRefresh }) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleDownload = (format) => {
    const exportData = trends.map(t => ({ 
      Month: t.month, 
      Income: `₹${t.income}`, 
      Expenses: `₹${t.expenses}`, 
      Profit: `₹${t.income - t.expenses}` 
    }));
    const filename = `Financial_Statement_${new Date().toLocaleDateString()}`;

    if (format === 'CSV') exportToCSV(exportData, `${filename}.csv`);
    else if (format === 'TXT') exportToTXT(exportData, `${filename}.txt`);
    else exportToPDF(exportData, `${filename}.pdf`);
    
    setShowExportOptions(false);
    toast.success("Report downloaded successfully.");
  };

  const { user } = useAuth();

  useEffect(() => {
    const fetchTrends = async () => {
      if (!user) return; // 🚫 Prevent calling API if not logged in

      try {
        setLoading(true);
        const res = await axiosInstance.get('/analytics/financial-trends');
        setTrends(res.data.data);
      } catch (error) {
        if (error.response?.status === 401) return; // 🔇 Silent fail
        console.error("Financial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTrends();
    }
  }, [user]);

  if (globalLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-800 rounded-3xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-zinc-800 rounded-3xl"></div>
          <div className="h-[400px] bg-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Calculate stats from trends
  const totalRevenue = trends.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpenses = trends.reduce((acc, curr) => acc + curr.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  const stats = [
    { label: 'Total Investment', value: totalExpenses, icon: Wallet, color: 'text-zinc-100', bg: 'bg-zinc-800' },
    { label: 'Total Revenue', value: totalRevenue, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Net Profit', value: netProfit, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Profit & Expenses</h2>
          <p className="text-zinc-400 mt-1">Real-time financial tracking and balance sheets</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-2xl transition-all text-sm font-bold text-black shadow-lg shadow-green-500/20"
        >
          <Plus className="w-4 h-4" />
          Log New Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/80 p-7 rounded-[2.5rem] flex items-center gap-5 shadow-xl group hover:border-green-500/20 transition-all">
            <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.color}`}>₹{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Trend Chart */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Profit Performance</h3>
              <p className="text-zinc-500 text-sm">Monthly net income analysis</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-4" style={{ minHeight: "350px" }}>
            {trends && trends.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" stroke="#71717a" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(val) => `₹${val>=1000 ? val/1000+'k' : val}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line 
                      type="monotone" 
                      dataKey={(data) => data.income - data.expenses} 
                      name="Net Profit"
                      stroke="#10b981" 
                      strokeWidth={4} 
                      dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#10b981' }} 
                      activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 4, fill: '#fff' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Financial Insights */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Financial Insights</h3>
                <p className="text-zinc-500 text-sm mb-8">AI-generated budget analysis</p>
                
                <div className="space-y-6">
                    <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl relative">
                        <div className="flex items-center gap-3 mb-2">
                            <ArrowRightCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Efficiency</span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            Your ROI is currently at <strong>{totalExpenses > 0 ? ((netProfit / totalExpenses) * 100).toFixed(1) : 0}%</strong>. This is slightly above the regional average for this season.
                        </p>
                    </div>

                    <div className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl relative">
                        <div className="flex items-center gap-3 mb-2">
                            <ArrowRightCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Forecast</span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            Projected revenue for the next 3 months is steady. Consider allocating 10% more for irrigation resources.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800 relative">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4 text-center">Export Records</p>
                <button 
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="w-full py-4 bg-zinc-950 border border-zinc-800 hover:border-green-500/50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <Download size={18} className="text-green-500" />
                    Download P&L Statement
                </button>

                <AnimatePresence>
                  {showExportOptions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full left-0 right-0 mb-4 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                    >
                      {[
                        { label: 'Portable Document (PDF)', format: 'PDF', icon: FileText },
                        { label: 'Spreadsheet (CSV)', format: 'CSV', icon: Download },
                        { label: 'Plain Text (TXT)', format: 'TXT', icon: FileText },
                      ].map((opt) => (
                        <button
                          key={opt.format}
                          onClick={() => handleDownload(opt.format)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 rounded-2xl text-sm font-medium text-zinc-300 hover:text-white transition-all text-left"
                        >
                          <opt.icon className="w-4 h-4 text-green-500" />
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      <DataFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type="expense" 
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default ProfitExpenses;
