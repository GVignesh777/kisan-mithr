import React, { useState } from 'react';
import { Stethoscope, Syringe, Activity, ShieldCheck, HeartPulse, Beef, Drumstick, AlertCircle } from 'lucide-react';

const LivestockGuide = () => {
    const [activeTab, setActiveTab] = useState('cattle');

    return (
        <div className="flex-1 p-4 md:p-8 text-white h-screen bg-zinc-950 overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3">
                        <HeartPulse className="text-green-500" size={32} />
                        Livestock & Dairy Management
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Comprehensive health guidelines, vaccination schedules, and disease management for your farm animals.
                    </p>
                </div>

                {/* Category Navigation */}
                <div className="flex gap-4 border-b border-zinc-800 pb-4">
                    <button 
                        onClick={() => setActiveTab('cattle')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'cattle' 
                                ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' 
                                : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-green-500/50'
                        }`}
                    >
                        <Beef size={20} /> Dairy Cattle & Buffaloes
                    </button>
                    <button 
                        onClick={() => setActiveTab('poultry')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'poultry' 
                                ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                                : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-orange-500/50'
                        }`}
                    >
                        <Drumstick size={20} /> Poultry Farming
                    </button>
                </div>

                {/* Primary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    
                    {/* Main Health Guides */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-zinc-900/60 border border-zinc-700/50 p-6 rounded-2xl shadow-xl hover:border-green-500/30 transition-colors">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <AlertCircle className="text-red-400" size={24} /> Common Diseases & Symptoms
                            </h2>
                            <div className="space-y-4">
                                {activeTab === 'cattle' ? (
                                    <>
                                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                                            <h3 className="font-bold text-red-400">Foot and Mouth Disease (FMD)</h3>
                                            <p className="text-zinc-400 text-sm mt-1 mb-2">Highly contagious viral disease affecting cloven-hoofed animals.</p>
                                            <p className="text-zinc-300 text-sm"><span className="text-yellow-500 font-semibold">Symptoms:</span> Fever, blisters in mouth and on feet, drop in milk production, excessive salivation.</p>
                                            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2">
                                                <Stethoscope size={16} className="text-green-500 mt-0.5 shrink-0" />
                                                <p className="text-green-400 text-sm font-medium">Treatment: Isolate infected animals immediately. Apply mild antiseptics to ulcers. Prevent via bi-annual FMD vaccination.</p>
                                            </div>
                                        </div>
                                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                                            <h3 className="font-bold text-red-400">Mastitis</h3>
                                            <p className="text-zinc-400 text-sm mt-1 mb-2">Inflammation of the mammary gland and udder tissue.</p>
                                            <p className="text-zinc-300 text-sm"><span className="text-yellow-500 font-semibold">Symptoms:</span> Swollen, hot, red, or painful udder. Abnormal milk (clots, flakes, watery).</p>
                                            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2">
                                                <Stethoscope size={16} className="text-green-500 mt-0.5 shrink-0" />
                                                <p className="text-green-400 text-sm font-medium">Treatment: Maintain strictly hygienic milking environments. Administer prescribed intra-mammary antibiotics early.</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                                            <h3 className="font-bold text-red-400">Ranikhet Disease (Newcastle)</h3>
                                            <p className="text-zinc-400 text-sm mt-1 mb-2">Acute viral disease with high mortality rate in poultry.</p>
                                            <p className="text-zinc-300 text-sm"><span className="text-yellow-500 font-semibold">Symptoms:</span> Gasping for air, coughing, drooping wings, twisting of neck, green diarrhea.</p>
                                            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-start gap-2">
                                                <Stethoscope size={16} className="text-green-500 mt-0.5 shrink-0" />
                                                <p className="text-green-400 text-sm font-medium">Treatment: No cure exists. Strict biosecurity and systematic vaccination (F-strain at day 1-7, R2B at 8 weeks) are essential.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Nutrition & Diet */}
                        <div className="bg-zinc-900/60 border border-zinc-700/50 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-4">Dietary Recommendations</h2>
                            <ul className="list-disc list-inside text-zinc-300 space-y-2 text-sm leading-relaxed">
                                {activeTab === 'cattle' ? (
                                    <>
                                        <li>Provide 15-20 kg of green fodder (Maize, Jowar, Lucerne) daily for adult cattle.</li>
                                        <li>Supplement with 4-5 kg of dry fodder (Paddy straw, Wheat bhusa).</li>
                                        <li>Concentrate mixture (cakes, grains, bran) should be given at 1 kg per 2.5 liters of milk yield.</li>
                                        <li>Ensure access to clean drinking water (70-80 liters/day) and mineral salt licks.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Start chicks with Pre-Starter mash (22-24% protein) for the first 2 weeks.</li>
                                        <li>Transition to Grower mash (18-20% protein) until point of lay (for layers).</li>
                                        <li>Provide continuous access to cool, fresh water. Add electrolytes during extreme summer heat.</li>
                                        <li>Maintain calcium levels in Layer feed (min 3.5%) to prevent weak eggshells.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                    </div>

                    {/* Sidebar / Schedule */}
                    <div className="space-y-6">
                        
                        <div className="bg-gradient-to-br from-green-950/40 to-zinc-900 border border-green-500/30 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-zinc-200 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Syringe className="text-blue-400" size={20}/> Vaccination Calendar
                            </h3>
                            <div className="space-y-3">
                                {activeTab === 'cattle' ? (
                                    <>
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-bold text-white text-sm">FMD Vaccine</p>
                                                <p className="text-xs text-zinc-500">Twice a year</p>
                                            </div>
                                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">Sep / Mar</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-bold text-white text-sm">HS & BQ (Combined)</p>
                                                <p className="text-xs text-zinc-500">Pre-monsoon annually</p>
                                            </div>
                                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">May - June</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-bold text-white text-sm">Brucellosis</p>
                                                <p className="text-xs text-zinc-500">Female calves only</p>
                                            </div>
                                            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs font-bold">4-8 Months Age</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-bold text-white text-sm">Marek's Disease</p>
                                                <p className="text-xs text-zinc-500">Subcutaneous inj.</p>
                                            </div>
                                            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs font-bold">Day 1</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-bold text-white text-sm">Ranikhet (F-strain)</p>
                                                <p className="text-xs text-zinc-500">Eye/Nose drop</p>
                                            </div>
                                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">Day 5 - 7</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-bold text-white text-sm">IBD / Gumboro</p>
                                                <p className="text-xs text-zinc-500">Drinking water</p>
                                            </div>
                                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">Day 14</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-zinc-900/60 border border-zinc-700/50 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm font-medium mb-1">Local Vet Support</p>
                                <p className="text-xl font-bold text-white">1962</p>
                                <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><ShieldCheck size={12}/> Toll Free Helpline</p>
                            </div>
                            <Activity size={48} className="text-zinc-800" />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default LivestockGuide;
