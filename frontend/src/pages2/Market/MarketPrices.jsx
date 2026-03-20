import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, MapPin, Filter, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

const MarketPrices = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const tableRef = useRef(null);

    const [commodities, setCommodities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/market/prices`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch market data");
                return res.json();
            })
            .then(resData => {
                if (resData.success) {
                    setCommodities(resData.data);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    // Sort states with priority to Telangana, Andhra Pradesh, Kerala
    const getPriority = (state) => {
        const s = state.toLowerCase();
        if (s.includes('telangana')) return 1;
        if (s.includes('andhra pradesh')) return 2;
        if (s.includes('kerala')) return 3;
        return 4;
    };

    const uniqueStates = [...new Set(commodities.map(c => c.state).filter(Boolean))].sort((a, b) => {
        const pA = getPriority(a);
        const pB = getPriority(b);
        if (pA !== pB) return pA - pB;
        return a.localeCompare(b);
    });
    const uniqueDistricts = [...new Set(
        commodities.filter(c => !selectedState || c.state === selectedState).map(c => c.district).filter(Boolean)
    )].sort();
    const uniqueMarkets = [...new Set(
        commodities.filter(c => (!selectedState || c.state === selectedState) && (!selectedDistrict || c.district === selectedDistrict)).map(c => c.market).filter(Boolean)
    )].sort();

    const filteredData = commodities.filter(c => {
        const matchesSearch = (c.commodity && c.commodity.toLowerCase().includes(searchQuery.toLowerCase())) || 
                              (c.market && c.market.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesState = !selectedState || c.state === selectedState;
        const matchesDistrict = !selectedDistrict || c.district === selectedDistrict;
        const matchesMarket = !selectedMarket || c.market === selectedMarket;
        
        return matchesSearch && matchesState && matchesDistrict && matchesMarket;
    });

    return (
        <div className="flex-1 p-4 md:p-8 text-white h-screen bg-zinc-950 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-green-400">{t("liveMarketPrices")}</h1>
                        <p className="text-zinc-400 mt-1">{t("dailyMandi")}</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input 
                            type="text" 
                            placeholder={t("searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                    
                    <select 
                        value={selectedState} 
                        onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedMarket(''); }}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-700/50 rounded-lg text-zinc-300 focus:outline-none focus:border-green-500 transition-colors"
                    >
                        <option value="">All States</option>
                        {uniqueStates.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>

                    <select 
                        value={selectedDistrict} 
                        onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedMarket(''); }}
                        disabled={!selectedState}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-700/50 rounded-lg text-zinc-300 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                    >
                        <option value="">All Districts</option>
                        {uniqueDistricts.map(district => <option key={district} value={district}>{district}</option>)}
                    </select>

                    <select 
                        value={selectedMarket} 
                        onChange={(e) => setSelectedMarket(e.target.value)}
                        disabled={!selectedDistrict}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-700/50 rounded-lg text-zinc-300 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                    >
                        <option value="">All Mandis / Markets</option>
                        {uniqueMarkets.map(market => <option key={market} value={market}>{market}</option>)}
                    </select>
                </div>

                {/* Data Table */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mt-6 shadow-xl relative">
                    <div className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar" ref={tableRef}>
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-zinc-800/95 backdrop-blur-sm text-zinc-400 text-sm uppercase tracking-wider shadow-sm">
                                    <th className="p-4 font-medium">{t("commodity")}</th>
                                    <th className="p-4 font-medium">{t("market")}</th>
                                    <th className="p-4 font-medium">{t("minPrice")}</th>
                                    <th className="p-4 font-medium">{t("maxPrice")}</th>
                                    <th className="p-4 font-medium">{t("modalPrice")}</th>
                                    <th className="p-4 font-medium">{t("date")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredData.map((item) => (
                                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-zinc-100">{item.commodity}</div>
                                            <div className="text-sm text-zinc-500">{item.variety || 'Standard'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-zinc-300">
                                                <MapPin size={14} className="text-zinc-500" />
                                                {item.market}, {item.state}
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-400">₹{item.min_price}</td>
                                        <td className="p-4 text-zinc-400">₹{item.max_price}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-bold text-lg">
                                                <span>₹{item.modal_price}</span>
                                                <TrendingUp size={16} className="text-green-500" /> 
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-zinc-400">
                                            {item.arrival_date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredData.length === 0 && (
                            <div className="p-8 text-center text-zinc-500">
                                {t("noMarketData")} "{searchQuery}"
                            </div>
                        )}
                    </div>
                    
                    {/* Scroll Controls */}
                    <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-20">
                        <button 
                            onClick={() => tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} 
                            className="p-2.5 bg-zinc-800/90 hover:bg-emerald-600 rounded-full text-zinc-300 hover:text-white shadow-xl border border-zinc-700/50 transition-all"
                            title="Scroll to Top"
                        >
                            <ArrowUpToLine size={20} />
                        </button>
                        <button 
                            onClick={() => tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight, behavior: 'smooth' })} 
                            className="p-2.5 bg-zinc-800/90 hover:bg-emerald-600 rounded-full text-zinc-300 hover:text-white shadow-xl border border-zinc-700/50 transition-all"
                            title="Scroll to Bottom"
                        >
                            <ArrowDownToLine size={20} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MarketPrices;
