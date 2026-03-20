import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const voices = [
  { id: 'default', name: 'Standard', description: 'Assistant', icon: '👤' },
  { id: 'Tiya Maria', name: 'Tiya Maria', description: 'Horror Storyteller', icon: '🕯️' },
];

const VoiceCharacterSelector = ({ selectedVoice, setSelectedVoice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentVoice = voices.find((v) => v.id === selectedVoice) || voices[0];

  return (
    <div className="relative inline-block text-left z-50 ml-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-900/60 hover:bg-zinc-800/70 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-xl flex items-center justify-between min-w-[140px] gap-2 px-4 py-2.5 transition-all duration-300 ease-in-out"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg drop-shadow-sm">{currentVoice.icon}</span>
          <div className="flex flex-col items-start leading-none gap-1">
             <span className="text-white font-medium text-xs tracking-tight">{currentVoice.name}</span>
             <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">Voice</span>
          </div>
        </div>
        <motion.div
           animate={{ rotate: isOpen ? 180 : 0 }}
           transition={{ duration: 0.2 }}
        >
          <svg className="text-zinc-500 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-52 origin-top-right bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
          >
            <div className="p-1.5" role="menu">
              <div className="px-3 py-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest border-b border-white/5 mb-1">
                 Select Voice Profile
              </div>
              {voices.map((v) => {
                const isSelected = selectedVoice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-200 mb-1 ${
                      isSelected 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{v.icon}</span>
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[13px] font-semibold ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {v.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          {v.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="text-emerald-400"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCharacterSelector;
