import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Wheat, Leaf, Sprout, Combine, PlusCircle } from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import DataFormModal from '../components/DataFormModal';

const CropAnalytics = ({ overviewData, loading: globalLoading, onRefresh }) => {
  const [yieldData, setYieldData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchYieldData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/analytics/yields');
        setYieldData(res.data.data);
      } catch (error) {
        console.error("Yield fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchYieldData();
  }, []);

  if (globalLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-zinc-800 rounded-3xl"></div>
          <div className="h-32 bg-zinc-800 rounded-3xl"></div>
        </div>
        <div className="h-[400px] bg-zinc-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Crop Analytics</h2>
          <p className="text-zinc-400 mt-1">Performance insights across your crop varieties</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-2xl transition-all text-sm font-bold text-black shadow-lg shadow-green-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Add Crop Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-7 rounded-[2rem] flex items-center justify-between group hover:border-green-500/30 transition-all shadow-xl">
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Total Yield Observed</p>
            <h3 className="text-3xl font-bold text-white">
              {yieldData.reduce((acc, curr) => acc + curr.current, 0).toLocaleString()} 
              <span className="text-lg text-zinc-500 font-normal ml-2">Units</span>
            </h3>
          </div>
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
            <Combine className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-7 rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-xl">
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Active Plantations</p>
            <h3 className="text-3xl font-bold text-white">{overviewData?.activeCropsCount || 0}</h3>
            <p className="text-emerald-400 text-xs mt-2 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Tracking
            </p>
          </div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <Sprout className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Performance by Crop</h3>
            <p className="text-zinc-500 text-sm">Quantities harvested per category</p>
          </div>
        </div>
        
        <div className="h-[350px] w-full mt-4">
          {yieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={350}>
              <BarChart data={yieldData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
                <XAxis dataKey="crop" stroke="#71717a" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '16px', color: '#fff' }}
                />
                <Bar dataKey="current" name="Harvested Quantity" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl">
              <Sprout className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-bold">No harvest data recorded yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-green-500/5 to-zinc-900 border border-green-500/10 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Crop Intelligence</h3>
              <p className="text-zinc-500 text-sm font-medium">Smart recommendations powered by Kisan Mithr AI</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Based on your currently recorded crops and active plantations, your soil health score of <strong>{overviewData?.healthScore}/100</strong> suggests a high nutrient retention rate. Consider maintaining current irrigation levels.
          </p>
        </div>
      </div>

      <DataFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type="crop" 
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default CropAnalytics;
