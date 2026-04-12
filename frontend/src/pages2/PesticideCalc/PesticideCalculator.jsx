import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowRightLeft, Droplets, Map, Leaf, Calculator, AlertCircle, 
  Wind, Sun, CloudRain, MapPin, Mic, Volume2, ShieldAlert, Thermometer,
  Clock, Download, History
} from "lucide-react";
import useTranslation from "../../hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { cropPesticideData } from "../../utils/pesticideData";
import { toast } from "react-toastify";

// Component-specific translations to support En + Te
const localT = {
  en: {
    title: "Smart Pesticide Calculator",
    subtitle: "Professional digital farming assistant. Calculate precise dosage, water requirements, and get smart safety insights.",
    smartInsights: "Smart Insights & Advisory",
    weatherWarning: "Weather Warning",
    locationSuggest: "Location-based Suggestion",
    voicePrompt: "Voice Assistant Active. Try saying '5 acres'...",
    tapToSpeak: "Tap to Speak",
    modeLand: "Land → Pesticide",
    modePest: "Pesticide → Land",
    cropType: "Select Crop",
    pesticideType: "Select Pesticide / Treatment",
    landArea: "Land Area",
    availablePest: "Available Pesticide",
    waterReq: "Water Required",
    reqPest: "Required Pesticide",
    landCover: "Land You Can Cover",
    safetyTips: "Safety Tips",
    bestTime: "Best Time to Spray",
    download: "Download Result",
    saveHistory: "Save to History",
    history: "Recent Calcs",
    inputPromptLand: "How much land do you have?",
    inputPromptPest: "How much pesticide do you have?",
    smartAdvisory: "Smart Advisory",
    sprayEvenly: "Spray evenly across the field. Do not exceed the recommended limit.",
    morningEvening: "Early morning or late evening.",
    rainAlert: "High chance of rain today. Avoid spraying to prevent chemical wash-off.",
    locMsg: "Based on your region (Andhra Pradesh/Telangana), Cotton and Paddy are high-risk for pests this season.",
    voiceDetect: "Voice Detected",
    listenComplete: "Voice input processed."
  },
  te: {
    title: "స్మార్ట్ పురుగుమందుల క్యాలిక్యులేటర్",
    subtitle: "ప్రొఫెషనల్ డిజిటల్ వ్యవసాయ సహాయకుడు. కచ్చితమైన మోతాదు, నీటి అవసరాలను లెక్కించండి మరియు భద్రతా సలహాలను పొందండి.",
    smartInsights: "స్మార్ట్ సలహాలు & సూచనలు",
    weatherWarning: "వాతావరణ హెచ్చరిక",
    locationSuggest: "ప్రాంతీయ సూచన",
    voicePrompt: "వాయిస్ ఆక్టివ్. '5 ఎకరాలు' అని చెప్పడానికి ప్రయత్నించండి...",
    tapToSpeak: "మాట్లాడటానికి నొక్కండి",
    modeLand: "భూమి → పురుగుమందు",
    modePest: "పురుగుమందు → భూమి",
    cropType: "పంటను ఎంచుకోండి",
    pesticideType: "పురుగుమందును ఎంచుకోండి",
    landArea: "భూమి విస్తీర్ణం",
    availablePest: "అందుబాటులో ఉన్న పురుగుమందు",
    waterReq: "అవసరమైన నీరు",
    reqPest: "అవసరమైన పురుగుమందు",
    landCover: "సరిపడే భూమి",
    safetyTips: "భద్రతా సూచనలు",
    bestTime: "పిచికారీకి సరైన సమయం",
    download: "ఫలితాన్ని డౌన్‌లోడ్ చేయండి",
    saveHistory: "చరిత్రలో సేవ్ చేయండి",
    history: "క్రిందటి లెక్కలు",
    inputPromptLand: "మీకు ఎంత భూమి ఉంది?",
    inputPromptPest: "మీ వద్ద ఎంత పురుగుమందు ఉంది?",
    smartAdvisory: "స్మార్ట్ సలహా",
    sprayEvenly: "పొలమంతా సమంగా పిచికారీ చేయండి. సిఫార్సు చేసిన పరిమితిని మించకూడదు.",
    morningEvening: "ఉదయం లేదా సాయంత్రం వేళల్లో.",
    rainAlert: "ఈరోజు వర్షం పడే అవకాశం ఉంది. మందు కొట్టుకుపోకుండా ఉండటానికి పిచికారీని నివారించండి.",
    locMsg: "మీ ప్రాంతం ఆధారంగా, ఈ సీజన్‌లో పత్తి మరియు వరి తెగుళ్లకు గురయ్యే ప్రమాదం ఉంది.",
    voiceDetect: "వాయిస్ గుర్తించబడింది",
    listenComplete: "వాయిస్ ఇన్పుట్ పూర్తయింది."
  }
};

