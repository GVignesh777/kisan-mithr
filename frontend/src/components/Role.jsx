import React, { useState } from "react";
import { Sprout, ShoppingCart, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react";
import farmerImg from "../assets/farmer.png";
import buyerImg from "../assets/buyer.png";
import adminImg from "../assets/admin.png";
import { toast } from "react-toastify";
import { selectRole } from "../services/user.service";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";

const roles = [
  {
    id: "farmer",
    img: farmerImg,
    title: "Farmer",
    desc: "Empower your agriculture with AI advisory, real-time market insights, and digital convenience.",
    features: ["Smart Crop Advisory", "Mandi Price Updates", "Direct Marketplace"],
    icon: Sprout,
    accent: "green",
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    id: "buyer",
    img: buyerImg,
    title: "Buyer",
    desc: "Access the freshest produce directly from verified farms. Quality, transparency, and trust.",
    features: ["Direct Sourcing", "Quality Assurance", "Secure Logistics"],
    icon: ShoppingCart,
    accent: "blue",
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20",
  },
  {
    id: "admin",
    img: adminImg,
    title: "Administrator",
    desc: "Oversee the platform ecosystem, manage users, and ensure seamless agricultural operations.",
    features: ["Platform Oversight", "User Management", "System Health"],
    icon: ShieldCheck,
    accent: "rose",
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20",
  },
];

const RoleCard = ({ role }) => {
  const [style, setStyle] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y - rect.height / 2) / 25;
    const rotateY = (x - rect.width / 2) / 25;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    });
  };

  const reset = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  const Icon = role.icon;

  const submitRoleSelection = async () => {
    try {
      setLoading(true);
      console.log(`Selecting role: ${role.id}`);
      const response = await selectRole(role.id);
      
      if (response.status === "success") {
        toast.success(`Welcome aboard, ${role.title}!`);
        
        // Manually update the role in the store to avoid race conditions with checkUserAuth
        const currentUser = useUserStore.getState().user;
        setUser({ ...currentUser, role: role.id });

        // Redirect based on role
        if (role.id === 'admin') {
          navigate("/admin-dashboard");
        } else if (role.id === 'buyer') {
          navigate("/buyer-dashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Role selection failed. Please try again.");
      }
    } catch (error) {
      console.error("Role Selection Error:", error);
      toast.error("An error occurred. Check your connection.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={style}
      className="relative group transition-all duration-500 ease-out"
    >
      {/* Dynamic Glow Background */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${role.gradient} rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`}
      />

      {/* Main Card */}
      <div className="relative h-full bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] p-8 flex flex-col overflow-hidden shadow-2xl">
        {/* Header with Icon */}
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-xl ${role.shadow} group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={28} />
          </div>
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <ChevronRight size={24} />
          </div>
        </div>

        {/* Image Section */}
        <div className="relative mb-8 aspect-video rounded-3xl overflow-hidden border border-zinc-800/80 group-hover:border-zinc-700 transition-colors">
          <img 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            src={role.img} 
            alt={role.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight group-hover:text-green-400 transition-colors">
            {role.title}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
            {role.desc}
          </p>

          <div className="space-y-3 mb-8">
            {role.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-xs font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={submitRoleSelection}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${role.gradient} shadow-lg ${role.shadow} hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "Initializing..." : "Get Started"}
        </button>
      </div>
    </div>
  );
};

const Role = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-6 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse duration-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            CHOOSE YOUR <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">PATH</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Select your role to unlock personalized features tailored for your agricultural journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12 px-2">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-zinc-500 text-sm">
            Need help choosing? <span className="text-green-500 cursor-pointer hover:underline">Contact our support assistant</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Role;

