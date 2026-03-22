import React from "react";
import {
  Landmark,
  Sprout,
  Banknote,
  FileText,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const schemesItems = [
  {
    icon: Landmark,
    title: "Central Schemes",
    desc: "Explore national agriculture welfare programs",
    path: "/schemes",
  },
  {
    icon: Sprout,
    title: "State Schemes",
    desc: "Telangana farmer benefits & subsidies",
    path: "/schemes",
  },
  {
    icon: Banknote,
    title: "Subsidies & Grants",
    desc: "Financial support for seeds, equipment & irrigation",
    path: "/schemes",
  },
  {
    icon: ShieldCheck,
    title: "Crop Insurance",
    desc: "Protection against crop loss & natural risks",
    path: "/schemes",
  },
  {
    icon: FileText,
    title: "Eligibility Checker",
    desc: "Find schemes matching your profile",
    path: "/schemes",
  },
  {
    icon: CalendarDays,
    title: "Latest Announcements",
    desc: "Stay updated with new scheme releases",
    path: "/schemes",
  },
];

const DropdownSchemes = ({ isMobile }) => {
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {schemesItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <Icon className="w-4 h-4 text-green-400" />
              <div>
                <h3 className="text-xs font-semibold text-zinc-300">{item.title}</h3>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-16 w-[650px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.5)] rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top translate-y-2 group-hover:translate-y-0">

      {/* Heading */}
      <div className="mb-6 border-b border-zinc-800/60 pb-4">
        <h2 className="text-xl font-bold text-zinc-100">
          Government Schemes <span className="text-green-500">🏛️</span>
        </h2>
        <p className="text-sm text-zinc-400">
          Discover agriculture welfare programs & financial support
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 gap-4">
        {schemesItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer group/item border border-transparent hover:border-zinc-700/50"
            >
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg group-hover/item:border-green-500/40 group-hover/item:bg-green-500/10 transition-colors">
                <Icon className="w-5 h-5 text-zinc-400 group-hover/item:text-green-400 transition-colors" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-200 group-hover/item:text-green-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 group-hover/item:text-zinc-400 transition-colors">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownSchemes;