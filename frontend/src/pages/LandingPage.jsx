import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/Footer";
import heroBG from "../assets/hero-bg.jpg"; // Reusing the high-quality asset
import { Mic, Leaf, CloudSun, LineChart, ArrowRight, ShieldCheck, Globe, Zap, CheckCircle2 } from "lucide-react";
import useTranslation from "../hooks/useTranslation";

const LandingPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-green-500/30 overflow-x-hidden">
            <Header />

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
                {/* Background Layer */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[30s] ease-linear scale-110"
                    style={{ backgroundImage: `url(${heroBG})`, opacity: 0.4 }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950" />
                
                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm font-bold tracking-[0.2em] text-green-400 uppercase">
                            Next-Gen Agritech
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        Kisan Mithr <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            AI Voice Assistant
                        </span>
                    </h1>

                    <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        Empowering Indian farmers with real-time AI intelligence. Speak in <span className="text-white">Hindi, Telugu, or English</span> to get instant expert farming advice.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                        <button 
                            onClick={() => navigate('/user-login')}
                            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-xl flex items-center gap-3 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 slant-glow" />
                            <Zap className="w-6 h-6 fill-current" />
                            Start Talking Now
                        </button>
                        <button 
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xl hover:bg-zinc-800 transition-all hover:text-white"
                        >
                            Explore Features
                        </button>
                    </div>
                </div>

                {/* Stat Strip */}
                <div className="absolute bottom-10 left-0 w-full border-y border-white/5 bg-zinc-900/20 backdrop-blur-sm py-4 overflow-hidden hidden md:block">
                    <div className="flex justify-around items-center max-w-7xl mx-auto px-6">
                        {[
                            { label: "Farmers Empowered", val: "140M+" },
                            { label: "Languages Supported", val: "3+ Local" },
                            { label: "Response Speed", val: "< 1.5s" },
                            { label: "AI Reliability", val: "99.9%" }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-green-500 text-2xl font-black">{stat.val}</span>
                                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-32 px-6 bg-zinc-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">Smart Solutions for <span className="text-green-500">Every Farmer</span></h2>
                        <p className="text-zinc-500 text-xl max-w-2xl mx-auto">Built from the ground up to solve agriculture's biggest challenges using cutting-edge Generative AI.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Multilingual Voice AI",
                                desc: "No typing required. Just talk to Kisan Mithr in your local language and get instant voice responses.",
                                icon: <Mic className="w-8 h-8 text-green-400" />,
                                color: "from-green-500/20 to-emerald-500/5"
                            },
                            {
                                title: "Crop Health Diagnosis",
                                desc: "Upload photos or describe symptoms to get instant pest detection and organic treatment advice.",
                                icon: <Leaf className="w-8 h-8 text-emerald-400" />,
                                color: "from-emerald-500/20 to-teal-500/5"
                            },
                            {
                                title: "Live Market Intelligence",
                                desc: "Track real-time Mandi prices across India. Sell your produce at the right time for maximum profit.",
                                icon: <LineChart className="w-8 h-8 text-sky-400" />,
                                color: "from-sky-500/20 to-indigo-500/5"
                            },
                            {
                                title: "Weather Smart Advice",
                                desc: "Hyper-local weather forecasts combined with actionable farming tips based on upcoming conditions.",
                                icon: <CloudSun className="w-8 h-8 text-amber-400" />,
                                color: "from-amber-500/20 to-orange-500/5"
                            },
                            {
                                title: "Govt. Scheme Portal",
                                desc: "Easily discover and apply for central and state government subsidies tailored to your farm profile.",
                                icon: <ShieldCheck className="w-8 h-8 text-purple-400" />,
                                color: "from-purple-500/20 to-pink-500/5"
                            },
                            {
                                title: "24/7 Expert Access",
                                desc: "Your personal agronomist is always awake. Get advice on soil health, irrigation, and new techniques.",
                                icon: <Globe className="w-8 h-8 text-cyan-400" />,
                                color: "from-cyan-500/20 to-blue-500/5"
                            }
                        ].map((f, i) => (
                            <div key={i} className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 transition-all duration-500 hover:border-green-500/50 hover:bg-zinc-800/80 overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">{f.title}</h3>
                                    <p className="text-zinc-500 text-lg leading-relaxed group-hover:text-zinc-300 transition-colors">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MISSION SECTION --- */}
            <section className="py-24 px-6 border-y border-white/5 bg-zinc-900/10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Built by Indians, <br /><span className="text-green-500">For Bharat</span></h2>
                        <div className="space-y-6">
                            {[
                                "Native support for Telugu and Hindi voice interaction.",
                                "Data-light implementation for low-bandwidth rural areas.",
                                "Verified agricultural data from government sources.",
                                "Simple, intuitive interface designed for all age groups."
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0" />
                                    <p className="text-zinc-300 text-xl font-medium">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full lg:w-auto relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-[120px] rounded-full" />
                        <div className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] shadow-2xl transform hover:rotate-2 transition-transform duration-700">
                             <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-green-600 rounded-full" />
                                <div>
                                    <div className="h-3 w-32 bg-zinc-800 rounded-full mb-2" />
                                    <div className="h-2 w-20 bg-zinc-800/50 rounded-full" />
                                </div>
                             </div>
                             <div className="space-y-4">
                                <div className="h-4 w-full bg-zinc-800 rounded-full" />
                                <div className="h-4 w-[90%] bg-zinc-800 rounded-full" />
                                <div className="h-4 w-[75%] bg-zinc-800 rounded-full" />
                                <div className="h-4 w-[85%] bg-green-500/20 rounded-full" />
                             </div>
                             <div className="mt-12 flex justify-between items-center">
                                <div className="flex -space-x-3">
                                    {[1,2,3,4].map(v => <div key={v} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" />)}
                                </div>
                                <span className="text-green-500 font-bold uppercase tracking-widest text-xs">JOIN 2k+ USERS</span>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-4xl mx-auto p-12 md:p-24 rounded-[60px] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)]">
                    <div className="absolute inset-0 opacity-10 pattern-grid" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-7xl font-black mb-8 leading-none">Ready to transform your farm?</h2>
                        <p className="text-white/80 text-xl md:text-2xl mb-12 font-medium max-w-2xl mx-auto">Join thousands of smart farmers using Kisan Mithr to increase their yields and reduce costs.</p>
                        <button 
                            onClick={() => navigate('/user-login')}
                            className="px-12 py-6 rounded-3xl bg-white text-green-700 font-black text-2xl hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 mx-auto"
                        >
                            Get Started Free <ArrowRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                .slant-glow {
                    clip-path: polygon(0 0, 40% 0, 60% 100%, 20% 100%);
                }
                .pattern-grid {
                    background-image: radial-gradient(circle, white 1px, transparent 1px);
                    background-size: 30px 30px;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
