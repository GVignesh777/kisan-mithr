import React, { useState, useEffect } from 'react';
import { 
    Activity, Thermometer, Droplet, Wind, Sun, 
    Calendar, MapPin, Globe, Satellite, Loader2, AlertCircle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import useTranslation from '../../hooks/useTranslation';

const CropHealthMap = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState(t("cropHealth.initializingLink") || "Initializing Orbital Link...");
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [location, setLocation] = useState({ lat: 17.3850, lon: 78.4867, name: "Detecting..." });
    const [report, setReport] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const API_BASE = `${process.env.REACT_APP_API_URL}/api/satellite`;

    useEffect(() => {
        const startSequence = async () => {
            setProgress(10);
            setLoadingMessage(t("cropHealth.syncingGroundPosition") || "Synchronizing Ground Position...");
            
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ lat: latitude, lon: longitude, name: t("cropHealth.autoDetection") || "Automatic Detection" });
                        fetchData(latitude, longitude);
                    },
                    (err) => {
                        console.error("Geolocation error:", err);
                        setLocation({ lat: 17.3850, lon: 78.4867, name: "Hyderabad, TS (Default)" });
                        fetchData(17.3850, 78.4867);
                    }
                );
            } else {
                fetchData(17.3850, 78.4867);
            }
        };
        startSequence();
    }, []);

    const fetchData = async (lat, lon) => {
        setIsLoading(true);
        setError(null);
        setProgress(25);
        setLoadingMessage(t("cropHealth.establishingRedundantConnection") || "Establishing Triple-redundant NASA Connection...");

        // Simulate smooth progress between steps
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev < 90) return prev + Math.random() * 2;
                return prev;
            });
        }, 300);

        try {
            // Milestone 1: Climate & Meta
            setLoadingMessage(t("cropHealth.acquiringTelemetry") || "Acquiring NASA POWER Climate Telemetry...");
            const res = await axios.post(`${API_BASE}/data`, { lat, lon });
            
            if (res.data.status === 'success') {
                setProgress(75);
                setLoadingMessage(t("cropHealth.downloadingLandsat") || "Downloading High-Resolution Landsat Assets...");
                // Add a small delay for dramatic effect / perceived value
                await new Promise(r => setTimeout(r, 800));
                
                setData(res.data.data);
                setProgress(100);
                setLoadingMessage(t("cropHealth.decryptionComplete") || "Decryption Complete. Welcome, Commander.");
                setTimeout(() => setIsLoading(false), 800);
            } else {
                throw new Error("Invalid telemetry packet response.");
            }
        } catch (err) {
            console.error("Data fetch error", err);
            setError(t("cropHealth.connectionTimeout") || "Ground station connection failure. NASA Deep Space Network Timeout.");
        } finally {
            clearInterval(progressInterval);
        }
    };

    const runDiagnostic = async () => {
        if (!latestMetrics) return;
        setIsAnalyzing(true);
        setReport(null);

        try {
            const response = await axios.post(`${API_BASE}/analyze`, {
                indices: {
                    temp: latestMetrics.temp,
                    rain: latestMetrics.rain,
                    humidity: latestMetrics.humidity,
                    solar: latestMetrics.solar
                },
                cropName: "Cotton", 
                language: "en",
                source: "NASA POWER"
            });
            setReport(response.data.report);
        } catch (error) {
            console.error("Diagnostic failed", error);
            setReport(t("cropHealth.systemError") || "System error: Unable to connect to satellite telemetry via Ground Station.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Format POWER data for Recharts
    const chartData = React.useMemo(() => {
        if (!data?.climate?.properties?.parameter) return [];
        const params = data.climate.properties.parameter;
        const dates = Object.keys(params.T2M);
        
        return dates.map(date => ({
            date: `${date.substring(4, 6)}/${date.substring(6, 8)}`,
            temp: params.T2M[date],
            rain: params.PRECTOTCORR[date],
            solar: params.ALLSKY_SFC_SW_DWN[date],
            humidity: params.RH2M[date],
            wind: params.WS2M[date]
        }));
    }, [data]);

    const latestMetrics = React.useMemo(() => {
        if (!chartData.length) return null;
        return chartData[chartData.length - 1];
    }, [chartData]);

    if (isLoading && !error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-cyan-500 font-mono p-6">
                <div className="relative w-32 h-32 mb-12">
                     {/* Outer Ring */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full"
                    />
                    {/* Pulsing Satellite Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Satellite size={48} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                        </motion.div>
                    </div>
                    {/* Scanning Line */}
                    <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-0.5 bg-cyan-500/40 blur-sm z-10"
                    />
                </div>

                <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60">{t("cropHealth.orbitalHandshake") || "Orbital Handshake"}</span>
                        <span className="text-2xl font-black italic">{Math.round(progress)}%</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                    </div>

                    <div className="flex items-center gap-3 py-4 px-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                        <Loader2 className="animate-spin text-cyan-500" size={16} />
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold truncate">
                            {loadingMessage}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 opacity-20">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-12 text-[8px] tracking-[0.5em] uppercase opacity-20 font-black">
                    {t("cropHealth.nasaCommandLink") || "NASA // KISAN_MITHR // COMMAND_LINK_V4.0"}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-red-500 p-8 text-center">
                <AlertCircle size={64} className="mb-4" />
                <h2 className="text-2xl font-black uppercase mb-2">{t("cropHealth.telemetryError") || "Telemetry Error"}</h2>
                <p className="text-zinc-500 mb-8 max-w-md">{error}</p>
                <button onClick={() => fetchData(location.lat, location.lon)} className="px-8 py-3 bg-red-500/10 border border-red-500/50 rounded-full text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all">
                    {t("cropHealth.retryConnection") || "Retry Connection"}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans overflow-x-hidden relative">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* TOP SECTION: Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-2">
                            <Activity size={12} /> {t("cropHealth.liveTelemetryFeed") || "Live Telemetry Feed //"} {location.name}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-500">
                            {t("cropHealth.satelliteHealthCockpit") || "SATELLITE HEALTH COCKPIT"}
                        </h1>
                    </div>
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex flex-col items-end">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase mb-1">
                            <MapPin size={10} /> {t("cropHealth.groundPosition") || "Ground Position"}
                        </div>
                        <p className="text-sm font-mono text-cyan-400">{location.lat.toFixed(4)}°N / {location.lon.toFixed(4)}°E</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* LEFT PANEL: Satellite Image & AI */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-zinc-900/60 border border-white/10 rounded-[2.5rem] overflow-hidden group shadow-2xl backdrop-blur-md">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="text-cyan-500" size={16} /> {t("cropHealth.earthVisuals") || "Earth Visuals"}
                                </h3>
                                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 font-mono">
                                    NASA_LANDSAT
                                </div>
                            </div>
                            <div className="aspect-square relative flex items-center justify-center bg-black">
                                {data?.imagery?.url ? (
                                    <motion.img 
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={data.imagery.url} 
                                        alt="Satellite View" 
                                        className="w-full h-full object-cover grayscale contrast-125"
                                    />
                                ) : (
                                    <div className="text-center p-8 opacity-30">
                                        <Satellite size={48} className="mx-auto mb-4 animate-pulse" />
                                        <p className="text-[10px] font-mono uppercase tracking-widest">{t("cropHealth.noCloudFreeAsset") || "No Cloud-Free Asset Found for this Date"}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">{t("cropHealth.captureDate") || "Capture Date"}</p>
                                        <p className="text-xs font-mono flex items-center gap-2">
                                            <Calendar size={12} className="text-cyan-500" />
                                            {data?.imagery?.date?.split('T')[0] || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] backdrop-blur-md">
                            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Activity size={14} /> {t("cropHealth.aiAnalysis") || "AI Analysis"}
                            </h4>
                            <div className="space-y-4">
                                <div className="text-xs text-zinc-400 leading-relaxed font-medium min-h-[100px] max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                                            <Loader2 className="text-cyan-500 animate-spin" size={24} />
                                            <p className="text-[10px] font-mono uppercase tracking-widest animate-pulse">{t("cropHealth.processingData") || "Processing Spectral Data..."}</p>
                                        </div>
                                    ) : report ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-line">
                                            {report}
                                        </motion.div>
                                    ) : (
                                        <p className="text-center italic opacity-30 py-8">{t("cropHealth.awaitingLink") || "Awaiting Command Link..."}</p>
                                    )}
                                </div>
                                <button 
                                    onClick={runDiagnostic}
                                    disabled={isAnalyzing}
                                    className="w-full py-3 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-cyan-400 transition-all shadow-[0_10px_20px_rgba(6,182,212,0.2)]"
                                >
                                    {isAnalyzing ? (t("cropHealth.analyzing") || 'Analyzing...') : (t("cropHealth.generateReport") || 'Generate AI Report')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Environmental Data & Charts */}
                    <div className="xl:col-span-3 space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                            {[
                                { label: t("cropHealth.temp") || 'Temp', val: latestMetrics?.temp, unit: '°C', icon: Thermometer, color: 'text-orange-400' },
                                { label: t("cropHealth.rainfall") || 'Rainfall', val: latestMetrics?.rain, unit: 'mm', icon: Droplet, color: 'text-blue-400' },
                                { label: t("cropHealth.humidity") || 'Humidity', val: latestMetrics?.humidity, unit: '%', icon: Activity, color: 'text-green-400' },
                                { label: t("cropHealth.wind") || 'Wind', val: latestMetrics?.wind, unit: 'm/s', icon: Wind, color: 'text-cyan-400' },
                                { label: t("cropHealth.solar") || 'Solar', val: latestMetrics?.solar, unit: 'W/m²', icon: Sun, color: 'text-yellow-400' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] group hover:border-cyan-500/30 transition-all backdrop-blur-xl"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                            <stat.icon size={18} />
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-2xl font-black italic">{stat.val?.toFixed(1) || "..."}</p>
                                        <p className="text-[8px] font-bold text-zinc-600 uppercase">{stat.unit}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CHARTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8 italic text-orange-400">
                                    <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                    {t("cropHealth.thermalGradient") || "Thermal Gradient (30D)"}
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="date" hide />
                                            <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8 italic text-blue-400">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                    {t("cropHealth.precipitationTrend") || "Precipitation Trend (30D)"}
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="date" hide />
                                            <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                            <Bar dataKey="rain" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* SOLAR RADIATION CHART */}
                        <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3 mb-8 italic text-yellow-400">
                                <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                                {t("cropHealth.solarIntensityMatrix") || "Solar Intensity Matrix"}
                            </h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="date" fontSize={8} stroke="#3f3f46" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="solar" stroke="#eab308" strokeWidth={2} fill="url(#colorSolar)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hudson Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-3xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-8 shadow-2xl opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">{t("cropHealth.orbitalHandshakeActive") || "Orbital Handshake Active"}</p>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">NASA POWER // Landsat Gen.8</p>
            </div>
        </div>
    );
};

export default CropHealthMap;
