import useLanguageStore from "../../store/useLanguageStore";
import { Globe } from "lucide-react";

const LanguageSwitcher = ({ scrolled }) => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="flex items-center relative group">
      <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors z-10 ${scrolled ? 'text-zinc-400 group-hover:text-green-500' : 'text-zinc-300 group-hover:text-green-400'}`}>
        <Globe size={16} />
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={`appearance-none pl-9 pr-8 py-2 rounded-full border border-zinc-700/50 shadow-sm focus:outline-none focus:border-green-500 transition-all duration-300 cursor-pointer text-sm font-medium backdrop-blur-md ${
          scrolled 
            ? 'bg-zinc-900/50 text-zinc-300 hover:text-white hover:bg-zinc-800/80 border-zinc-700/50' 
            : 'bg-black/30 text-white hover:bg-black/50 border-white/20'
        } ${language === 'hi' ? 'font-hind' : language === 'te' ? 'font-anek' : 'font-sans'}`}
      >
        <option value="en" className="bg-zinc-900 text-white font-sans">English</option>
        <option value="hi" className="bg-zinc-900 text-white font-hind">हिंदी</option>
        <option value="te" className="bg-zinc-900 text-white font-anek">తెలుగు</option>
      </select>
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${scrolled ? 'text-zinc-500 group-hover:text-green-500' : 'text-zinc-400 group-hover:text-green-400'}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
