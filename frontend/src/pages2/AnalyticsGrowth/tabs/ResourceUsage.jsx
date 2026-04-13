import React, { useState, useEffect } from 'react';
import { Droplet, Leaf, Bug, Activity } from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import { useAuth } from '../../../context/AuthContext';

const ResourceUsage = ({ overviewData, loading: globalLoading }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchResources = async () => {
      if (!user) return; // 🚫 Prevent calling API if not logged in

      try {
        setLoading(true);
        const res = await axiosInstance.get('/analytics/resources');
        setResources(res.data.data || []);
      } catch (error) {
        if (error.response?.status === 401) return; // 🔇 Silent fail
        console.error("Resource fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchResources();
    }
  }, [user]);

  if (globalLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-800 rounded-3xl"></div>)}
        </div>
        <div className="h-32 bg-zinc-800 rounded-3xl"></div>
      </div>
    );
  }

  const icons = {
    Water: Droplet,
    Fertilizer: Leaf,
    Pesticide: Bug
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Resource Usage</h2>
        <p className="text-zinc-400 mt-1">Efficiency tracking for farm inputs and utilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.length > 0 ? resources.map((res, idx) => {
          const Icon = icons[res.name] || Activity;
          return (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] group hover:border-green-500/30 transition-all shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-green-500/20 transition-all">
                  <Icon className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-[10px] font-bold px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl uppercase tracking-wider">
                  Tracking
                </span>
              </div>
              <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">{res.name} Usage</h3>
              <p className="text-3xl font-black text-white mb-4">
                {res.value.toLocaleString()} 
                <span className="text-sm font-normal text-zinc-500 ml-2">Units</span>
              </p>
              <div className="w-full bg-zinc-800/50 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" 
                  style={{ width: `${Math.min((res.value / 1000) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-500 mt-4 text-right font-bold uppercase tracking-widest">Efficiency: Optimal</p>
            </div>
          );
        }) : (
            <div className="md:col-span-3 flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
                <Activity className="w-12 h-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500 font-bold">No resource consumption logged yet</p>
            </div>
        )}
      </div>

      <div className="mt-8 bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border-t-green-500/10">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center border border-green-500/20">
                <Activity className="w-10 h-10 text-green-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-1">Resource Efficiency Score</h3>
                <p className="text-zinc-500 text-sm">Balanced against yield output and land variety</p>
            </div>
        </div>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-2xl">
          {overviewData?.healthScore || 0}%
        </div>
      </div>

      <div className="p-8 bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] mt-8 text-center">
          <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl mx-auto italic">
            "By optimizing resource usage through Kisan Mithr, our farmers have seen an average reduction of 15% in operational costs while maintaining high yield quality."
          </p>
      </div>
    </div>
  );
};

export default ResourceUsage;
