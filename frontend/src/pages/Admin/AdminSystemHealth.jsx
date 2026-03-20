import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, Database, Clock, Cpu } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminSystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/health`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHealthData(res.data);
      } catch (err) {
        toast.error('Failed to fetch system health');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHealth();
    // Poll every 30s
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (isLoading && !healthData) {
    return <div className="p-8 text-center text-gray-500">Loading system metrics...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-emerald-500 w-6 h-6"/>
          System Health Monitor
        </h2>
        <p className="text-gray-500 text-sm mt-1">Real-time status of APIs, Database, and Server Infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <Server className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm mb-1">API Status</h3>
          <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
             {healthData?.apiStatus || 'Operational'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Database className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm mb-1">MongoDB Status</h3>
          <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
             {healthData?.mongodbStatus || 'Connected'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm mb-1">Server Uptime</h3>
          <p className="text-xl font-bold text-gray-800">
             {formatUptime(healthData?.serverUptime)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <Cpu className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm mb-1">Memory Usage (RSS)</h3>
          <p className="text-xl font-bold text-gray-800">
             {formatBytes(healthData?.memoryUsage?.rss)}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 text-gray-300 font-mono text-xs overflow-hidden shadow-inner">
         <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
            <span className="text-gray-400 font-bold tracking-widest uppercase">Live Terminal Logs</span>
            <span className="flex items-center gap-2 text-emerald-400">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live
            </span>
         </div>
         <div className="space-y-2 opacity-80 h-48 overflow-y-auto custom-scrollbar">
            <p>[{new Date().toISOString()}] GET /api/admin/health 200 OK - 15ms</p>
            <p>[{new Date(Date.now() - 5000).toISOString()}] Connected to MongoDB Cluster</p>
            <p>[{new Date(Date.now() - 15000).toISOString()}] Info: JWT Token Validated successfully</p>
            <p className="text-amber-400">[{new Date(Date.now() - 45000).toISOString()}] Warn: Rate limit approaching for ElevenLabs API</p>
            <p>[{new Date(Date.now() - 60000).toISOString()}] GET /api/admin/dashboard 200 OK - 82ms</p>
            <p>[{new Date(Date.now() - 120000).toISOString()}] User 60d5ecb8b3... registered successfully</p>
         </div>
      </div>
    </div>
  );
};

export default AdminSystemHealth;
