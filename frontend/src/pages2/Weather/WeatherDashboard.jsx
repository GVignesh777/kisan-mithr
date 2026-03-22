import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CloudRain, Wind, Droplets, Sun, Calendar, MapPin, 
    Sunrise, Sunset, Compass, AlertCircle, Leaf, Gauge
} from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

const WeatherDashboard = () => {
    const { t } = useTranslation();
    const [weather, setWeather] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationStatus, setLocationStatus] = useState("Detecting location...");

    useEffect(() => {
        const fetchWeatherWithCoords = (lat, lng) => {
            setLocationStatus("Fetching local weather...");
            fetch(`${process.env.REACT_APP_API_URL}/api/weather/coords?lat=${lat}&lng=${lng}`)
                .then(res => {
                    if (!res.ok) throw new Error('Weather data fetch failed');
                    return res.json();
                })
                .then(data => {
                    setWeather(data);
                    setIsLoading(false);
                })
                .catch(e => {
                    console.error(e);
                    fallbackToDefault();
                });
        };

        const fallbackToDefault = () => {
            setLocationStatus("Using default location...");
            fetch(`${process.env.REACT_APP_API_URL}/api/weather/Warangal`)
                .then(res => {
                    if (!res.ok) throw new Error("Fallback failed");
                    return res.json();
                })
                .then(data => {
                    setWeather(data);
                    setIsLoading(false);
                })
                .catch(e => {
                    const mockData = {
                        location: "Warangal (Simulated)",
                        current: {
                            temp: 32, isDay: true, condition: "Partly Cloudy", humidity: 55, windSpeed: 14, rainProb: 10, windDirection: 180, pressure: 1012
                        },
                        forecast: Array.from({length: 7}).map((_, i) => ({
                            day: new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', {weekday: 'short'}),
                            date: new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
                            tempMax: 30 + Math.floor(Math.random()*5),
                            tempMin: 20 + Math.floor(Math.random()*4),
                            uvIndex: 6 + Math.floor(Math.random()*3),
                            evapotranspiration: 4,
                            sunrise: "06:15",
                            sunset: "18:40",
                            rainProb: Math.floor(Math.random()*30)
                        })),
                        farmingRecommendation: "Current simulation active. Weather conditions appear stable. Maintain regular irrigation schedules."
                    };
                    setWeather(mockData);
                    setIsLoading(false);
                });
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeatherWithCoords(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.warn("Geolocation denied or failed.", err);
                    fallbackToDefault();
                },
                { 
                    enableHighAccuracy: true, 
                    timeout: 20000, 
                    maximumAge: 5000 
                }
            );
        } else {
            fallbackToDefault();
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 p-8 text-white h-screen bg-zinc-950 flex flex-col items-center justify-center w-full">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="mb-8 relative"
                >
                    <Sun size={80} className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 mb-3">Kisan Mithr Weather</h2>
                <p className="text-zinc-400 animate-pulse text-lg">{locationStatus}</p>
            </div>
        );
    }

    if (error || !weather || !weather.current) {
        return (
            <div className="flex-1 p-8 text-white h-screen bg-zinc-950 flex flex-col items-center justify-center w-full">
                <AlertCircle size={64} className="text-red-500 mb-6" />
                <p className="text-zinc-300 text-xl max-w-md text-center">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 rounded-full transition-opacity font-bold text-white shadow-lg">
                    Retry Connection
                </button>
            </div>
        );
    }

    const { current, forecast, farmingRecommendation, location } = weather;

    return (
        <div className="flex-1 p-4 md:p-8 text-white min-h-screen bg-zinc-950 overflow-y-auto w-full pb-32 no-scrollbar">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-6 md:px-8 rounded-[2rem] border border-white/5 backdrop-blur-md"
                >
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-1 drop-shadow-md">
                            {t("weatherForecast") || "Local Weather"}
                        </h1>
                        <p className="text-green-400 flex items-center gap-2 text-lg font-medium">
                            <MapPin size={20} className="text-red-400" /> {location}
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-zinc-200 flex items-center md:justify-end gap-2 text-lg font-medium">
                            <Calendar size={18} className="text-blue-400" /> 
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">
                            Live open-meteo data
                        </p>
                    </div>
                </motion.div>

                {/* Agricultural Insights Banner */}
                {farmingRecommendation && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 p-6 md:p-8 rounded-[2rem] shadow-[0_0_30px_rgba(16,185,129,0.05)] flex flex-col sm:flex-row items-start sm:items-center gap-6"
                >
                    <div className="p-4 bg-emerald-500/10 rounded-2xl flex-shrink-0 animate-bounce">
                        <Leaf size={32} className="text-emerald-400" />
                    </div>
                    <div>
                        <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                            Smart Agricultural Insight
                        </span>
                        <p className="text-zinc-100 text-xl font-medium leading-relaxed drop-shadow-sm">{farmingRecommendation}</p>
                    </div>
                </motion.div>
                )}

                {/* Main Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Huge current weather card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 bg-gradient-to-b from-zinc-900 to-black border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group flex flex-col justify-between"
                    >
                        {/* Decorative background glow based on Day/Night */}
                        <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-30 pointer-events-none transition-colors duration-1000 ${current.isDay ? 'bg-yellow-500' : 'bg-blue-600'}`}></div>

                        <div className="relative z-10">
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] mb-6">Right Now</p>
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-7xl md:text-8xl lg:text-[7rem] font-black text-white tracking-tighter">{current.temp}°</h2>
                                <Sun size={90} className={`${current.isDay ? 'text-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.6)]' : 'text-blue-300 drop-shadow-[0_0_35px_rgba(147,197,253,0.4)]'}`} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">{current.condition}</h3>
                            <p className="text-zinc-400 text-lg">Feels like {current.temp + (current.humidity > 70 ? 2 : -1)}°</p>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <p className="text-zinc-500 text-sm uppercase font-bold tracking-wider mb-2">High / Low</p>
                                <p className="text-white text-xl font-bold">{forecast && forecast[0] ? forecast[0].tempMax : '--'}° / {forecast && forecast[0] ? forecast[0].tempMin : '--'}°</p>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-sm uppercase font-bold tracking-wider mb-2">UV Index</p>
                                <p className="text-white text-xl font-bold flex items-baseline gap-2">
                                    {forecast && forecast[0] ? forecast[0].uvIndex : '--'} 
                                    <span className={`text-sm font-medium ${forecast[0]?.uvIndex > 7 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        ({forecast[0]?.uvIndex > 7 ? 'High' : 'Mod'})
                                    </span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: 6 Important Metrics Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                    >
                        <MetricCard 
                            icon={<CloudRain className="text-blue-400" size={28} />}
                            title={t("rainProbability") || "Rain Prob"}
                            value={`${current.rainProb}%`}
                            subValue={current.rainProb > 50 ? "Bring an umbrella" : "Clear skies likely"}
                            bg="bg-blue-500/10"
                        />
                        <MetricCard 
                            icon={<Wind className="text-cyan-400" size={28} />}
                            title={t("windSpeed") || "Wind"}
                            value={`${current.windSpeed} km/h`}
                            subValue={`Dir: ${current.windDirection || 0}°`}
                            bg="bg-cyan-500/10"
                        />
                        <MetricCard 
                            icon={<Droplets className="text-teal-400" size={28} />}
                            title={t("humidity") || "Humidity"}
                            value={`${current.humidity}%`}
                            subValue={current.humidity > 60 ? "Muggy" : "Comfortable"}
                            bg="bg-teal-500/10"
                        />
                        <MetricCard 
                            icon={<Compass className="text-indigo-400" size={28} />}
                            title="Evapo-Loss"
                            value={`${forecast && forecast[0] ? forecast[0].evapotranspiration : 0} mm`}
                            subValue="Daily water lost"
                            bg="bg-indigo-500/10"
                        />
                        <MetricCard 
                            icon={<Gauge className="text-rose-400" size={28} />}
                            title="Pressure"
                            value={`${Math.round(current.pressure || 1013)} hP`}
                            subValue="Surface level"
                            bg="bg-rose-500/10"
                        />
                        
                        {/* Sun Tracker Mini Card */}
                        <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between hover:bg-zinc-800/80 transition-colors shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-orange-500/10 rounded-xl">
                                    <Sunrise className="text-orange-400" size={24} />
                                </div>
                                <p className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Sun Cycle</p>
                            </div>
                            <div className="space-y-4 mt-auto">
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <span className="text-zinc-500 font-medium">Rise</span>
                                    <span className="text-white font-bold">{forecast && forecast[0] ? forecast[0].sunrise : '--'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 font-medium">Set</span>
                                    <span className="text-white font-bold">{forecast && forecast[0] ? forecast[0].sunset : '--'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 7-Day Forecast Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-black/40 border border-white/5 p-6 md:p-8 rounded-[2.5rem] mt-8"
                >
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 px-2 tracking-tight">
                        <Calendar size={28} className="text-green-400"/> 
                        {t("sevenDayForecast") || "7-Day Future Forecast"}
                    </h3>
                    
                    {/* Horizontal scroll container */}
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-2 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {forecast && forecast.map((day, idx) => (
                            <div 
                                key={idx} 
                                className={`min-w-[140px] md:min-w-[160px] snap-center rounded-[2rem] p-6 flex flex-col items-center justify-between gap-5 transition-all duration-300 shadow-lg
                                    ${idx === 0 ? 'bg-gradient-to-b from-green-900/40 to-black border-green-500/40 border shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'bg-zinc-900/50 border border-white/5 hover:bg-zinc-800'}
                                `}
                            >
                                <div className="text-center">
                                    <p className="text-white font-black text-xl mb-1">{idx === 0 ? 'Today' : day.day}</p>
                                    <p className="text-zinc-500 text-sm font-medium tracking-wide">{day.date}</p>
                                </div>
                                
                                <div className="relative py-2">
                                    <Sun size={48} className={`${idx === 0 ? 'text-yellow-400' : 'text-zinc-300'} drop-shadow-lg`} />
                                    {day.rainProb > 40 && (
                                        <CloudRain size={24} className="text-blue-400 absolute -bottom-2 -right-3 bg-zinc-900 rounded-full p-1 border border-zinc-800 shrink-0" />
                                    )}
                                </div>
                                
                                <div className="text-center w-full mt-2">
                                    <div className="flex items-baseline justify-center gap-2 mb-2">
                                        <span className="text-3xl font-black text-white">{day.tempMax}°</span>
                                        <span className="text-lg font-bold text-zinc-500">{day.tempMin}°</span>
                                    </div>
                                    <div className="w-full bg-zinc-800/80 rounded-full h-2 mt-4 overflow-hidden border border-white/5">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000" 
                                            style={{ width: `${day.rainProb}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-blue-400 font-bold mt-2 uppercase tracking-widest">
                                        {day.rainProb}% Rain
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

// Extracted reusable metric card component
const MetricCard = ({ icon, title, value, subValue, bg }) => (
    <div className="bg-zinc-900/60 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between hover:bg-zinc-800/80 transition-all duration-300 hover:scale-[1.02] shadow-lg group">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <p className="text-zinc-400 font-bold uppercase tracking-wider text-sm">{title}</p>
        </div>
        <div className="pl-1">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">{value}</h3>
            <p className="text-zinc-400 text-sm font-medium">{subValue}</p>
        </div>
    </div>
);

export default WeatherDashboard;
