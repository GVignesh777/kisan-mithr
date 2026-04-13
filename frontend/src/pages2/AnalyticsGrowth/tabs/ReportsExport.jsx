import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, FileText, Calendar, CheckSquare, Download, Loader2 } from 'lucide-react';

import { toast } from 'react-toastify';
import axiosInstance from '../../../services/url.service';
import { useAuth } from '../../../context/AuthContext';
import { exportToCSV, exportToTXT, exportToPDF } from '../../../utils/exportUtils';


const ReportsExport = () => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ yields: [], expenses: [] });
  const [reportType, setReportType] = useState('Comprehensive Seasonal Summary');
  const { user } = useAuth();

  useEffect(() => {

    const fetchData = async () => {
      if (!user) return; // 🚫 Block API if not logged in
      try {
        const [yieldRes, expenseRes] = await Promise.all([
          axiosInstance.get('/analytics/yields'),
          axiosInstance.get('/analytics/financial-trends')
        ]);
        setData({
          yields: yieldRes.data.data,
          expenses: expenseRes.data.data
        });
      } catch (err) {
        console.error("Fetch error for reports:", err);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleExport = (format) => {
    setLoading(true);
    let exportData = [];
    let filename = `${reportType.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}`;

    if (reportType.includes('Financial')) {
      exportData = data.expenses.map(e => ({
        Month: e.month,
        Income: `₹${e.income}`,
        Expenses: `₹${e.expenses}`,
        Net_Profit: `₹${e.income - e.expenses}`
      }));
    } else if (reportType.includes('Yield')) {
      exportData = data.yields.map(y => ({
        Crop: y.crop,
        Quantity: y.current,
        Historical_Avg: y.historical || 'N/A'
      }));
    } else {
        exportData = [
            ...data.yields.map(y => ({ Type: 'Yield', Name: y.crop, Value: y.current, Status: 'Record' })),
            ...data.expenses.map(e => ({ Type: 'Finance', Name: e.month, Value: e.income - e.expenses, Status: 'Profit' }))
        ];
    }

    if (format === 'CSV') exportToCSV(exportData, `${filename}.csv`);
    else if (format === 'TXT') exportToTXT(exportData, `${filename}.txt`);
    else exportToPDF(exportData, `${filename}.pdf`);
    
    setLoading(false);
    setShowExportOptions(false);
    toast.success("Report downloaded successfully.");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Reports & Export</h2>
        <p className="text-zinc-400 mt-1">Generate official documentation for banks, government, or personal records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Report Generator */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl relative">
          <h3 className="text-xl font-bold text-white mb-8">Generate Custom Report</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-300 focus:outline-none focus:border-green-500 transition-colors"
              >
                <option>Comprehensive Seasonal Summary</option>
                <option>Financial & Profitability Statement</option>
                <option>Crop Yield & Health Report</option>
                <option>Bank Loan Supporting Document</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Start Date</label>
                <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-300 focus:outline-none focus:border-green-500 transition-colors" />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 block">End Date</label>
                <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-300 focus:outline-none focus:border-green-500 transition-colors" />
              </div>
            </div>

            <div className="relative pt-4">
                <button 
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    disabled={loading}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-black tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download size={20} /> 
                  {loading ? 'Generating...' : 'Generate & Download'}
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
                        { label: 'Official Document (PDF)', format: 'PDF', icon: FileText },
                        { label: 'Data Spreadsheet (CSV)', format: 'CSV', icon: Download },
                        { label: 'Plain Text Report (TXT)', format: 'TXT', icon: FileDown },
                      ].map((opt) => (
                        <button
                          key={opt.format}
                          onClick={() => handleExport(opt.format)}
                          className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800 rounded-2xl text-sm font-bold text-zinc-300 hover:text-white transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <opt.icon className="w-5 h-5 text-green-500" />
                            {opt.label}
                          </div>
                          <CheckSquare className="w-4 h-4 opacity-0 group-hover:opacity-100 text-green-500 transition-opacity" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Recent Reports Archives */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl">
           <h3 className="text-xl font-bold text-white mb-8">Recent Archives</h3>
           <div className="space-y-4">
              {[
                { title: 'Kharif Season 2025 Summary', date: 'Oct 15, 2025', size: '2.4 MB' },
                { title: 'KCC Loan Performance Report', date: 'Sep 01, 2025', size: '1.2 MB' },
                { title: 'Monsoon Impact Assessment', date: 'Jul 22, 2025', size: '0.8 MB' },
                { title: 'Annual Productivity Review', date: 'Jan 05, 2025', size: '4.1 MB' },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-zinc-950/50 border border-zinc-800/80 rounded-3xl hover:border-green-500/20 transition-all group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group-hover:bg-green-500/10 transition-colors">
                        <FileText className="w-5 h-5 text-zinc-400 group-hover:text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm tracking-tight">{report.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold">
                              <Calendar size={12} /> {report.date}
                           </span>
                           <span className="text-[10px] text-zinc-600 font-black tracking-tighter uppercase">{report.size}</span>
                        </div>
                      </div>
                   </div>
                   <div className="p-2 text-zinc-600 group-hover:text-green-500 transition-colors">
                      <Download size={20} />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-500 italic">
                Secure cloud archiving enabled for last 24 months.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsExport;


