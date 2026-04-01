import React from "react";
import logo from "../../src/assets/logo.jpg";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Send, 
  Leaf,
  Github 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <Linkedin size={20} />, href: "https://www.linkedin.com/in/g-vignesh-b6b6a2361/", label: "LinkedIn" },
    { icon: <Github size={20} />, href: "https://github.com/GVignesh777", label: "GitHub" },
    { icon: <Youtube size={20} />, href: "#", label: "YouTube" },
  ];

  const quickLinks = [
    { name: t("navigationHome"), path: "/" },
    { name: t("footer.farmerDashboard"), path: "/" }, 
    { name: t("footer.buyerDashboard"), path: "/buyer-dashboard" },
    { name: t("footer.adminPanel"), path: "/admin-login" },
    { name: t("footer.contactUs"), path: "/contact" },
  ];

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {/* <Leaf className="text-green-400 w-6 h-6" /> */}
                <img className="w-8 h-8" src={logo} alt="logo" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                Kisan Mithr
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-sm">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">{t("footer.quickLinks")}</h3>
            <ul className="space-y-4">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => navigate(link.path)}
                    className="text-zinc-400 hover:text-green-400 transition-colors text-base flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-green-500 transition-colors"></span>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">{t("footer.contactUs")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">{t("footer.email")}</p>
                  <a href="mailto:support@kisanmithr.com" className="text-zinc-300 hover:text-white transition-colors">support@kisanmithr.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">{t("footer.phone")}</p>
                  <a href="tel:+919440602166" className="text-zinc-300 hover:text-white transition-colors">+91 94406 02166</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">{t("footer.location")}</p>
                  <p className="text-zinc-300">{t("footer.andhraPradeshIndia")}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">{t("footer.followUs")}</h3>
            <p className="text-zinc-400 text-sm">{t("footer.joinCommunity")}</p>
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  aria-label={social.label}
                  className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-green-600 hover:border-green-500 transition-all hover:-translate-y-1 shadow-lg"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-zinc-500 text-sm flex items-center gap-2">
                © {new Date().getFullYear()} <span className="text-zinc-300 font-medium">Kisan Mithr</span>. {t("footer.allRightsReserved")}
              </p>
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">{t("footer.designedBy")} <span className="text-green-500 font-bold">Vignesh</span></p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">{t("footer.privacyPolicy")}</a>
              <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
              <button 
                onClick={() => navigate('/terms')}
                className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              >
                {t("footer.termsConditions")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
