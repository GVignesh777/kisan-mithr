import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Leaf, 
    Sparkles, 
    Bell, 
    Zap, 
    ArrowRight, 
    Bug, 
    CloudRain, 
    AlertTriangle,
    PlusCircle,
    Calculator,
    Mic,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header/Header";
import Footer from "../../components/Footer";
import axiosInstance from '../../services/url.service';
import DataPromptModal from './components/DataPromptModal';
import { useSocket } from '../../context/SocketContext';
import AIChatbot from './components/AIChatbot';

const PlatformOverview = () => {
    const navigate = useNavigate();
    const { joinRegion } = useSocket();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/analytics/platform-overview');
            if (res.data.data.requiresAction) {
                setShowPrompt(true);
            } else {
                setData(res.data.data);
                if (res.data.data.farmSummary?.location) {
                    joinRegion(res.data.data.farmSummary.location);
                }
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const QuickAction = ({ icon: Icon, label, color, onClick }) => (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl hover:border-green-500/50 hover:bg-zinc-800/80 transition-all group gap-3"
        >
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">{label}</span>
        </button>
    );

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-medium animate-pulse">Initializing smart dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-green-500/30 font-sans">
            <Header />
            
            <main className="pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto space-y-10">
                
                {/* Hero / Action Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-900/20 via-zinc-900 to-emerald-900/20 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                                <Sparkles size={14} /> Smart Monitoring Active
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                What should I do <br/> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400">today on my farm?</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-xl">
                                Your crops are entering a critical growth phase. Based on your soil and today's weather, here's your prioritized action list.
                            </p>
                        </div>
                        <div className="shrink-0 w-64 h-64 relative">
                           {/* Decorative 3D-ish element */}
                           <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px]" />
                           <div className="relative z-10 w-full h-full border border-white/5 bg-zinc-950/40 backdrop-blur-xl rounded-full flex items-center justify-center p-8">
                                <div className="text-center">
                                    <p className="text-5xl font-black text-white">{data?.farmSummary?.activeCropsCount || 0}</p>
                                    <p className="text-xs uppercase tracking-widest font-extrabold text-green-400 mt-1">Active Crops</p>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1: Farm Summary & AI Guidance */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Farm Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-3">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Land Coverage</p>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-black text-white">{data?.farmSummary?.totalLand}</h3>
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <Leaf size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-3">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Global Location</p>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white max-w-[150px] truncate">{data?.farmSummary?.location}</h3>
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <Zap size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Farming Guidance */}
                        <div className="relative p-8 bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                           
                           <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500 text-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white">AI Farming Guidance</h2>
                                        <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Personalized Recommendations</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Best Crop to Grow Next</p>
                                            <h4 className="text-2xl font-black text-green-400">{data?.aiGuidance?.bestCrop}</h4>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                            <TrendingUp size={16} /> Seasonal Match: 98%
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-4 italic">
                                        "{data?.aiGuidance?.reasoning}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <Bell size={16} className="text-green-500" /> Key Farming Tips
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {data?.aiGuidance?.tips?.map((tip, idx) => (
                                            <div key={idx} className="p-4 bg-zinc-950/30 border border-zinc-800 rounded-xl text-sm text-zinc-300 hover:border-green-500/30 hover:bg-zinc-900 transition-colors">
                                                {tip}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                           </div>
                        </div>

                        {/* Recent Crops & Growth Stage */}
                        <div className="space-y-4">
                             <div className="flex justify-between items-center px-2">
                                <h2 className="text-xl font-bold text-white">Active Crop Status</h2>
                                <button onClick={() => navigate('/farm-profile')} className="text-sm font-bold text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
                                    View Detailed <ArrowRight size={16} />
                                </button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data?.farmSummary?.processedCrops?.map((crop, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                                            <Leaf size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{crop.name}</h4>
                                            <p className="text-xs text-zinc-500">{crop.plantedArea}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black uppercase tracking-tighter text-green-400 px-2 py-1 bg-green-500/10 rounded-md">
                                                {crop.stage}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                    </div>

                    {/* Column 2: Alerts & Quick Actions */}
                    <div className="space-y-8">
                        
                        {/* Alerts & Notifications Panel */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Bell size={20} className="text-red-500 animate-pulse" /> Urgent Alerts
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {data?.alerts?.length > 0 ? data.alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 bg-zinc-950/40 border-l-4 border-l-red-500 border border-zinc-800 rounded-xl space-y-1">
                                        <h4 className="font-bold text-white text-sm flex items-center justify-between">
                                            {alert.title}
                                            <span className="text-[10px] text-zinc-600 font-medium">
                                                {new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                            {alert.message}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-zinc-600 bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-800">
                                        <CheckCircle2 size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No critical alerts detected <br/> for your farm right now.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white px-2">Quick Commands</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <QuickAction 
                                    icon={PlusCircle} 
                                    label="Add New Crop" 
                                    color="bg-green-500" 
                                    onClick={() => navigate('/farm-profile')}
                                />
                                <QuickAction 
                                    icon={Calculator} 
                                    label="Calc Dosage" 
                                    color="bg-emerald-500" 
                                    onClick={() => navigate('/pesticide-calc')}
                                />
                                <QuickAction 
                                    icon={Mic} 
                                    label="Ask Smart AI" 
                                    color="bg-blue-500" 
                                    onClick={() => navigate('/assistant')}
                                />
                                <QuickAction 
                                    icon={Users} 
                                    label="Farmer Net" 
                                    color="bg-zinc-500" 
                                    onClick={() => navigate('/community')}
                                />
                            </div>
                        </div>

                    </div>

                </div>

            </main>

            <Footer />

            <DataPromptModal 
                isOpen={showPrompt} 
                onClose={() => navigate('/')} 
                onComplete={fetchData} 
            />
            <AIChatbot />
        </div>
    );
};

// Internal icon for "Safe" state
const CheckCircle2 = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
);

// Simple TrendingUp internal replacement
const TrendingUp = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
    </svg>
);

export default PlatformOverview;
