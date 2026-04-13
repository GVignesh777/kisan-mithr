import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  ArrowRight, 
  BrainCircuit, 
  LineChart as LineChartIcon, 
  Sprout, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp,
  Clock,
  PlusCircle,
  Coins,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../../services/url.service';
import { useAuth } from '../../../context/AuthContext';
import DataFormModal from '../components/DataFormModal';
import SimulationModal from '../components/SimulationModal';

const GrowthPlanning = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ scenarios: [], hasData: false });
  const [roiStats, setRoiStats] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('crop');
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [customScenario, setCustomScenario] = useState(null);

  const openForm = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return; // 🚫 Prevent calling API if not logged in

    try {
      setLoading(true);
      const [scenarioRes, roiRes] = await Promise.all([
        axiosInstance.get('/analytics/growth/scenarios'),
        axiosInstance.get('/analytics/growth/roi')
      ]);
      setData(scenarioRes.data.data);
      setRoiStats(roiRes.data.data);
    } catch (err) {
      if (err.response?.status === 401) return; // 🔇 Silent fail
      console.error("Growth Data Fetch Error:", err);
      setError("Failed to generate growth predictions. Please ensure you have sufficient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[450px] bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
          <div className="h-[450px] bg-zinc-900 border border-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!data.hasData) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-[3rem]">
        <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Farm Profile Missing</h2>
        <p className="text-zinc-500 max-w-md mb-10">
          Kisan Mithr AI needs your farm's location and land size to generate Growth Planning simulations.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => openForm('farm')}
            className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl transition-all font-bold shadow-lg shadow-green-900/20 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Setup Farm Profile
          </button>
        </div>

        <DataFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            type={modalType} 
            onSuccess={() => { fetchData(); if(onRefresh) onRefresh(); }}
        />
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Growth Planning</h2>
          <p className="text-zinc-400 mt-1">Real-data simulations and AI-assisted forecasting</p>
        </div>
        <div className="px-4 py-2 bg-zinc-800/50 rounded-xl border border-zinc-700 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          Last Updated: {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Just now'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scenario Simulator */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <BrainCircuit className="text-indigo-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Scenario Simulator</h3>
            </div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
              LLAMA-3.3 Powered
            </div>
          </div>
          
          <div className="space-y-6">
            <AnimatePresence>
              {customScenario && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 border-2 border-indigo-500 bg-indigo-500/5 rounded-3xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-[8px] font-black text-white uppercase tracking-tighter rounded-bl-xl">
                    Custom Simulation
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                        <TrendingUp className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{customScenario.cropName}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                          <span className="flex items-center gap-1"><Clock size={12}/> {customScenario.duration}</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getRiskColor(customScenario.riskLevel)}`}>
                            {customScenario.riskLevel} Risk
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-400">{customScenario.estimatedProfit}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Est. Profit</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic border-t border-indigo-500/20 pt-4 mt-4">
                    "{customScenario.reasoning}"
                  </p>
                  <button 
                    onClick={() => setCustomScenario(null)}
                    className="mt-4 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
                  >
                    Clear Simulation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {data.scenarios.length > 0 ? (
              data.scenarios.map((scenario, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 border border-zinc-800 bg-zinc-950/40 rounded-3xl hover:border-indigo-500/30 transition-all group cursor-default"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <Sprout className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">{scenario.cropName}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1"><Clock size={12}/> {scenario.duration}</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getRiskColor(scenario.riskLevel)}`}>
                            {scenario.riskLevel} Risk
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-400">{scenario.estimatedProfit}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Est. Profit</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-800/80">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-indigo-400/60 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-zinc-400 leading-relaxed italic">
                        "{scenario.reasoning}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${scenario.confidenceScore}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">{scenario.confidenceScore}% Confidence</span>
                     </div>
                     <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn">
                       Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                <BrainCircuit className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-sm text-zinc-500 font-medium max-w-[200px]">
                  Analyzing your location and soil to generate new scenarios...
                </p>
                <button 
                  onClick={fetchData}
                  className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Refresh Simulation
                </button>
              </div>
            )}
          </div>

          
          <button 
            onClick={() => setIsSimModalOpen(true)}
            className="w-full mt-8 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl"
          >
             Run Custom Simulation <LayoutGrid size={16} />
          </button>
        </div>

        {/* ROI Calculator Card */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-950 border border-emerald-500/20 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <LineChartIcon className="text-emerald-400 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">ROI Intelligence</h3>
            </div>
            
            <p className="text-zinc-500 text-sm mb-10 leading-relaxed max-w-sm">
                Advanced performance forecasting based on your historical yield efficiency and spending patterns.
            </p>
            
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                <div>
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Target ROI</span>
                    <span className="text-zinc-300 text-sm">Suggested improvement</span>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-white">{roiStats?.targetROI || 0}%</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                <div>
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Suggested Budget</span>
                    <span className="text-zinc-300 text-sm">Optimal investment per season</span>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400">₹{parseFloat(roiStats?.suggestedInvestment || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pb-4">
                <div>
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Payback Period</span>
                    <span className="text-zinc-300 text-sm">Investment recovery time</span>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-white">{roiStats?.paybackPeriod || 0} <span className="text-sm font-normal text-zinc-500">Months</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-500 w-5 h-5" />
                <span className="text-sm font-bold text-zinc-400 italic">Historical Average ROI: {roiStats?.currentROI || 0}%</span>
             </div>
             <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                Full Analytics
             </button>
          </div>
        </div>

      </div>

      <DataFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        onSuccess={() => { fetchData(); if(onRefresh) onRefresh(); }}
      />

      <SimulationModal 
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onShowResult={(res) => setCustomScenario(res)}
      />
    </div>
  );
};

export default GrowthPlanning;

