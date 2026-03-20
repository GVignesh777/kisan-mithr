import React, { useState } from 'react';
import { Landmark, CheckCircle2, ChevronRight, FileText, BadgePercent, ShieldCheck, Calculator } from 'lucide-react';

const GovSchemes = () => {
    const [landSize, setLandSize] = useState('');
    const [eligibilityResult, setEligibilityResult] = useState(null);

    const checkEligibility = (e) => {
        e.preventDefault();
        if (!landSize || isNaN(landSize)) return;

        const size = parseFloat(landSize);
        let result = [];

        if (size <= 2) {
            result.push({ name: "PM-KISAN Samman Nidhi", amount: "₹6,000/year", match: "Perfect Match (Marginal Farmer)" });
            result.push({ name: "Kisan Credit Card (KCC)", amount: "Up to ₹3 Lakh at 4%", match: "High Eligibility" });
        } else if (size <= 5) {
            result.push({ name: "Kisan Credit Card (KCC)", amount: "Up to ₹3 Lakh at 4%", match: "High Eligibility" });
            result.push({ name: "PMFBY (Crop Insurance)", amount: "Premium Subsidized", match: "Eligible" });
        } else {
            result.push({ name: "PMFBY (Crop Insurance)", amount: "Premium Subsidized", match: "Eligible" });
            result.push({ name: "AIF (Agri Infra Fund)", amount: "3% Interest Subvention", match: "High Eligibility for Infrastructure" });
        }

        setEligibilityResult(result);
    };

    const schemes = [
        {
            title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            desc: "Income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
            tag: "Direct Cash Transfer",
            icon: <Landmark className="text-blue-400" size={24} />,
            color: "from-blue-900/40 to-zinc-900 border-blue-500/30"
        },
        {
            title: "PMFBY (Crop Insurance)",
            desc: "Insurance cover against crop failure due to natural calamities, pests & diseases. Low premium rates (2% Kharif, 1.5% Rabi).",
            tag: "Risk Mitigation",
            icon: <ShieldCheck className="text-emerald-400" size={24} />,
            color: "from-emerald-900/40 to-zinc-900 border-emerald-500/30"
        },
        {
            title: "Kisan Credit Card (KCC)",
            desc: "Provides farmers with timely access to credit for raising crops, working capital, and post-harvest expenses at low interest.",
            tag: "Financial Credit",
            icon: <BadgePercent className="text-purple-400" size={24} />,
            color: "from-purple-900/40 to-zinc-900 border-purple-500/30"
        }
    ];

    return (
        <div className="flex-1 p-4 md:p-8 text-white h-screen bg-zinc-950 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3">
                        <FileText className="text-green-500" size={32} />
                        Government Schemes & Subsidies
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Discover and check your eligibility for current central and state agricultural support programs.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    
                    {/* Active Schemes List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Prominent Central Schemes</h2>
                        {schemes.map((scheme, idx) => (
                            <div key={idx} className={`bg-gradient-to-br ${scheme.color} border p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-zinc-950/50 rounded-xl">
                                            {scheme.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white">{scheme.title}</h3>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded-full border border-zinc-700">
                                                {scheme.tag}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-zinc-600 group-hover:text-green-400 transition-colors mt-2" />
                                </div>
                                <p className="text-zinc-400 text-sm mt-4 leading-relaxed">
                                    {scheme.desc}
                                </p>
                                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Status: <span className="text-green-400 font-medium">Accepting Applications</span></span>
                                    <button className="text-blue-400 hover:text-blue-300 font-medium">Apply via CSC Portal &rarr;</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Eligibility Checker */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/60 border border-zinc-700/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                <Calculator className="text-green-400" size={20} /> Quick Eligibility Match
                            </h2>
                            <p className="text-zinc-400 text-sm mb-4">Enter your total landholding size to see schemes specifically tailored for you.</p>
                            
                            <form onSubmit={checkEligibility} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Land Size (in Hectares)</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="e.g. 1.5"
                                        value={landSize}
                                        onChange={(e) => setLandSize(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-bold shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                                    Match Schemes
                                </button>
                            </form>

                            {/* Eligibility Results */}
                            {eligibilityResult && (
                                <div className="mt-6 pt-6 border-t border-zinc-800 animate-fadeIn">
                                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">Your Top Matches</h3>
                                    <div className="space-y-3">
                                        {eligibilityResult.map((res, i) => (
                                            <div key={i} className="bg-zinc-950 p-3 rounded-lg border border-green-500/20">
                                                <p className="font-bold text-green-400 flex items-center gap-1 text-sm">
                                                    <CheckCircle2 size={14} /> {res.name}
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1">{res.match}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5 font-medium">{res.amount}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-4 text-center italic">*Results are estimations. Verify with nearest MeeSeva or CSC center.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default GovSchemes;
