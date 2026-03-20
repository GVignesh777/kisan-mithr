import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Camera, X, Leaf, ShieldAlert, AlertTriangle, ShieldCheck, ThermometerSun, Sprout, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import useLanguageStore from '../../store/useLanguageStore';

const CropDoctor = () => {
  const { language } = useLanguageStore();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Auto clean-up Object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error(language === 'en' ? 'Please upload a valid image (JPG or PNG)' : 'దయచేసి సరైన చిత్రాన్ని అప్‌లోడ్ చేయండి');
      return;
    }

    // Validate size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(language === 'en' ? 'Image size must be less than 5MB' : 'చిత్రం పరిమాణం 5MB కంటే తక్కువ ఉండాలి');
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null); // Clear previous results when new image is selected
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeCrop = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Send user meta context for backend translation/storage
    const storedUser = localStorage.getItem('user');
    let userId = null;
    if (storedUser) {
        try { userId = JSON.parse(storedUser)._id; } catch(e){}
    }
    if (userId) formData.append('userId', userId);
    
    // Explicitly send the current frontend language code to the backend so the AI translates the output automatically
    formData.append('language', language);
    
    // Native browser Geolocation for future localized AI advice
    if ("geolocation" in navigator) {
      try {
         const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
         formData.append('location', `${pos.coords.latitude},${pos.coords.longitude}`);
      } catch(e) { /* Ignore geolocation failures, silent fallback */ }
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/analyze-crop`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      toast.success(language === 'en' ? 'Analysis Complete!' : 'విశ్లేషణ పూర్తయింది!');
    } catch (error) {
      console.error('Crop Analysis Error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze crop image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // UI Helper for Confidence Badges
  const getConfidenceColor = (conf) => {
    if (!conf) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch(conf.toLowerCase()) {
      case 'high': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50 to-transparent -z-10" />
      <div className="absolute top-10 right-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-2 shadow-sm border border-emerald-200">
             <Leaf className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
            AI Crop <span className="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-500">Doctor</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
             {language === 'te' 
               ? 'వ్యాధులను గుర్తించడానికి ప్రావీణ్యం ఉన్న AI ఉపయోగించి మీ పంట యొక్క చిత్రాన్ని అప్‌లోడ్ చేయండి'
               : language === 'hi' 
                 ? 'रोगों की पहचान करने के लिए एआई का उपयोग करके अपनी फसल की तस्वीर अपलोड करें'
                 : 'Upload a plant or crop image to instantly identify diseases, pests, and get expert treatment suggestions.'}
          </p>
        </div>

        {/* Upload Interface */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 relative overflow-hidden">
           
           {!previewUrl ? (
             <div 
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-out flex flex-col items-center justify-center py-16 px-4 cursor-pointer overflow-hidden ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30'}`}
               onClick={() => fileInputRef.current?.click()}
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/jpeg, image/png, image/jpg" 
                  className="hidden" 
                />
                
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-inner">
                   <UploadCloud size={40} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Drag & Drop crop image</h3>
                <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
                  Support for JPG, JPEG, PNG. Max file size 5MB. Make sure the leaf or affected area is clearly focused.
                </p>
                
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5">
                    <Search className="w-4 h-4" /> Browse Files
                  </button>
                  {/* Camera button triggers same file input but accepts mobile camera directly */}
                  <button 
                     onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                     className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-full font-bold shadow-sm transition-all"
                  >
                    <Camera className="w-4 h-4" /> Camera
                  </button>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                {/* Image Preview Area */}
                <div className="relative rounded-2xl overflow-hidden bg-black/5 aspect-video md:aspect-[21/9] flex items-center justify-center border border-gray-200">
                   <img src={previewUrl} alt="Crop Preview" className={`max-h-full max-w-full object-contain ${isAnalyzing ? 'blur-[2px] scale-105' : 'scale-100'} transition-all duration-700`} />
                   
                   {/* Scanning Animation Overlay */}
                   {isAnalyzing && (
                     <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply" />
                        <motion.div 
                           className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(52,211,153,0.5)] absolute top-0"
                           animate={{ top: ['0%', '100%', '0%'] }}
                           transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                           <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl shadow-2xl flex items-center justify-center animate-pulse">
                              <Search className="text-emerald-600 w-8 h-8 animate-spin-slow" />
                           </div>
                           <span className="bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm tracking-wide shadow-xl flex items-center gap-2">
                             <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing leaf patterns...
                           </span>
                        </div>
                     </div>
                   )}

                   <button 
                     onClick={clearImage}
                     disabled={isAnalyzing}
                     className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 hover:text-red-600 p-2 rounded-full shadow-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-0"
                   >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                {/* Analysis Action */}
                {!result && !isAnalyzing && (
                  <div className="flex justify-center">
                    <button 
                       onClick={analyzeCrop}
                       className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                       <span className="relative z-10">Scan Crop for Diseases</span>
                       <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden"
            >
              {/* Result Header */}
              <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-6 md:p-8 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
                 
                 <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                         <ShieldCheck className="w-3.5 h-3.5" /> AI Diagnostic Report
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
                        {result.crop || 'Unknown Crop'}
                      </h2>
                      <div className="flex items-center gap-3 text-emerald-50">
                        <BugIcon />
                        <span className="text-lg font-medium">{result.disease || 'Healthy'}</span>
                      </div>
                    </div>

                    <div className="flex md:justify-end">
                       <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full md:w-auto">
                          <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider mb-2">AI Confidence Score</p>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold border ${getConfidenceColor(result.confidence)} bg-opacity-90`}>
                             <ThermometerSun className="w-5 h-5" />
                             {result.confidence} Confidence
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Data Cards Grid */}
              <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 bg-gray-50/50">
                 
                 {/* Symptoms */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                          <AlertTriangle className="w-5 h-5" />
                       </div>
                       <h3 className="text-lg font-bold text-gray-900">Symptoms & Cause</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">{result.symptoms}</p>
                    <div className="inline-block bg-orange-50 px-4 py-2+ rounded-xl text-sm text-orange-800 border border-orange-100/50">
                       <span className="font-bold">Probable Cause:</span> {result.cause}
                    </div>
                 </div>

                 {/* Treatment */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <ShieldCheck className="w-5 h-5" />
                       </div>
                       <h3 className="text-lg font-bold text-gray-900">Recommended Treatment</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{result.treatment}</p>
                 </div>

                 {/* Solutions Grid */}
                 <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                       <div className="flex items-center gap-2 mb-2">
                         <Leaf className="w-4 h-4 text-emerald-600" />
                         <h4 className="font-bold text-emerald-900">Organic Solution</h4>
                       </div>
                       <p className="text-sm text-emerald-800 leading-relaxed">{result.organic_solution || 'No specific organic solution identified for this severe stage.'}</p>
                    </div>
                    
                    <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                       <div className="flex items-center gap-2 mb-2">
                         <Sprout className="w-4 h-4 text-indigo-600" />
                         <h4 className="font-bold text-indigo-900">Chemical Solution</h4>
                       </div>
                       <p className="text-sm text-indigo-800 leading-relaxed">{result.chemical_solution || 'Not recommended at this stage.'}</p>
                    </div>
                 </div>

                 {/* Prevention */}
                 <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-500 w-5 h-5" /> Future Prevention
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{result.prevention}</p>
                 </div>

              </div>
              
              {/* Footer Disclaimers */}
              <div className="bg-amber-50 border-t border-amber-100 p-6 md:px-8">
                 <div className="flex gap-4 items-start">
                    <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    <div>
                       <h4 className="font-bold text-amber-900 mb-1">Safety Advice & Medical Disclaimer</h4>
                       <p className="text-sm text-amber-700 mb-3 leading-relaxed">{result.safety_advice}</p>
                       <p className="text-xs text-amber-600/80 italic border-t border-amber-200/50 pt-2 font-medium">
                         {result.disclaimer || '⚠ This is an AI-based analysis and may not always be accurate. Please consult a local agricultural officer, plant doctor, or crop expert before applying treatments.'}
                       </p>
                    </div>
                 </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CropDoctor;

// Custom SVG Bug Icon
const BugIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
    <path d="m8 2 1.88 1.88"/>
    <path d="M14.12 3.88 16 2"/>
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
    <path d="M12 20v-9"/>
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5"/>
    <path d="M17.47 9c1.93-.2 3.53-1.9 3.53-4"/>
    <path d="M8 14H4"/>
    <path d="M20 14h-4"/>
    <path d="M9 18h6"/>
  </svg>
);
