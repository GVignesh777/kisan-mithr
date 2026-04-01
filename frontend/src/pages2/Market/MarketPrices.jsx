import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, MapPin, ArrowUp, ArrowDown, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

const MarketPrices = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedMarket, setSelectedMarket] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
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
    }).sort((a, b) => {
        if (priceFilter === 'high') return b.modal_price - a.modal_price;
        if (priceFilter === 'low') return a.modal_price - b.modal_price;
        return 0;
    });

    if (isLoading) {
        return (
            <div className="flex-1 p-8 text-white h-screen bg-zinc-950 flex flex-col items-center justify-center w-full">
                <div className="w-16 h-16 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                    {t("market.loadingLivePrices")}
                </h2>
                <p className="text-zinc-500 animate-pulse text-lg tracking-wide">{t("market.fetchingMandi")}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 text-white h-screen bg-zinc-950 overflow-y-auto w-full font-sans relative">
            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <span className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase">
                                {t("market.liveMarketPrices")}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                            {t("liveMarketPrices")}
                        </h1>
                        <p className="text-zinc-400 text-lg font-medium max-w-2xl leading-relaxed">
                            {t("dailyMandi")}
                        </p>
                    </div>
                </header>

                {/* Filters and Search */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                placeholder={t("searchPlaceholder")}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white placeholder:text-gray-500 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-3 relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none appearance-none text-white font-medium cursor-pointer transition-all hover:bg-white/10"
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedDistrict("");
                                    setSelectedMarket("");
                                }}
                            >
                                <option value="" className="bg-gray-900">{t("market.allStates")}</option>
                                {uniqueStates.map(state => (
                                    <option key={state} value={state} className="bg-gray-900">{state}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="md:col-span-3 relative">
                            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none appearance-none text-white font-medium cursor-pointer transition-all hover:bg-white/10"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                            >
                                <option value="all" className="bg-gray-900">{t("market.standard")}</option>
                                <option value="high" className="bg-gray-900">Highest Price</option>
                                <option value="low" className="bg-gray-900">Lowest Price</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="relative">
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none appearance-none text-gray-300 text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                value={selectedDistrict}
                                onChange={(e) => {
                                    setSelectedDistrict(e.target.value);
                                    setSelectedMarket("");
                                }}
                                disabled={!selectedState}
                            >
                                <option value="" className="bg-gray-900">{t("market.allDistricts")}</option>
                                {uniqueDistricts.map(dist => (
                                    <option key={dist} value={dist} className="bg-gray-900">{dist}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none appearance-none text-gray-300 text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                value={selectedMarket}
                                onChange={(e) => setSelectedMarket(e.target.value)}
                                disabled={!selectedDistrict}
                            >
                                <option value="" className="bg-gray-900">{t("market.allMandis")}</option>
                                {uniqueMarkets.map(mandi => (
                                    <option key={mandi} value={mandi} className="bg-gray-900">{mandi}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

            {/* Data Table */}
            <div className="overflow-hidden border border-white/10 rounded-3xl bg-[#0a0a0c]/40 backdrop-blur-md shadow-2xl relative">
                <div className="overflow-x-auto max-h-[60vh] custom-scrollbar" ref={tableRef}>
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-md z-10">
                            <tr className="border-b border-white/10">
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("commodity")}</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("marketLabel")}</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("minPrice")}</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("maxPrice")}</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("modalPrice")}</th>
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{t("date")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.map((item, index) => (
                                <tr key={index} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="p-5">
                                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{item.commodity}</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 opacity-60">Variety: {item.variety || t("market.standard")}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-300">
                                            <MapPin size={14} className="text-zinc-500" />
                                            {item.market}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{item.state}, {item.district}</div>
                                    </td>
                                    <td className="p-5 text-right font-mono text-gray-400 italic">₹{item.min_price}</td>
                                    <td className="p-5 text-right font-mono text-gray-400 italic">₹{item.max_price}</td>
                                    <td className="p-5 text-right font-mono text-emerald-400 font-bold text-lg">
                                        <div className="flex items-center justify-end gap-2">
                                            <span>₹{item.modal_price}</span>
                                            <TrendingUp size={16} className="text-emerald-500 opacity-50" />
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="px-3 py-1 rounded-full bg-white/5 text-[11px] font-bold text-gray-400 border border-white/5">
                                            {item.arrival_date}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredData.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 font-medium">
                            {t("noMarketData")} <span className="text-emerald-400">"{searchQuery || "selected area"}"</span>
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* Floating Scroll Controls */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
            <button
                onClick={() => tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-3 bg-zinc-900/90 hover:bg-emerald-500/20 border border-white/10 rounded-2xl backdrop-blur-md transition-all group shadow-xl"
                title={t("market.scrollToTop")}
            >
                <ArrowUp className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
            </button>
            <button
                onClick={() => tableRef.current?.scrollTo({ top: tableRef.current?.scrollHeight, behavior: 'smooth' })}
                className="p-3 bg-zinc-900/90 hover:bg-emerald-500/20 border border-white/10 rounded-2xl backdrop-blur-md transition-all group shadow-xl"
                title={t("market.scrollToBottom")}
            >
                <ArrowDown className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
            </button>
        </div>
    </div>
);
};

export default MarketPrices;
