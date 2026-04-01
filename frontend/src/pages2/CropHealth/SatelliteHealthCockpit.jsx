import React, { useState, useEffect } from 'react';
import { 
    Activity, Thermometer, Droplet, Wind, Sun, 
    Calendar, MapPin, Globe, Satellite, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import useTranslation from '../../hooks/useTranslation';

const SatelliteHealthCockpit = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [location, setLocation] = useState({ lat: 17.3850, lon: 78.4867, name: "Detecting..." });

    const API_BASE = `${process.env.REACT_APP_API_URL}/api/satellite`;

    useEffect(() => {
        // 1. Geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lon: longitude, name: "Automatic Detection" });
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
    }, []);

    const fetchData = async (lat, lon) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/data`, { lat, lon });
            if (res.data.status === 'success') {
                setData(res.data.data);
            } else {
                setError("Failed to fetch satellite data.");
            }
        } catch (err) {
            console.error("Data fetch error", err);
            setError("Ground station connection failure. Please check telemetry link.");
        } finally {
            setIsLoading(false);
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
            humidity: params.RH2M[date]
        }));
    }, [data]);

    const latestMetrics = React.useMemo(() => {
        if (!chartData.length) return null;
        return chartData[chartData.length - 1];
    }, [chartData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-cyan-500 font-mono">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                >
                    <Satellite size={64} />
                </motion.div>
                <p className="text-xl font-black uppercase tracking-[0.4em] animate-pulse">{t("satellitePage.establishingLink")}</p>
                <div className="mt-4 flex gap-2">
                    {[1,2,3].map(i => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.3 }} className="w-2 h-2 bg-cyan-500 rounded-full" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-red-500 p-8 text-center">
                <AlertCircle size={64} className="mb-4" />
                <h2 className="text-2xl font-black uppercase mb-2">{t("satellitePage.telemetryError")}</h2>
                <p className="text-zinc-500 mb-8 max-w-md">{error}</p>
                <button onClick={() => fetchData(location.lat, location.lon)} className="px-8 py-3 bg-red-500/10 border border-red-500/50 rounded-full text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all">
                    {t("satellitePage.retryConnection")}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans overflow-x-hidden relative">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,black_100%)"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* TOP SECTION: Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-2">
                            <Activity size={12} /> {t("satellitePage.liveTelemetryFeed")} // {location.name}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
                            {t("satellitePage.satelliteHealthCockpit")}
                        </h1>
                    </div>
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex flex-col items-end">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase mb-1">
                            <MapPin size={10} /> {t("satellitePage.groundPosition")}
                        </div>
                        <p className="text-sm font-mono text-cyan-400">{location.lat.toFixed(4)}°N / {location.lon.toFixed(4)}°E</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* LEFT PANEL: Satellite Image */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-zinc-900/60 border border-white/10 rounded-[2.5rem] overflow-hidden group shadow-2xl backdrop-blur-md">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="text-cyan-500" size={16} /> {t("satellitePage.earthVisuals")}
                                </h3>
                                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-400 font-mono">
                                    LANDSAT_8
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
                                        <p className="text-[10px] font-mono uppercase tracking-widest">{t("satellitePage.noCloudFreeAsset")}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">{t("satellitePage.captureDate")}</p>
                                        <p className="text-xs font-mono flex items-center gap-2">
                                            <Calendar size={12} className="text-cyan-500" />
                                            {data?.imagery?.date?.split('T')[0] || "N/A"}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-cyan-500 rounded-full" />)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-cyan-500/5 border border-cyan-500/10 p-6 rounded-[2rem] backdrop-blur-md">
                            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">{t("satellitePage.uplinkStatus")}</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-zinc-400">{t("satellitePage.signalStrength")}</p>
                                    <p className="text-xs font-mono text-cyan-400">98%</p>
                                </div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-cyan-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Environmental Cards */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Temp', val: latestMetrics?.temp, unit: '°C', icon: Thermometer, color: 'text-orange-400', desc: 'Air Temp 2M' },
                                { label: 'Rainfall', val: latestMetrics?.rain, unit: 'mm', icon: Droplet, color: 'text-blue-400', desc: 'Precipitation' },
                                { label: 'Humidity', val: latestMetrics?.humidity, unit: '%', icon: Activity, color: 'text-green-400', desc: 'Relative 2M' },
                                { label: 'Wind', val: latestMetrics?.wind, unit: 'm/s', icon: Wind, color: 'text-cyan-400', desc: 'Speed 2M' },
                                { label: 'Solar', val: latestMetrics?.solar, unit: 'W/m²', icon: Sun, color: 'text-yellow-400', desc: 'Radiation' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] group hover:border-cyan-500/30 transition-all relative overflow-hidden backdrop-blur-xl"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color} group-hover:scale-110 transition-transform`}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div className="w-1 h-4 bg-zinc-800 rounded-full" />
                                    </div>
                                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-3xl font-black italic">{stat.val?.toFixed(1) || "..."}</p>
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase">{stat.unit}</p>
                                    </div>
                                    <p className="mt-4 text-[8px] text-zinc-700 font-bold uppercase tracking-tight">{stat.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* BOTTOM SECTION: Trends Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Temp Trend */}
                            <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-8 italic">
                                    <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                    {t("satellitePage.tempGradient")}
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
                                            <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} hide />
                                            <YAxis stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Rain Trend */}
                            <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-8 italic">
                                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                    {t("satellitePage.precipitationMatrix")}
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
                    </div>
                </div>
            </div>

            {/* Global HUD Decor */}
            <div className="fixed bottom-8 left-8 right-8 pointer-events-none flex justify-between items-center opacity-30">
                <div className="font-mono text-[8px] uppercase tracking-[0.5em] text-cyan-500">
                    System Ver 2.5.1 // NASA_POWER_LINK_ACTIVE
                </div>
                <div className="flex gap-4 items-center">
                    <div className="w-32 h-px bg-white/10"></div>
                    <div className="font-mono text-[8px] text-zinc-500 italic">{t("satellitePage.groundStation")}</div>
                </div>
            </div>
        </div>
    );
};

export default SatelliteHealthCockpit;
