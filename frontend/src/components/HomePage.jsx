import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Role from "./Role";
import Header from "./header/Header";
import heroBG from "../assets/hero-bg.jpg";
import useTranslation from "../hooks/useTranslation";
import { Mic, CloudSun, LineChart, Leaf, ArrowRight, MessageSquare, Send, User, Mail, Bot } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import useUserStore from "../store/useUserStore";

const HomePage = () => {
  const [showProfile, setShowProfile] = useState(false);  
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();

  const [feedback, setFeedback] = useState({
    name: user?.username || user?.googleName || "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) {
      toast.warning("Please enter your message or complaint.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/feedback`, {
        userName: feedback.name || "Anonymous Farmer",
        message: feedback.message,
        userId: user?.id || user?._id
      });
      toast.success("Thank you! Your feedback has been sent to the admin.");
      setFeedback({ ...feedback, message: "" });
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Failed to send feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-zinc-950 min-h-screen font-sans selection:bg-green-500/30">
      
      {/* Hero Section */}
      <div className="relative h-screen w-full flex flex-col justify-center overflow-hidden">
        
        {/* Background Image with Parallax & Darkening Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transform scale-105 transition-transform duration-[20s] ease-out"
          style={{ backgroundImage: `url(${heroBG})` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/50 to-zinc-950 backdrop-blur-[2px]" />

        <div className="z-50 absolute top-0 w-full object-top">
          <Header />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center md:items-start text-center md:text-left mt-16 md:mt-24">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-md mb-8 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium tracking-wide text-green-300 uppercase">
              {t("welcome")}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
            {t("empoweringFarmers")} <br className="hidden md:block"/>
            {t("withSmart")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400">{t("digitalSolutions")}</span>
          </h1>

          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-light drop-shadow-lg">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate('/assistant')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              <Mic size={20} /> {t("tryVoiceAssistant")}
            </button>
            <button 
              onClick={() => navigate('/market')}
              className="px-8 py-4 rounded-xl bg-zinc-900/50 backdrop-blur-md border border-zinc-700 hover:border-zinc-500 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:bg-zinc-800"
            >
              {t("exploreMarkets")} <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-zinc-500 text-sm tracking-widest uppercase">{t("scroll")}</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-zinc-500 to-transparent"></div>
        </div>
      </div>

      {/* Features Showcase Section */}
      <div className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t("everythingYouNeed")}</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">{t("integratedTools")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: t("aiVoiceAssistant"),
              desc: t("aiVoiceDesc"),
              icon: <Mic className="w-8 h-8 text-green-400" />,
              link: "/assistant",
            },
            {
              title: t("liveMarketPrices"),
              desc: t("liveMarketDesc"),
              icon: <LineChart className="w-8 h-8 text-emerald-400" />,
              link: "/market",
            },
            {
              title: t("weatherIntelligence"),
              desc: t("weatherIntelDesc"),
              icon: <CloudSun className="w-8 h-8 text-sky-400" />,
              link: "/weather",
            },
            {
              title: t("cropHealthPests"),
              desc: t("cropHealthDesc"),
              icon: <Leaf className="w-8 h-8 text-lime-400" />,
              link: "/crop-health",
            },
            {
              title: "NASA Health Cockpit",
              desc: "Professional orbital telemetry and environmental analytics for your farm.",
              icon: <Bot className="w-8 h-8 text-cyan-400" />,
              link: "/satellite-cockpit",
            }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(feature.link)}
              className="group cursor-pointer bg-zinc-900/40 border border-zinc-800 hover:border-green-500/50 p-8 rounded-3xl transition-all duration-500 hover:bg-zinc-800/80 hover:-translate-y-2 hover:shadow-[0_10px_40px_-15px_rgba(16,185,129,0.3)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Value Proposition / Mission Section */}
      <div className="border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {t("platformBuiltFor")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">{t("futureOfFarming")}</span>
            </h2>
            <div className="space-y-6">
              {[
                t("mission1"),
                t("mission2"),
                t("mission3")
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mt-1">
                    ✓
                  </div>
                  <p className="text-zinc-300 text-lg">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
            {/* Visual representation card */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-zinc-900 flex items-center justify-center p-8">
               <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Leaf className="text-emerald-400 w-5 h-5"/>
                      </div>
                      <div>
                        <p className="text-white font-medium">{t("cropHealthStatus")}</p>
                        <p className="text-xs text-zinc-500">{t("updatedJustNow")}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">{t("optimal")}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="w-[85%] h-full bg-gradient-to-r from-green-600 to-emerald-400"></div></div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="w-[92%] h-full bg-gradient-to-r from-green-600 to-emerald-400"></div></div>
                    <div className="h-2 bg-zinc-800 rounded-full w-2/3 overflow-hidden"><div className="w-[70%] h-full bg-gradient-to-r from-green-600 to-emerald-400"></div></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Feedback & Complaints Section */}
      <div className="relative border-t border-zinc-900 bg-zinc-950/50 py-24 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <MessageSquare size={14} /> {t("feedback")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t("weValueYour")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{t("thoughts")}</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              {t("feedbackDesc")}
            </p>
          </div>

          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-zinc-400 text-sm font-medium ml-1 flex items-center gap-2">
                    <User size={14} /> {t("yourName")}
                  </label>
                  <input 
                    type="text"
                    value={feedback.name}
                    onChange={(e) => setFeedback({...feedback, name: e.target.value})}
                    placeholder={t("namePlaceholder")}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-zinc-400 text-sm font-medium ml-1 flex items-center gap-2">
                    <Mail size={14} /> {t("yourEmail")}
                  </label>
                  <input 
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled={!!user?.email}
                    placeholder={t("emailPlaceholder")}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-400 text-sm font-medium ml-1 flex items-center gap-2">
                  <MessageSquare size={14} /> {t("yourMessage")}
                </label>
                <textarea 
                  rows="5"
                  value={feedback.message}
                  onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                  placeholder={t("messagePlaceholder")}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder:text-zinc-700 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:transform-none select-none"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={20} /> {t("sendFeedback")}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <footer className="border-t border-zinc-900 bg-black pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">{t("kisanMithr")}</span>
          </div>
          <p className="text-zinc-600 text-sm">{t("footerRights")}</p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;

