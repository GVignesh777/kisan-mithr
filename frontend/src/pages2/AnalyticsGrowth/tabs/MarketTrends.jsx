import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, TrendingDown, Store, MapPin } from 'lucide-react';

const marketData = [
  { day: 'Mon', price: 2150 },
  { day: 'Tue', price: 2180 },
  { day: 'Wed', price: 2200 },
  { day: 'Thu', price: 2190 },
  { day: 'Fri', price: 2250 },
  { day: 'Sat', price: 2300 },
  { day: 'Sun', price: 2350 },
];

const MarketTrends = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Market Trends</h2>
        <p className="text-zinc-400 mt-1">Real-time Mandi prices & predictive analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Price Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Wheat (Sharbati)</h3>
              <p className="text-zinc-400 text-sm">7-Day Price Trend (₹/Quintal)</p>
            </div>
            <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
              <TrendingUp size={16} /> +9.3%
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                <RechartsTooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Action Widget */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
          <div>
            <p className="text-sm text-zinc-400 mb-1">AI Recommendation</p>
            <h3 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">HOLD</h3>
            <p className="text-zinc-300 text-sm leading-relaxed relative z-10">
              Prices have an upward momentum. Forecast models suggest a further <strong>3-5% increase</strong> in the next week due to upcoming festive demand.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-500 mb-2">Best nearby markets right now:</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-zinc-800/40 p-2 rounded-lg text-sm">
                <span className="flex items-center gap-2 text-zinc-300"><MapPin size={14} className="text-blue-400"/> Azadpur Mandi</span>
                <span className="font-bold text-white">₹2,380</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-800/40 p-2 rounded-lg text-sm">
                <span className="flex items-center gap-2 text-zinc-300"><MapPin size={14} className="text-blue-400"/> Ghazipur Mandi</span>
                <span className="font-bold text-white">₹2,345</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketTrends;
