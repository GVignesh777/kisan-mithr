import React from 'react';
import { CloudSun, CloudRain, Wind, AlertTriangle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const weatherData = [
  { day: 'Mon', temp: 32, rainfall: 0 },
  { day: 'Tue', temp: 33, rainfall: 5 },
  { day: 'Wed', temp: 31, rainfall: 15 },
  { day: 'Thu', temp: 28, rainfall: 45 },
  { day: 'Fri', temp: 27, rainfall: 20 },
  { day: 'Sat', temp: 29, rainfall: 0 },
  { day: 'Sun', temp: 30, rainfall: 0 },
];

const WeatherImpact = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Weather Impact</h2>
          <p className="text-zinc-400 mt-1">Hyper-local climate monitoring and crop correlation</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
          <CloudRain className="text-blue-400 w-5 h-5" />
          <span className="text-blue-300 text-sm font-medium">85% Humidity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Weather Forecast */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">7-Day Rainfall Forecast</h3>
            <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Millimeters (mm)</span>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherData}>
                <defs>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Insights */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Impact Alerts</h3>
          
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-orange-400 w-5 h-5" />
              <h4 className="text-orange-300 font-bold text-sm">Heavy Rain Expected (Thu)</h4>
            </div>
            <p className="text-orange-400/80 text-xs leading-relaxed">
              45mm of rainfall expected on Thursday. Delay pesticide application to prevent wash-off.
            </p>
          </div>

          <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-zinc-300 w-5 h-5" />
              <h4 className="text-zinc-200 font-bold text-sm">Crop Correlation</h4>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Current temperature range (27°C - 33°C) is highly optimal for the vegetative growth phase of Rice. No thermal stress detected.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeatherImpact;
