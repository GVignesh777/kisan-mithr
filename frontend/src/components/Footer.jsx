import React from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Send, 
  Leaf 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const socialLinks = [
    { icon: <Linkedin size={20} />, href: "#", label: "LinkedIn" },
    { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
    { icon: <Youtube size={20} />, href: "#", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "navigationHome", path: "/" },
    { name: "Farmer Dashboard", path: "/" }, // Assuming landing has a way to navigate/role select
    { name: "Buyer Dashboard", path: "/buyer-dashboard" },
    { name: "Admin Panel", path: "/admin-login" },
    { name: "Contact Us", path: "#" },
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
                <Leaf className="text-green-400 w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                Kisan Mithr
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-sm">
              Kisan Mithr connects farmers and buyers directly, ensuring fair prices and transparency in the agricultural marketplace.
            </p>
            
            {/* Newsletter Section */}
            <div className="space-y-4 pt-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-widest">{t("newsletterTitle") || "Newsletter"}</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all w-full"
                />
                <button className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors group">
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">{t("quickLinks") || "Quick Links"}</h3>
            <ul className="space-y-4">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => navigate(link.path)}
                    className="text-zinc-400 hover:text-green-400 transition-colors text-base flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-green-500 transition-colors"></span>
                    {t(link.name) || link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">{t("contactUs") || "Contact Us"}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">Email</p>
                  <a href="mailto:support@kisanmithr.com" className="text-zinc-300 hover:text-white transition-colors">support@kisanmithr.com</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">Phone</p>
                  <a href="tel:+919876543210" className="text-zinc-300 hover:text-white transition-colors">+91 98765 43210</a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">Location</p>
                  <p className="text-zinc-300">Andhra Pradesh, India</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-lg">Follow Us</h3>
            <p className="text-zinc-400 text-sm">Join our community for regular updates and farming tips.</p>
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
                © {new Date().getFullYear()} <span className="text-zinc-300 font-medium">Kisan Mithr</span>. All rights reserved.
              </p>
              <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">Designed & Developed by <span className="text-green-500 font-bold">Vignesh</span></p>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Privacy Policy</a>
              <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
              <a href="#" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
