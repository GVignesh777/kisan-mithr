import React from "react";
import { X } from "lucide-react";
import useTranslation from "../../hooks/useTranslation";
import DropdownHome from "./DropdownHome";
import DropdownAbout from "./DropdownAbout";
import DropdownFeature from "./DropdownFeature";
import DropdownMarketplace from "./DropdownMarketplace";
import DropdownSchemes from "./DropdownSchemes";
import DropdownContact from "./DropdownContact";

const HomePageSidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
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
              <a href="#" className="flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium">
                {t("navigationHome")}
              </a>
              <div className="pl-4">
                <DropdownHome isMobile={true} />
              </div>
            </div>

            {/* ABOUT */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <a href="#" className="flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium">
                {t("navigationAbout")}
              </a>
              <div className="pl-4">
                <DropdownAbout isMobile={true} />
              </div>
            </div>

            {/* SERVICES */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <a href="#" className="flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium">
                {t("navigationServices")}
              </a>
              <div className="pl-4">
                <DropdownFeature isMobile={true} />
              </div>
            </div>

            {/* MARKETPLACE */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <a href="#" className="flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium">
                {t("navigationMarketplace")}
              </a>
              <div className="pl-4">
                 <DropdownMarketplace isMobile={true} />
              </div>
            </div>

            {/* SCHEMES */}
            <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 pt-2">
              <a href="#" className="flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium">
                {t("navigationSchemes")}
              </a>
              <div className="pl-4">
                 <DropdownSchemes isMobile={true} />
              </div>
            </div>

            {/* CONTACT */}
            <div className="flex flex-col gap-1 pt-2">
              <a href="#" className="flex items-center justify-between text-zinc-300 hover:text-green-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors font-medium">
                {t("navigationContact")}
              </a>
              <div className="pl-4">
                 <DropdownContact isMobile={true} />
              </div>
            </div>
            
          </nav>
        </div>
      </div>
    </>
  );
};

export default HomePageSidebar;
