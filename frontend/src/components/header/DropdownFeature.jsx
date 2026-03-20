import React from "react";
import {
  Leaf,
  TrendingUp,
  ShoppingCart,
  LayoutDashboard,
  Package,
  Landmark,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DropdownFeature = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Leaf,
      title: "Smart Crop Advisory",
      desc: "AI-based crop suggestions & seasonal guidance",
      path: "/crop-health",
    },
    {
      icon: TrendingUp,
      title: "Market Price Updates",
      desc: "Live mandi prices & price trend analysis",
      path: "/market",
    },
    {
      icon: ShoppingCart,
      title: "Direct Buyer Connection",
      desc: "Sell directly without middlemen",
      path: "/buyer/market",
    },
    // {
    //   icon: LayoutDashboard,
    //   title: "Farmer Dashboard",
    //   desc: "Track crops, sales & analytics",
    //   path: "/buyer",
    // },
    {
      icon: Package,
      title: "Order Management",
      desc: "Manage orders, stock & delivery",
      path: "/buyer/orders",
    },
    {
      icon: Landmark,
      title: "Govt Schemes",
      desc: "Subsidy info & eligibility guidance",
      path: "/schemes",
    },
    {
      icon: Bot,
      title: "Voice Assistant Support",
      desc: "24/7 farming assistance",
      path: "/assistant",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      desc: "Farmer, Buyer & Admin dashboards",
      path: "/role",
    },
    {
      icon: Bot,
      title: "NASA Health Cockpit",
      desc: "Orbital environmental telemetry",
      path: "/satellite-cockpit",
    },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[650px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.5)] rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top translate-y-2 group-hover:translate-y-0">
      
      {/* Heading */}
      <div className="mb-6 border-b border-zinc-800/60 pb-4">
        <h2 className="text-xl font-bold text-zinc-100">
          Our Services <span className="text-green-500">🛠️</span>
        </h2>
        <p className="text-sm text-zinc-400">
          Powerful tools designed to enhance your farming experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(feature.path)}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer group/item border border-transparent hover:border-zinc-700/50"
            >
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg group-hover/item:border-green-500/40 group-hover/item:bg-green-500/10 transition-colors">
                <Icon className="w-5 h-5 text-zinc-400 group-hover/item:text-green-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 group-hover/item:text-green-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-500 group-hover/item:text-zinc-400 transition-colors">
                  {feature.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownFeature;

