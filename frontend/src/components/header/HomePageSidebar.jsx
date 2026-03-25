import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import useTranslation from "../../hooks/useTranslation";
import DropdownHome from "./DropdownHome";
import DropdownAbout from "./DropdownAbout";
import DropdownFeature from "./DropdownFeature";
import DropdownMarketplace from "./DropdownMarketplace";
import DropdownSchemes from "./DropdownSchemes";
import DropdownContact from "./DropdownContact";

const HomePageSidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [openSection, setOpenSection] = useState("");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? "" : section);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-4">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
              Kisan Mithr
            </span>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-2">
            {/* HOME */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2">
              <button 
                onClick={() => toggleSection('home')}
                className="w-full flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium"
              >
                <span>{t("navigationHome")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'home' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'home' && (
                <div className="pl-4 animate-fadeIn">
                  <DropdownHome isMobile={true} />
                </div>
              )}
            </div>

            {/* ABOUT */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <button 
                onClick={() => toggleSection('about')}
                className="w-full flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium"
              >
                <span>{t("navigationAbout")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'about' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'about' && (
                <div className="pl-4 animate-fadeIn">
                  <DropdownAbout isMobile={true} onClose={onClose} />
                </div>
              )}
            </div>

            {/* SERVICES */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <button 
                onClick={() => toggleSection('services')}
                className="w-full flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium"
              >
                <span>{t("navigationServices")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'services' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'services' && (
                <div className="pl-4 animate-fadeIn">
                  <DropdownFeature isMobile={true} />
                </div>
              )}
            </div>

            {/* MARKETPLACE */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <button 
                onClick={() => toggleSection('marketplace')}
                className="w-full flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium"
              >
                <span>{t("navigationMarketplace")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'marketplace' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'marketplace' && (
                <div className="pl-4 animate-fadeIn">
                  <DropdownMarketplace isMobile={true} />
                </div>
              )}
            </div>

            {/* SCHEMES */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <button 
                onClick={() => toggleSection('schemes')}
                className="w-full flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium"
              >
                <span>{t("navigationSchemes")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'schemes' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'schemes' && (
                <div className="pl-4 animate-fadeIn">
                  <DropdownSchemes isMobile={true} />
                </div>
              )}
            </div>

            {/* CONTACT */}
            <div className="flex flex-col gap-1 pt-2">
              <button 
                onClick={() => toggleSection('contact')}
                className="w-full flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium"
              >
                <span>{t("navigationContact")}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'contact' ? 'rotate-180' : ''}`} />
              </button>
              {openSection === 'contact' && (
                <div className="pl-4 animate-fadeIn">
                  <DropdownContact isMobile={true} />
                </div>
              )}
            </div>
            
          </nav>
        </div>
      </div>
    </>
  );
};

export default HomePageSidebar;
