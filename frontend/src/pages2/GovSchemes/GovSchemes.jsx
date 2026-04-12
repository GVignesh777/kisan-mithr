import React, { useState, useMemo } from 'react';
import { 
    Landmark, CheckCircle2, FileText, BadgePercent, ShieldCheck, 
    Calculator, Search, Droplets, Leaf, Sprout, Tractor, Building, 
    ShoppingCart, TrendingUp, HeartHandshake, Waves, Filter, ExternalLink
} from 'lucide-react';
import useTranslation from "../../hooks/useTranslation";

const GovSchemes = () => {
    const { t } = useTranslation();
    const [landSize, setLandSize] = useState('');
    const [eligibilityResult, setEligibilityResult] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const checkEligibility = (e) => {
        e.preventDefault();
        if (!landSize || isNaN(landSize)) return;

        const size = parseFloat(landSize);
        let result = [];

        if (size <= 2) {
            result.push({ name: t("govSchemes.s1Title") || "PM-KISAN Samman Nidhi", amount: "₹6,000/year", match: "Perfect Match (Marginal Farmer)" });
            result.push({ name: t("govSchemes.s3Title") || "Kisan Credit Card (KCC)", amount: "Up to ₹3 Lakh at 4%", match: "High Eligibility" });
            result.push({ name: "Soil Health Card", amount: "Free Soil Testing", match: "Eligible" });
        } else if (size <= 5) {
            result.push({ name: t("govSchemes.s3Title") || "Kisan Credit Card (KCC)", amount: "Up to ₹3 Lakh at 4%", match: "High Eligibility" });
            result.push({ name: t("govSchemes.s2Title") || "PMFBY (Crop Insurance)", amount: "Premium Subsidized", match: "Eligible" });
            result.push({ name: "PMKSY (Irrigation)", amount: "Subsidy on equipment", match: "Eligible" });
        } else {
            result.push({ name: t("govSchemes.s2Title") || "PMFBY (Crop Insurance)", amount: "Premium Subsidized", match: "Eligible" });
            result.push({ name: "AIF (Agri Infra Fund)", amount: "3% Interest Subvention", match: "High Eligibility for Infrastructure" });
            result.push({ name: "SMAM (Mechanization)", amount: "Up to 50% Subsidy", match: "Eligible" });
        }

        setEligibilityResult(result);
    };

    const categories = ["All", "Finance", "Insurance", "Irrigation", "Infrastructure", "Market", "Machinery", "Livestock"];

    const schemes = [
        {
            title: "PM-KISAN",
            desc: "Income support of ₹6,000 per year in three equal installments to all landholding farmer families.",
            benefits: ["Direct cash transfer of ₹6000/year", "Disbursed in 3 equal installments", "Direct to bank account via DBT"],
            eligibility: "Landholding farmer families with cultivable land in their names",
            category: "Finance",
            url: "https://pmkisan.gov.in/",
            icon: <Landmark className="text-blue-400" size={24} />,
            color: "from-blue-900/40 to-zinc-900 border-blue-500/30"
        },
        {
            title: "Kisan Credit Card (KCC)",
            desc: "Provides farmers with timely access to credit for raising crops, working capital, and post-harvest expenses.",
            benefits: ["Collateral-free loan up to ₹1.6 lakh", "Low interest rate (up to 4% with prompt repayment)", "Flexible repayment options"],
            eligibility: "All farmers including individuals, joint borrowers, tenant farmers",
            category: "Finance",
            url: "https://pmkisan.gov.in/Documents/Kcc.pdf",
            icon: <BadgePercent className="text-purple-400" size={24} />,
            color: "from-purple-900/40 to-zinc-900 border-purple-500/30"
        },
        {
            title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            desc: "Comprehensive crop insurance scheme protecting farmers against crop failure.",
            benefits: ["Extremely low premium (1.5% - 2%)", "Covers natural calamities, pests & diseases", "Full insured amount payout"],
            eligibility: "All farmers growing notified crops in notified areas",
            category: "Insurance",
            url: "https://pmfby.gov.in/",
            icon: <ShieldCheck className="text-emerald-400" size={24} />,
            color: "from-emerald-900/40 to-zinc-900 border-emerald-500/30"
        },
        {
            title: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
            desc: "Focuses on 'More Crop Per Drop' by improving water use efficiency through micro-irrigation.",
            benefits: ["Subsidy on drip & sprinkler irrigation systems", "Enhanced crop yield", "Water and fertilizer savings"],
            eligibility: "Farmers with cultivable land, priority to small and marginal farmers",
            category: "Irrigation",
            url: "https://pmksy.gov.in/",
            icon: <Droplets className="text-cyan-400" size={24} />,
            color: "from-cyan-900/40 to-zinc-900 border-cyan-500/30"
        },
        {
            title: "Soil Health Card Scheme",
            desc: "Assists State Governments to issue Soil Health Cards to all farmers in the country.",
            benefits: ["Crop-wise nutrient recommendations", "Improves soil health and fertility", "Reduces cost of cultivation"],
            eligibility: "All farmers in India",
            category: "Infrastructure",
            url: "https://soilhealth.dac.gov.in/",
            icon: <Leaf className="text-lime-400" size={24} />,
            color: "from-lime-900/40 to-zinc-900 border-lime-500/30"
        },
        {
            title: "Paramparagat Krishi Vikas Yojana (PKVY)",
            desc: "Promotes organic farming through a cluster approach and Participatory Guarantee System.",
            benefits: ["Financial assistance for organic inputs", "Support for certification and processing", "Market linkage assistance"],
            eligibility: "Farmers forming a cluster of 20 hectares or 50 acres",
            category: "Infrastructure",
            url: "https://pgsindia-ncof.gov.in/pkvy/index.aspx",
            icon: <Sprout className="text-green-400" size={24} />,
            color: "from-green-900/40 to-zinc-900 border-green-500/30"
        },
        {
            title: "Sub-Mission on Agricultural Mechanization (SMAM)",
            desc: "Aims to increase the reach of farm mechanization to small and marginal farmers.",
            benefits: ["Subsidy on purchasing tractors & machinery", "Establishment of Custom Hiring Centers", "Reduces physical labor"],
            eligibility: "All farmers, special provisions for SC/ST, women, and marginal farmers",
            category: "Machinery",
            url: "https://agrimachinery.nic.in/",
            icon: <Tractor className="text-orange-400" size={24} />,
            color: "from-orange-900/40 to-zinc-900 border-orange-500/30"
        },
        {
            title: "Agriculture Infrastructure Fund (AIF)",
            desc: "Provides medium-long term debt financing facility for post-harvest management infrastructure.",
            benefits: ["3% interest subvention up to ₹2 Crores", "Credit guarantee coverage", "Moratorium on repayment (6 months to 2 years)"],
            eligibility: "Farmers, FPOs, PACS, Startups, and Agri-entrepreneurs",
            category: "Infrastructure",
            url: "https://agriinfra.dac.gov.in/",
            icon: <Building className="text-indigo-400" size={24} />,
            color: "from-indigo-900/40 to-zinc-900 border-indigo-500/30"
        },
        {
            title: "e-NAM",
            desc: "Pan-India electronic trading portal functioning as a unified national market for agricultural commodities.",
            benefits: ["Better price realization through online bidding", "Transparency in trade and weighing", "Direct online payment to farmers"],
            eligibility: "Any registered farmer or FPO",
            category: "Market",
            url: "https://enam.gov.in/",
            icon: <ShoppingCart className="text-yellow-400" size={24} />,
            color: "from-yellow-900/40 to-zinc-900 border-yellow-500/30"
        },
        {
            title: "PM-AASHA",
            desc: "Ensures remunerative prices to the farmers for their produce.",
            benefits: ["Price Support Scheme (PSS)", "Price Deficiency Payment Scheme (PDPS)", "Private Procurement & Stockist Scheme (PPSS)"],
            eligibility: "Farmers selling oilseeds, pulses, and copra",
            category: "Market",
            url: "https://agricoop.nic.in/en/PM-AASHA",
            icon: <TrendingUp className="text-rose-400" size={24} />,
            color: "from-rose-900/40 to-zinc-900 border-rose-500/30"
        },
        {
            title: "National Livestock Mission",
            desc: "Focuses on entrepreneurship development and breed improvement in poultry, sheep, goat and piggery.",
            benefits: ["50% subsidy up to ₹50 Lakh for breeding farms", "Fodder seed processing units support", "Livestock insurance"],
            eligibility: "Individuals, FPOs, SHGs, and Section 8 companies",
            category: "Livestock",
            url: "https://nlm.udyamimitra.in/",
            icon: <HeartHandshake className="text-pink-400" size={24} />,
            color: "from-pink-900/40 to-zinc-900 border-pink-500/30"
        },
        {
            title: "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
            desc: "A scheme to bring about ecologically healthy, economically viable, and socially inclusive development of the fisheries sector.",
            benefits: ["Support for aquaculture and fish farming", "Infrastructure for post-harvest management", "Insurance cover for fishers"],
            eligibility: "Fishers, fish farmers, FPOs, and fisheries cooperatives",
            category: "Livestock",
            url: "https://pmmsy.dof.gov.in/",
            icon: <Waves className="text-sky-400" size={24} />,
            color: "from-sky-900/40 to-zinc-900 border-sky-500/30"
        }
    ];

    const filteredSchemes = useMemo(() => {
        return schemes.filter(scheme => {
            const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  scheme.desc.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const handleApplyNow = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="flex-1 p-4 md:p-8 text-white h-screen bg-zinc-950 overflow-hidden w-full flex flex-col">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                
                {/* Header Section */}
                <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-800/60 pb-6 rounded-b-[2rem]">
                    <div>
                        <h1 className="text-3xl font-extrabold text-green-400 flex items-center gap-3">
                            <FileText className="text-green-500" size={36} />
                            {t("govSchemes.title") || "Agriculture Schemes Portal"}
                        </h1>
                        <p className="text-zinc-400 mt-2 text-lg max-w-2xl">
                            {t("govSchemes.desc") || "Discover, filter, and easily apply for major Indian agriculture government schemes."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8 mt-6 flex-1 min-h-0">
                    
                    {/* Main Schemes Feed */}
                    <div className="xl:w-3/4 flex flex-col min-h-0">
                        
                        {/* Search and Filters */}
                        <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search schemes..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors shadow-lg"
                                />
                            </div>
                            <div className="flex bg-zinc-900/60 border border-zinc-700 rounded-2xl p-1.5 overflow-x-auto snap-x shadow-lg" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-1.5 whitespace-nowrap rounded-xl text-sm font-medium transition-colors snap-center ${
                                            selectedCategory === cat 
                                            ? 'bg-green-600 text-white shadow-md' 
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schemes Listing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 pb-20" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                            {filteredSchemes.length > 0 ? (
                                filteredSchemes.map((scheme, idx) => (
                                    <div key={idx} className={`bg-gradient-to-br ${scheme.color} bg-zinc-900/40 backdrop-blur-sm border p-6 rounded-[1.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-zinc-950/80 rounded-2xl shadow-inner border border-white/5">
                                                    {scheme.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-zinc-100 leading-tight">{scheme.title}</h3>
                                                    <span className="inline-block mt-1.5 px-3 py-1 bg-zinc-950/60 text-zinc-300 text-xs font-medium rounded-full border border-white/10">
                                                        {scheme.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-zinc-300 text-sm mb-5 leading-relaxed font-medium">
                                            {scheme.desc}
                                        </p>

                                        <div className="bg-black/20 rounded-xl p-4 mb-4 flex-1">
                                            <h4 className="text-xs text-green-400 font-bold uppercase tracking-wider mb-2">Key Benefits</h4>
                                            <ul className="text-sm text-zinc-300 space-y-1.5">
                                                {scheme.benefits.map((ben, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                                        <span>{ben}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="border-t border-white/10 pt-4 mt-auto">
                                            <div className="mb-4">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-1">Eligibility</p>
                                                <p className="text-sm text-zinc-300 line-clamp-2">{scheme.eligibility}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleApplyNow(scheme.url)}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors font-bold shadow-[0_4px_20px_rgba(22,163,74,0.3)] hover:shadow-[0_4px_25px_rgba(22,163,74,0.5)] group"
                                            >
                                                Apply Now
                                                <ExternalLink size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center">
                                    <Filter size={48} className="text-zinc-700 mb-4" />
                                    <h3 className="text-xl font-bold text-zinc-400">No schemes found</h3>
                                    <p className="text-zinc-500 mt-2">Try adjusting your search query or category filter.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Eligibility Checker Sidebar */}
                    <div className="xl:w-1/4 flex flex-col overflow-y-auto pb-20 pr-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                        <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 p-6 rounded-[1.5rem] shadow-2xl">
                            <div className="flex items-center gap-3 mb-6 bg-green-950/30 p-3 rounded-2xl border border-green-500/20">
                                <Calculator className="text-green-400" size={28} />
                                <h2 className="text-lg font-bold text-white leading-tight">
                                    {t("govSchemes.quickMatch") || "Quick Eligibility Match"}
                                </h2>
                            </div>
                            
                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                {t("govSchemes.enterLandSize") || "Enter your landholding size to see schemes tailored for you."}
                            </p>
                            
                            <form onSubmit={checkEligibility} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                                        {t("govSchemes.landSizeLabel") || "Land Size (in Hectares)"}
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="e.g. 1.5"
                                        value={landSize}
                                        onChange={(e) => setLandSize(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
                                    />
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl transition-colors font-extrabold shadow-lg">
                                    {t("govSchemes.matchBtn") || "Match Schemes"}
                                </button>
                            </form>

                            {/* Eligibility Results */}
                            {eligibilityResult && (
                                <div className="mt-8 pt-6 border-t border-zinc-800 animate-fadeIn duration-500">
                                    <h3 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-widest">{t("govSchemes.topMatches") || "Your Top Matches"}</h3>
                                    <div className="space-y-4">
                                        {eligibilityResult.map((res, i) => (
                                            <div key={i} className="bg-zinc-950/80 p-4 rounded-xl border border-green-500/30 shadow-md">
                                                <p className="font-bold text-green-400 flex items-center gap-2 text-sm mb-1.5">
                                                    <CheckCircle2 size={16} /> {res.name}
                                                </p>
                                                <p className="text-xs text-zinc-300 mb-1">{res.match}</p>
                                                <p className="text-sm text-green-500 font-semibold">{res.amount}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-6 text-center italic bg-zinc-950/50 p-3 rounded-lg">
                                        {t("govSchemes.disclaimer") || "*Results are estimations. Verify with nearest MeeSeva or CSC center."}
                                    </p>
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
