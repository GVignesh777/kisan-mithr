import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Ruler, Droplets, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import { toast } from 'react-toastify';

const DataPromptModal = ({ isOpen, onClose, onComplete }) => {
    const [formData, setFormData] = useState({
        location: '',
        landSize: '',
        landUnit: 'Acres',
        soilType: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/analytics/farm', formData);
            toast.success("Farm data updated! Fetching AI insights...");
            onComplete();
            onClose();
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Failed to save data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Complete Your Farm Profile</h2>
                                <p className="text-zinc-400 text-sm mt-1">We need this to provide accurate AI farming guidance.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MapPin size={14} className="text-green-500"/> Farm Location
                                </label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="District, State (e.g., Guntur, Andhra Pradesh)"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-green-500 transition-all"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Ruler size={14} className="text-emerald-500"/> Land Size
                                    </label>
                                    <input 
                                        required
                                        type="number" 
                                        placeholder="Area"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-green-500 transition-all"
                                        value={formData.landSize}
                                        onChange={(e) => setFormData({...formData, landSize: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        Unit
                                    </label>
                                    <select 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-green-500 transition-all appearance-none"
                                        value={formData.landUnit}
                                        onChange={(e) => setFormData({...formData, landUnit: e.target.value})}
                                    >
                                        <option value="Acres">Acres</option>
                                        <option value="Hectares">Hectares</option>
                                        <option value="Bigha">Bigha</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Droplets size={14} className="text-blue-500"/> Soil Type
                                </label>
                                <select 
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-green-500 transition-all appearance-none"
                                    value={formData.soilType}
                                    onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                                >
                                    <option value="">Select Soil Type</option>
                                    <option value="Alluvial">Alluvial Soil</option>
                                    <option value="Black">Black Soil (Regur)</option>
                                    <option value="Red">Red Soil</option>
                                    <option value="Laterite">Laterite Soil</option>
                                    <option value="Arid/Desert">Arid / Desert Soil</option>
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Get AI Insights <CheckCircle2 size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DataPromptModal;
