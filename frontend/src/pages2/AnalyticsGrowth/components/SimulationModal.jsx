import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sprout, BrainCircuit, BarChart3, ShieldAlert, CheckCircle2, Loader2, IndianRupee } from 'lucide-react';
import axiosInstance from '../../../services/url.service';

const SimulationModal = ({ isOpen, onClose, onShowResult }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Simulating, 3: Success
  const [formData, setFormData] = useState({
    cropName: '',
    area: '',
  });
  const [loading, setLoading] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState('');
  const [error, setError] = useState(null);

  const statuses = [
    "Analyzing soil pH and nutrient compatibility...",
    "Correlating historical weather patterns in your region...",
    "Calculating expected yield based on local benchmarks...",
    "Estimating production costs and ROI projections...",
    "Fine-tuning risk factors with AI optimization..."
  ];

  const handleSimulate = async (e) => {
    e.preventDefault();
    setStep(2);
    setLoading(true);
    setError(null);

    // Simulate status cycle
    let statusIdx = 0;
    const statusInterval = setInterval(() => {
        setSimulationStatus(statuses[statusIdx]);
        statusIdx = (statusIdx + 1) % statuses.length;
    }, 1500);

    try {
      const res = await axiosInstance.post('/analytics/growth/simulate', formData);
      clearInterval(statusInterval);
      setStep(3);
      setTimeout(() => {
        onShowResult(res.data.data.scenario);
        onClose();
        // Reset for next time
        setStep(1);
        setFormData({ cropName: '', area: '' });
      }, 1000);
    } catch (err) {
      clearInterval(statusInterval);
      setError(err.response?.data?.message || "Simulation failed. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Custom Simulation</h2>
                <p className="text-xs text-zinc-500 font-medium">Predict specific crop outcomes</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            {step === 1 && (
              <form onSubmit={handleSimulate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Target Crop</label>
                  <div className="relative">
                    <input 
                      required
                      value={formData.cropName}
                      onChange={(e) => setFormData({...formData, cropName: e.target.value})}
                      placeholder="e.g. Basmati Rice, Turmeric, Vanilla"
                      className="w-full h-14 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl px-5 text-white transition-all outline-none pl-12"
                    />
                    <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Simulation Area (Acres)</label>
                  <div className="relative">
                    <input 
                      required
                      type="number"
                      step="0.1"
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      placeholder="e.g. 2.5"
                      className="w-full h-14 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-2xl px-5 text-white transition-all outline-none pl-12"
                    />
                    <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-3 group active:scale-95"
                >
                  Start Simulation
                  <BrainCircuit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse rounded-full"></div>
                  <Loader2 className="w-24 h-24 text-indigo-500 animate-spin-slow relative z-10" />
                  <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 z-20" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Simulating Future Scenarios</h3>
                <p className="text-sm text-zinc-500 font-medium animate-pulse">{simulationStatus}</p>
                
                <div className="mt-12 w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        <IndianRupee className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Current Context</p>
                        <p className="text-white text-xs font-bold">{formData.cropName} simulation on {formData.area} acres</p>
                    </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30"
                >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Simulation Ready</h3>
                <p className="text-zinc-500">Processing results for {formData.cropName}...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SimulationModal;
