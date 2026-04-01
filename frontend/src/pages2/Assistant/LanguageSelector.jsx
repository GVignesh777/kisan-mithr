import React from 'react';
import useLanguageStore from '../../store/useLanguageStore';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguageStore();
  return (
    <div className="bg-green-900/40 backdrop-blur-md border border-green-400/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] p-1 rounded-xl flex items-center gap-1">
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent text-white font-medium text-sm outline-none cursor-pointer px-3 py-1.5 appearance-none"
      >
        <option value="en" className="bg-zinc-900 text-white">English</option>
        <option value="te" className="bg-zinc-900 text-white">తెలుగు (Telugu)</option>
        <option value="hi" className="bg-zinc-900 text-white">हिंदी (Hindi)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