const PesticideCalculator = () => {
  const { language } = useTranslation();
  const langKey = language?.includes('te') ? 'te' : 'en';
  const tLocal = localT[langKey];

  const [mode, setMode] = useState("landToPest"); // 'landToPest' | 'pestToLand'
  
  // Selections
  const [selectedCropId, setSelectedCropId] = useState(cropPesticideData[0].id);
  const [selectedPestId, setSelectedPestId] = useState(cropPesticideData[0].pesticides[0].id);

  const selectedCrop = cropPesticideData.find(c => c.id === selectedCropId);
  const selectedPest = selectedCrop?.pesticides.find(p => p.id === selectedPestId) || selectedCrop?.pesticides[0];

  // Inputs
  const [landArea, setLandArea] = useState(1);
  const [landUnit, setLandUnit] = useState("acres"); // 'acres' | 'hectares'
  
  const [pesticideQty, setPesticideQty] = useState(1);
  const [pesticideUnit, setPesticideUnit] = useState("liters"); // 'ml' | 'liters'

  // Results
  const [calculatedResult, setCalculatedResult] = useState(null);
  const [waterRequired, setWaterRequired] = useState(0);

  // Extras
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);

  // Voice Interaction Mock (Using Web Speech API if available)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (selectedCrop && !selectedCrop.pesticides.find(p => p.id === selectedPestId)) {
        setSelectedPestId(selectedCrop.pesticides[0].id);
    }
  }, [selectedCropId]);

  useEffect(() => {
    calculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, landArea, landUnit, pesticideQty, pesticideUnit, selectedCropId, selectedPestId]);

  const calculate = () => {
    if(!selectedCrop || !selectedPest) return;

    const rate = selectedPest.dosagePerAcre; // ml per acre
    const waterRate = selectedCrop.waterPerAcre; // liters per acre
    
    if (mode === "landToPest") {
      let areaInAcres = Number(landArea);
      if (landUnit === "hectares") areaInAcres = areaInAcres * 2.47105;
      
      let requiredMl = areaInAcres * rate;
      let displayQty = requiredMl;
      let displayUnit = "ml";
      
      if (requiredMl >= 1000) {
        displayQty = requiredMl / 1000;
        displayUnit = "Liters";
      }
      
      setWaterRequired((areaInAcres * waterRate).toFixed(0));
      setCalculatedResult({
        value: displayQty.toFixed(2),
        unit: displayUnit,
      });
      
    } else {
      let qtyInMl = Number(pesticideQty);
      if (pesticideUnit === "liters") qtyInMl = qtyInMl * 1000;
      
      let coveredAcres = qtyInMl / rate;
      let displayArea = coveredAcres;
      let displayUnit = "Acres";
      
      if (landUnit === "hectares") {
         displayArea = coveredAcres / 2.47105;
         displayUnit = "Hectares";
      }
      
      setWaterRequired((coveredAcres * waterRate).toFixed(0));
      setCalculatedResult({
        value: displayArea.toFixed(2),
        unit: displayUnit,
      });
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
        toast.error("Your browser does not support Voice Recognition.");
        return;
    }
    
    if(isListening) {
        recognition.stop();
        setIsListening(false);
        return;
    }

    recognition.lang = langKey === 'te' ? 'te-IN' : 'en-IN';
    recognition.start();
    setIsListening(true);
    toast.info(tLocal.voicePrompt);

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setIsListening(false);
        
        // Very basic NLP extraction for demo
        const numbers = transcript.match(/\d+/);
        if(numbers) {
            if(mode === "landToPest") {
                setLandArea(Number(numbers[0]));
                toast.success(`${tLocal.voiceDetect}: ${numbers[0]}`);
            } else {
                setPesticideQty(Number(numbers[0]));
                toast.success(`${tLocal.voiceDetect}: ${numbers[0]}`);
            }
        } else {
            toast.success(tLocal.listenComplete);
        }
    };

    recognition.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition failed.");
    };
  };

  const saveToHistory = () => {
    if(!calculatedResult) return;
    const item = {
        date: new Date().toLocaleTimeString(),
        crop: langKey === 'te' ? selectedCrop.nameTe : selectedCrop.nameEn,
        mode,
        result: `${calculatedResult.value} ${calculatedResult.unit}`,
        water: `${waterRequired} L`
    };
    setHistory([item, ...history].slice(0, 5));
    toast.success("Saved to history");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 font-sans overflow-x-hidden bg-zinc-950 selection:bg-green-500/30">
      
      {/* Dynamic Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Advanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md mb-6 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-bold tracking-wide text-emerald-300 uppercase">
              AI Farming Assistant
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-md">
            Smart Pesticide <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">Calculator</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto font-light">
            {tLocal.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
          {/* LEFT COLUMN: Input & Calculator (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
              
            {/* Mode Switcher */}
            <div className="flex p-1.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-inner">
              <button 
                onClick={() => setMode("landToPest")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm md:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === "landToPest" ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
              >
                <Map className="w-5 h-5" /> {tLocal.modeLand}
              </button>
              <button 
                onClick={() => setMode("pestToLand")}
                className={`flex-1 py-3 px-4 rounded-xl text-sm md:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === "pestToLand" ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
              >
                <Droplets className="w-5 h-5" /> {tLocal.modePest}
              </button>
            </div>

            {/* Smart Inputs Card */}
            <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl p-6 md:p-8 shadow-2xl relative">
              
              {/* Voice Floating Button */}
              <button 
                onClick={handleVoiceInput}
                className={`absolute -top-5 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 ${isListening ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-emerald-500 hover:text-emerald-400 text-white'}`}
                title={tLocal.tapToSpeak}
              >
                <Mic className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
                 {/* Crop Dropdown */}
                 <div className="space-y-2">
                    <label className="text-zinc-400 text-sm font-semibold flex items-center gap-2 uppercase tracking-wide">
                        <Leaf className="w-4 h-4 text-emerald-400" /> {tLocal.cropType}
                    </label>
                    <select 
                        value={selectedCropId}
                        onChange={(e) => setSelectedCropId(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white font-medium outline-none appearance-none cursor-pointer"
                    >
                        {cropPesticideData.map(c => (
                            <option key={c.id} value={c.id} className="bg-zinc-900">{langKey === 'te' ? c.nameTe : c.nameEn}</option>
                        ))}
                    </select>
                 </div>

                 {/* Pesticide Dropdown */}
                 <div className="space-y-2">
                    <label className="text-zinc-400 text-sm font-semibold flex items-center gap-2 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-sky-400" /> {tLocal.pesticideType}
                    </label>
                    <select 
                        value={selectedPestId}
                        onChange={(e) => setSelectedPestId(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-sky-500/50 rounded-xl px-4 py-3 text-white font-medium outline-none appearance-none cursor-pointer"
                    >
                        {selectedCrop?.pesticides.map(p => (
                            <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
                        ))}
                    </select>
                    {selectedPest && (
                        <p className="text-xs text-sky-400/80 mt-1 pl-1">
                            Protects against: {langKey === 'te' ? selectedPest.targetPestTe : selectedPest.targetPestEn}
                        </p>
                    )}
                 </div>
              </div>

              <hr className="border-border border-zinc-800 my-6" />

               {/* Numeric Input Section */}
              <AnimatePresence mode="wait">
              {mode === "landToPest" ? (
                <motion.div 
                  key="landArea"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <label className="text-white text-lg font-bold flex items-center gap-2">
                     {tLocal.inputPromptLand}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="number"
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      className="flex-1 bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-6 py-5 text-3xl text-white font-black outline-none transition-all"
                    />
                    <select 
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value)}
                      className="sm:w-48 bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 rounded-2xl px-6 py-5 text-lg text-white font-bold outline-none cursor-pointer hover:bg-zinc-800"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                  {/* Slider */}
                  <input 
                    type="range" min="1" max="50" step="0.5" 
                    value={landArea} onChange={(e) => setLandArea(e.target.value)}
                    className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="pestQty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <label className="text-white text-lg font-bold flex items-center gap-2">
                     {tLocal.inputPromptPest}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="number"
                      value={pesticideQty}
                      onChange={(e) => setPesticideQty(e.target.value)}
                      className="flex-1 bg-zinc-950 border-2 border-zinc-800 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-2xl px-6 py-5 text-3xl text-white font-black outline-none transition-all"
                    />
                    <select 
                      value={pesticideUnit}
                      onChange={(e) => setPesticideUnit(e.target.value)}
                      className="sm:w-48 bg-zinc-900 border border-zinc-800 focus:border-sky-500/50 rounded-2xl px-6 py-5 text-lg text-white font-bold outline-none cursor-pointer hover:bg-zinc-800"
                    >
                      <option value="ml">Milliliters (ml)</option>
                      <option value="liters">Liters (L)</option>
                    </select>
                  </div>
                   {/* Slider */}
                   <input 
                    type="range" min="1" max="1000" step="10" 
                    value={pesticideQty} onChange={(e) => setPesticideQty(e.target.value)}
                    className="w-full accent-sky-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            </div>

             {/* Output Card */}
             {calculatedResult && (
                <div className="bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-sky-900/20 border border-emerald-500/30 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full relative z-10">
                    
                    {/* Primary Output */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                             {mode === "landToPest" ? <Droplets size={32} /> : <Map size={32} />}
                        </div>
                        <p className="text-emerald-400/80 font-bold uppercase tracking-widest text-sm mb-2">
                           {mode === "landToPest" ? tLocal.reqPest : tLocal.landCover}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl md:text-7xl font-black text-white">{calculatedResult.value}</span>
                            <span className="text-2xl font-bold text-emerald-300">{calculatedResult.unit}</span>
                        </div>
                    </div>

                    {/* Secondary Output (Water) */}
                    <div className="flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-zinc-700/50 pt-8 md:pt-0">
                        <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                             <CloudRain size={32} />
                        </div>
                        <p className="text-sky-400/80 font-bold uppercase tracking-widest text-sm mb-2">
                           {tLocal.waterReq}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl md:text-7xl font-black text-white">{waterRequired}</span>
                            <span className="text-2xl font-bold text-sky-300">Liters</span>
                        </div>
                    </div>

                  </div>

                  <div className="w-full flex gap-4 justify-center mt-8 relative z-10">
                      <button onClick={saveToHistory} className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors border border-zinc-700">
                          <History size={16} /> {tLocal.saveHistory}
                      </button>
                      <button className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm flex items-center gap-2 transition-colors border border-zinc-700">
                          <Download size={16} /> {tLocal.download}
                      </button>
                  </div>
                </div>
             )}

          </div>

          {/* RIGHT COLUMN: Smart Insights & Advisory (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-6">
              
            <div className="flex items-center gap-3 mb-2">
                <Volume2 className="text-teal-400 w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">{tLocal.smartInsights}</h2>
            </div>

            {/* Smart Advisory Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    <Leaf size={14} /> {tLocal.smartAdvisory}
                </h3>
                <p className="text-zinc-300 font-medium mb-3">
                   <strong className="text-white">Crop selected:</strong> {langKey === 'te' ? selectedCrop.nameTe : selectedCrop.nameEn}
                </p>
                <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl text-emerald-200 text-sm">
                   ✅ {tLocal.sprayEvenly}
                </div>
            </div>

            {/* Safety Tips Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 text-orange-500/5 pointer-events-none" />
                <h3 className="text-orange-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} /> {tLocal.safetyTips}
                </h3>
                <p className="text-white text-lg font-bold mb-2">{selectedPest?.name}</p>
                <p className="text-zinc-300 text-sm bg-orange-950/20 p-4 rounded-xl border border-orange-900/30 leading-relaxed font-medium">
                    {langKey === 'te' ? selectedPest?.safetyWarningTe : selectedPest?.safetyWarningEn}
                </p>
                
                <div className="flex items-center gap-3 mt-4 text-zinc-400 text-sm font-semibold">
                    <Clock size={16} className="text-sky-400" />
                    <span>{tLocal.bestTime}: <span className="text-white">{tLocal.morningEvening}</span></span>
                </div>
            </div>

            {/* Premium Modules (Weather & Location) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                 {/* Weather Mock */}
                 <div className="bg-gradient-to-br from-indigo-950/50 to-zinc-900 border border-indigo-500/20 rounded-2xl p-6">
                    <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <Sun size={14} /> {tLocal.weatherWarning}
                    </h3>
                    <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                             <CloudRain className="text-indigo-400 w-6 h-6" />
                         </div>
                         <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                            {tLocal.rainAlert}
                         </p>
                    </div>
                 </div>

                 {/* Location Mock */}
                 <div className="bg-gradient-to-br from-fuchsia-950/50 to-zinc-900 border border-fuchsia-500/20 rounded-2xl p-6">
                    <h3 className="text-fuchsia-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                        <MapPin size={14} /> {tLocal.locationSuggest}
                    </h3>
                    <p className="text-fuchsia-200 text-sm font-medium leading-relaxed">
                        {tLocal.locMsg}
                    </p>
                 </div>
            </div>

          </div>

        </div>

        {/* History Section (Bottom) */}
        {history.length > 0 && (
            <div className="mt-12">
                <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><History className="text-emerald-400"/> {tLocal.history}</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {history.map((h, i) => (
                        <div key={i} className="flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-w-[200px]">
                            <p className="text-xs text-zinc-500 mb-2">{h.date} • {h.mode === 'landToPest' ? 'Req Pest' : 'Req Land'}</p>
                            <p className="text-white font-bold">{h.crop}</p>
                            <p className="text-emerald-400 text-lg font-black">{h.result}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default PesticideCalculator;
