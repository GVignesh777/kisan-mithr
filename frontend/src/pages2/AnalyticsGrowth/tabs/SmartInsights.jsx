import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  AlertTriangle, 
  Lightbulb, 
  ShieldAlert, 
  Coins, 
  RefreshCw,
  PlusCircle,
  CloudLightning,
  CheckCircle2
} from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import { motion } from 'framer-motion';
import DataFormModal from '../components/DataFormModal';
import { useAuth } from '../../../context/AuthContext';

const SmartInsights = ({ onRefresh }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('crop');

  const openForm = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };


  const { user } = useAuth();

  const fetchInsights = async () => {
    if (!user) return; // 🚫 Prevent calling API if not logged in

    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get('/analytics/insights');
      setInsights(res.data.data.insights);
      setTimestamp(res.data.data.timestamp);
    } catch (err) {
      if (err.response?.status === 401) return; // 🔇 Silent fail
      console.error("Error fetching AI insights:", err);
      // More specific error message if it's a data completeness issue
      setError("Not enough data to generate real-time AI insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const getSeverityStyles = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return 'from-red-500/10 to-transparent border-red-500/20 text-red-400 bg-red-500/10';
    if (s === 'medium') return 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400 bg-amber-500/10';
    if (s === 'low') return 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 bg-emerald-500/10';
    return 'from-zinc-500/10 to-transparent border-zinc-500/20 text-zinc-400 bg-zinc-500/10';
  };

  const getSeverityIcon = (section) => {
    switch(section) {
        case 'priorityAlerts': return <ShieldAlert className="w-5 h-5 text-red-400" />;
        case 'optimizationSuggestions': return <Lightbulb className="w-5 h-5 text-amber-400" />;
        case 'riskPredictions': return <CloudLightning className="w-5 h-5 text-blue-400" />;
        case 'costSavingTips': return <Coins className="w-5 h-5 text-emerald-400" />;
        default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-8 bg-zinc-800 rounded-lg w-64 animate-pulse"></div>
                <div className="h-4 bg-zinc-800 rounded-lg w-48 animate-pulse"></div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-4">
               <div className="h-6 bg-zinc-800 rounded w-40 animate-pulse"></div>
               <div className="h-48 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights || (Object.keys(insights).every(k => !insights[k] || insights[k].length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[550px] text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none"></div>
        <div className="p-6 bg-amber-500/10 rounded-3xl mb-8 border border-amber-500/20">
          <BrainCircuit className="w-16 h-16 text-amber-400 animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">Not enough data to generate insights</h3>
        <p className="text-zinc-400 max-w-lg mb-10 text-lg leading-relaxed">
          Kisan Mithr AI requires detailed farm profiles, active crop logs, and recent expenses to generate accurate, data-driven recommendations.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => openForm('crop')}
            className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl transition-all font-bold shadow-lg shadow-green-900/20 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Add Crop Data
          </button>
          <button 
            onClick={() => openForm('expense')}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all font-bold border border-zinc-700 active:scale-95"
          >
            <Coins className="w-5 h-5" /> Add Expenses
          </button>
          <button 
            onClick={() => openForm('farm')}
            className="flex items-center gap-3 px-8 py-4 bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white rounded-2xl transition-all font-bold border border-zinc-800 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Update Farm Info
          </button>
        </div>
      </div>
    );
  }


  const sections = [
    { title: 'Priority Alerts', data: insights.priorityAlerts, key: 'priorityAlerts' },
    { title: 'Optimization Suggestions', data: insights.optimizationSuggestions, key: 'optimizationSuggestions' },
    { title: 'Risk Predictions', data: insights.riskPredictions, key: 'riskPredictions' },
    { title: 'Cost Saving Tips', data: insights.costSavingTips, key: 'costSavingTips' }
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Background accents */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-500/10 blur-[150px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/5 rounded-2xl border border-green-500/30 shadow-inner">
            <BrainCircuit className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Smart AI Insights</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                <RefreshCw className="w-3.5 h-3.5" /> Real-time Analysis
              </span>
              {timestamp && (
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Last Updated: {new Date(timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="group flex items-center gap-3 px-6 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 rounded-2xl transition-all border border-zinc-800 hover:border-zinc-600 shadow-2xl backdrop-blur-xl disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-green-400 transition-transform duration-700 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-bold">Regenerate Analysis</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.key} className="space-y-5">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                {getSeverityIcon(section.key)}
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {section.title}
              </h3>
            </div>
            
            <div className="space-y-4">
              {section.data && section.data.length > 0 ? (
                section.data.map((item, idx) => {
                  const styles = getSeverityStyles(item.severity);
                  const severityParts = styles.split(' ');
                  const lastPart = severityParts.pop();
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      className={`bg-gradient-to-r ${styles} border p-6 rounded-3xl flex items-start gap-5 hover:scale-[1.01] transition-all group lg:min-h-[160px]`}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <h4 className="text-white font-extrabold tracking-tight group-hover:text-green-400 transition-colors uppercase text-sm">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${lastPart} uppercase tracking-widest border border-current/20 shadow-sm`}>
                              {item.severity}
                            </span>
                            {item.confidence && (
                                <span className="text-[10px] text-zinc-500 font-bold bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800">
                                    {item.confidence}% CONFIDENCE
                                </span>
                            )}
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-5 font-medium">
                          {item.description}
                        </p>
                        <button className="flex items-center gap-2 text-xs font-black text-green-400 hover:text-green-300 transition-all group/btn tracking-widest bg-green-500/5 hover:bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 active:scale-95">
                          <span className="">TAKE ACTION</span>
                          <CheckCircle2 className="w-4 h-4 transition-transform group-hover/btn:scale-125" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-3xl backdrop-blur-sm">
                  <p className="text-zinc-500 text-sm font-medium italic">No active data points identified for this category.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <DataFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        onSuccess={() => {
            fetchInsights();
            if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};


export default SmartInsights;
