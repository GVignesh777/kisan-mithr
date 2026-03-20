import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, AlertTriangle, ShieldCheck, Leaf, Sprout, ShieldAlert, ThermometerSun } from 'lucide-react';
import { toast } from 'react-toastify';
import useLanguageStore from '../../store/useLanguageStore';

const PestDetector = () => {
    const { language } = useLanguageStore();
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate size
            if (file.size > 5 * 1024 * 1024) {
               toast.error(language === 'en' ? "File size must be less than 5MB" : "5MB కంటే తక్కువ పరిమాణం ఉండే చిత్రాన్ని ఎంచుకోండి");
               return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!imageFile) return;
        setIsAnalyzing(true);
        setResult(null);
        
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('language', language);
            
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const u = JSON.parse(storedUser);
              if (u._id) formData.append('userId', u._id);
            }

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/analyze-crop`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setResult(response.data);
            toast.success(language === 'en' ? "Analysis Complete!" : "విశ్లేషణ పూర్తయింది!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setImagePreview(null);
        setImageFile(null);
        setResult(null);
    };

    return (
        <div className="flex-1 p-4 md:p-8 text-white h-screen bg-zinc-950 overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-green-400 flex items-center gap-3">
                        <Leaf className="text-green-500" size={32} />
                        AI Crop Disease & Pest Detector
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Upload a photo of your infected crop leaf, and our AI vision model will instantly identify the disease and recommend chemical and organic treatments.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    
                    {/* Scanner/Upload Section */}
                    <div className="bg-zinc-900/60 border border-zinc-700/50 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center relative min-h-[400px]">
                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-full border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer hover:bg-zinc-800/50 hover:border-green-500 transition-colors group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-12 h-12 mb-4 text-zinc-400 group-hover:text-green-400 transition-colors" />
                                    <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-zinc-500">PNG, JPG, or WEBP (MAX. 5MB)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center">
                                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
                                    <img src={imagePreview} alt="Crop Preview" className="w-full h-64 object-cover" />
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                            <div className="container-scan pointer-events-none absolute inset-0 overflow-hidden">
                                                <div className="scanner h-1 w-full bg-green-500/80 shadow-[0_0_15px_rgba(34,197,94,1)] animate-scan"></div>
                                            </div>
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500 mb-4 z-10"></div>
                                            <p className="text-green-400 font-bold tracking-widest animate-pulse z-10 text-lg">ANALYZING LEAF TISSUE...</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-6 flex w-full gap-4">
                                    <button 
                                        onClick={resetAnalysis}
                                        disabled={isAnalyzing}
                                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium border border-zinc-700 disabled:opacity-50"
                                    >
                                        Retake Photo
                                    </button>
                                    {!result && (
                                        <button 
                                            onClick={runAnalysis}
                                            disabled={isAnalyzing}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
                                        >
                                            {isAnalyzing ? 'Processing...' : 'Run Diagnostics'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="bg-zinc-900/60 border border-zinc-700/50 p-6 rounded-2xl shadow-xl min-h-[400px]">
                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center">
                                <ShieldCheck size={64} className="mb-4 opacity-20" />
                                <p>Upload an image and run diagnostics to see AI analysis results here.</p>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col animate-fadeIn">
                                <div className="flex items-start justify-between mb-6 pb-6 border-b border-zinc-800">
                                    <div>
                                        <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-1">Detected Issue</h3>
                                        <h2 className={`text-2xl font-bold ${result.confidence === 'High' ? 'text-red-400' : 'text-yellow-400'} flex items-center gap-2`}>
                                            <AlertTriangle size={24} />
                                            {result.disease} ({result.crop})
                                        </h2>
                                    </div>
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center min-w-[100px]">
                                        <p className="text-zinc-500 text-xs font-semibold mb-1">CONFIDENCE</p>
                                        <p className={`text-xl font-bold ${result.confidence === 'High' ? 'text-green-400' : result.confidence === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {result.confidence}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6 space-y-4">
                                    <h4 className="text-white font-medium mb-2">Diagnosis Documentation</h4>
                                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                                        <p className="text-zinc-400 leading-relaxed text-sm mb-3">
                                            <strong className="text-zinc-300">Symptoms:</strong> {result.symptoms}
                                        </p>
                                        <p className="text-zinc-400 leading-relaxed text-sm">
                                            <strong className="text-zinc-300">Probable Cause:</strong> {result.cause}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                            <CheckCircle2 size={18} className="text-green-500" />
                                            Recommended Treatment Plan
                                        </h4>
                                        <p className="text-zinc-300 text-sm bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                            {result.treatment}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-zinc-900 p-4 rounded-lg border border-green-900/50">
                                            <h5 className="text-green-400 font-semibold mb-2 flex items-center gap-2 text-sm"><Leaf size={16} /> Organic Methods</h5>
                                            <p className="text-zinc-400 text-xs leading-relaxed">{result.organic_solution}</p>
                                        </div>
                                        <div className="bg-zinc-900 p-4 rounded-lg border border-blue-900/50">
                                            <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2 text-sm"><ShieldAlert size={16} /> Chemical Methods</h5>
                                            <p className="text-zinc-400 text-xs leading-relaxed">{result.chemical_solution}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 bg-yellow-950/30 border border-yellow-900/50 p-4 rounded-lg">
                                        <h5 className="text-yellow-500 font-semibold mb-1 flex items-center gap-2 text-sm"><ShieldCheck size={16} /> Safety & Prevention</h5>
                                        <p className="text-zinc-400 text-xs leading-relaxed mb-2">{result.prevention}</p>
                                        <p className="text-zinc-400 text-xs leading-relaxed italic border-t border-zinc-800 pt-2">{result.safety_advice}</p>
                                    </div>
                                    
                                    <p className="text-[10px] text-zinc-500 text-center mt-6 uppercase tracking-wider">{result.disclaimer}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PestDetector;
