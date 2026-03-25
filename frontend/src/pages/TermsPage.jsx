import React, { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Scale, AlertTriangle, HelpCircle, Mail, CheckCircle } from "lucide-react";

/**
 * TermsPage
 * ─────────────────────────────────────────────────
 * A formal, professional Terms and Conditions page
 * tailored for the Kisan Mithr agricultural platform.
 * Redesigned with a premium dark theme.
 */
const TermsPage = () => {
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "March 25, 2026";

  const sections = [
    {
      id: "acceptance",
      icon: <CheckCircle className="text-green-400" size={24} />,
      title: "1. Acceptance of Terms",
      content: `By accessing or using the Kisan Mithr platform ("the Platform"), you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this Platform are protected by applicable copyright and trademark law.`
    },
    {
      id: "description",
      icon: <FileText className="text-green-400" size={24} />,
      title: "2. Description of Platform",
      content: `Kisan Mithr is a digital support ecosystem designed to empower farmers and agricultural stakeholders. We provide information, market data, assistant tools, and a communication bridge between farmers and buyers. The Platform is provided for informational and logistical support purposes only.`
    },
    {
      id: "responsibilities",
      icon: <ShieldCheck className="text-green-400" size={24} />,
      title: "3. User Responsibilities",
      content: `As a user of Kisan Mithr, you are responsible for maintaining the confidentiality of your account information. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate and complete.`
    },
    {
      id: "use-policy",
      icon: <AlertTriangle className="text-green-400" size={24} />,
      title: "4. Acceptable Use Policy",
      content: `You agree not to use the Platform for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Platform in any way that could damage the Platform or general business of Kisan Mithr. You are prohibited from posting or transmitting any harmful, threatening, or discriminatory content.`
    },
    {
      id: "ip-rights",
      icon: <Scale className="text-green-400" size={24} />,
      title: "5. Intellectual Property Rights",
      content: `The Platform and its original content, features, and functionality are owned by Kisan Mithr and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.`
    },
    {
      id: "availability",
      icon: <HelpCircle className="text-green-400" size={24} />,
      title: "6. Service Availability Disclaimer",
      content: `While we strive for 24/7 uptime, Kisan Mithr does not guarantee that the Platform will be available at all times. We reserve the right to modify, suspend, or discontinue any part of the service with or without notice for maintenance or updates.`
    },
    {
      id: "liability",
      icon: <AlertTriangle className="text-red-400" size={24} />,
      title: "7. Limitation of Liability",
      content: `<b className="text-white">Kisan Mithr shall not be held liable for any financial losses, crop failures, or decisions made by users based on the information provided on the Platform.</b> Agricultural outcomes depend on numerous external factors beyond our control (weather, soil quality, etc.). User discretion is advised.`
    },
    {
      id: "third-party",
      icon: <FileText className="text-green-400" size={24} />,
      title: "8. Third-Party Services",
      content: `The Platform integrates third-party services including but not limited to EmailJS, Google Maps, and NASA APIs. Your use of these features is also governed by the respective service providers' terms and privacy policies.`
    },
    {
      id: "privacy",
      icon: <ShieldCheck className="text-green-400" size={24} />,
      title: "9. Privacy Reference",
      content: `Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by reference, explains how we collect, use, and protect your personal information.`
    },
    {
      id: "modifications",
      icon: <FileText className="text-green-400" size={24} />,
      title: "10. Modification of Terms",
      content: `Kisan Mithr reserves the right to revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then-current version of these Terms and Conditions.`
    },
    {
      id: "termination",
      icon: <AlertTriangle className="text-red-400" size={24} />,
      title: "11. Termination of Access",
      content: `We may terminate or suspend your access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.`
    },
    {
      id: "law",
      icon: <Scale className="text-green-400" size={24} />,
      title: "12. Governing Law",
      content: `These terms and conditions are governed by and construed in accordance with the laws of <b className="text-white">India</b> and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.`
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-green-500/30">
      <Header />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 md:p-16 shadow-2xl mb-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
          
          <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-3xl text-green-400 mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <FileText size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Conditions</span>
          </h1>
          <p className="text-zinc-400 font-medium text-lg">
            Last Updated: <span className="text-green-400 font-bold tracking-wider">{lastUpdated}</span>
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-10 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)]"></div>
        </motion.div>

        {/* Content Section - Grid for readability */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 hover:bg-zinc-800/20 hover:border-green-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl group-hover:border-green-500/40 group-hover:bg-green-500/10 transition-colors shadow-inner">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{section.title}</h2>
              </div>
              <div 
                className="text-zinc-400 leading-relaxed text-sm md:text-base selection:text-green-400"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </motion.section>
          ))}
        </div>

        {/* Contact Footer in Main */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 bg-zinc-900 border border-zinc-800 rounded-[3rem] text-white overflow-hidden relative shadow-2xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-extrabold mb-3 tracking-tight">Need further clarification?</h3>
              <p className="text-zinc-400 text-lg max-w-md">Our legal team is committed to ensuring full transparency for all our farmers and partners.</p>
            </div>
            
            <a 
              href="mailto:gokamvigneshcse777@gmail.com" 
              className="group/btn flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-lg rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.6)] hover:-translate-y-1"
            >
              <Mail size={24} className="group-hover/btn:scale-110 transition-transform" />
              Email Us
            </a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
