import logo from "../../assets/logo.jpg";
import { useEffect, useState } from "react";
import useUserStore from "../../store/useUserStore";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../../pages/more-section/LanguageSwitcher";
import DropdownFeature from "./DropdownFeature";
import DropdownHome from "./DropdownHome";
import DropdownAbout from "./DropdownAbout";
import DropdownMarketplace from "./DropdownMarketplace";
import DropdownSchemes from "./DropdownSchemes";
import DropdownContact from "./DropdownContact";
import DropdownProfile from "./DropdownProfile";
import useTranslation from "../../hooks/useTranslation";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import HomePageSidebar from "./HomePageSidebar";

export default function Header() {
  const { user: userData } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isTermsPage = location.pathname === "/terms";
  const isGuest = !userData || Object.keys(userData).length === 0;
  const showUserProfile = !isTermsPage || !isGuest;
  
  const userName = userData?.username || userData?.googleName || t("header.guest");
  const profilePic = userData?.profilePicture || userData?.googlePhoto;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-xl border-zinc-900 shadow-xl py-2 md:py-3"
          : "bg-transparent border-transparent py-3 md:py-5"
      }`}
    >
      <div className={`mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center max-w-7xl transition-all duration-500 ${!scrolled ? "filter drop-shadow-2xl" : ""}`}>
        {/* Logo */}
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group-hover:border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-colors">
            <img className="object-cover w-full h-full" src={logo} alt="Kisan Mithr Logo" />
          </div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 drop-shadow-sm">
            Kisan Mithr
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md rounded-full px-2 py-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          {/* HOME */}
          <div className="relative group">
            <a
              href="#"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              {t("navigationHome")}
            </a>
            <DropdownHome />
          </div>

          {/* ABOUT */}
          <div className="relative group">
            <a
              href="#"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              {t("navigationAbout")}
            </a>
            <DropdownAbout />
          </div>

          {/* SERVICES */}
          <div className="relative group">
            <a
              href="#"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              {t("navigationServices")}
            </a>
            <DropdownFeature />
          </div>

          {/* MARKETPLACE */}
          <div className="relative group">
            <a
              href="#"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              {t("navigationMarketplace")}
            </a>
            <DropdownMarketplace />
          </div>

          {/* SCHEMES */}
          <div className="relative group">
            <a
              href="#"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              {t("navigationSchemes")}
            </a>
            <DropdownSchemes />
          </div>

          {/* ANALYTICS & GROWTH */}
          {/* <div className="relative group">
            <a
              href="/analytics-growth"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              Analytics
            </a>
          </div> */}

          {/* CONTACT */}
          <div className="relative group">
            <a
              href="#"
              className={`transition-all duration-300 text-sm font-medium tracking-wide px-4 py-2 rounded-full ${
                scrolled
                  ? "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                  : "text-zinc-200 hover:text-white hover:bg-black/40"
              }`}
            >
              {t("navigationContact")}
            </a>
            <DropdownContact />
          </div>
        </nav>

        {/* Language & User Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <LanguageSwitcher scrolled={scrolled} />
          </div>

          {showUserProfile && (
            <div className="relative group flex items-center justify-center cursor-pointer ml-1">
              <div
                className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border-2 transition-all duration-300 shadow-xl ${
                  scrolled ? "border-zinc-700 bg-zinc-900 group-hover:border-green-500/50" : "border-white/20 bg-black/40 backdrop-blur-md group-hover:border-green-400"
                }`}
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={userName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-400 font-bold text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <DropdownProfile />
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`lg:hidden p-2 ml-1 rounded-lg transition-colors ${
              scrolled 
                ? "text-zinc-300 hover:bg-zinc-800/80 hover:text-white" 
                : "text-zinc-200 hover:bg-black/40 hover:text-white"
            }`}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
    <HomePageSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
