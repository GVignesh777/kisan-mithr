import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { 
    code: 'en-IN', 
    name: 'English', 
    native: 'English',
    fontClass: 'font-sans', 
    padding: 'py-2 px-3', 
    margin: 'mb-1',
    textClass: 'text-sm'
  },
  { 
    code: 'te-IN', 
    name: 'Telugu', 
    native: 'తెలుగు',
    fontClass: 'font-anek', 
    // Telugu script is rounder and slightly taller, requiring more vertical padding and margin
    padding: 'py-2.5 px-3', 
    margin: 'my-1.5',
    textClass: 'text-[15px] leading-relaxed' 
  },
  { 
    code: 'hi-IN', 
    name: 'Hindi', 
    native: 'हिंदी',
    fontClass: 'font-hind', 
    // Hindi script features the top line (Shirekha) and hangs down, needing balanced padding
    padding: 'py-2.5 px-3', 
    margin: 'my-1',
    textClass: 'text-[15px] leading-relaxed'
  },
];

const LanguageSelector = ({ language, setLanguage }) => {
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

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-900/40 hover:bg-green-800/50 backdrop-blur-md border border-green-400/20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-xl flex items-center justify-between min-w-[130px] gap-2 px-4 py-2.5 transition-all duration-300 ease-in-out"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <svg className="text-green-400 w-4 h-4 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M2 5h12" />
             <path d="M7 2h1" />
             <path d="m22 22-5-10-5 10" />
             <path d="M14 18h6" />
             <path d="m5 8 6 6" />
             <path d="m4 14 6-6 2-3" />
          </svg>
          <span className={`text-white font-medium ${currentLang.fontClass} ${currentLang.textClass} drop-shadow-md`}>
            {currentLang.native}
          </span>
        </div>
        <motion.div
           animate={{ rotate: isOpen ? 180 : 0 }}
           transition={{ duration: 0.2 }}
        >
          <svg className="text-green-200/70 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 origin-top-right bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
          >
            <div className="p-1.5" role="menu">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left flex items-center justify-between rounded-xl px-3 transition-colors duration-200 ${lang.margin} ${lang.padding} ${
                      isSelected 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={`${lang.fontClass} ${lang.textClass} font-semibold ${isSelected ? 'text-green-300' : 'text-gray-200'}`}>
                        {lang.native}
                      </span>
                      <span className="text-[11px] text-gray-500 font-inter font-normal uppercase tracking-wider">
                        {lang.name}
                      </span>
                    </div>

                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="text-green-400 bg-green-400/10 p-1.5 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

export default LanguageSelector;
