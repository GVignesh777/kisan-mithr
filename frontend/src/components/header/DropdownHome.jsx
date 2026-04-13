import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Leaf,
  Bell,
  Users,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useTranslation from "../../hooks/useTranslation";

const DropdownHome = ({ isMobile }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const homeItems = [
    {
      icon: LayoutDashboard,
      title: t("dropdownHome.platformOverview"),
      desc: t("dropdownHome.platformOverviewDesc"),
      path: "/overview",
    },
    {
      icon: Leaf,
      title: t("dropdownHome.smartFarming"),
      desc: t("dropdownHome.smartFarmingDesc"),
      path: "/assistant",
    },
    {
      icon: TrendingUp,
      title: t("dropdownHome.liveMarketTrends"),
      desc: t("dropdownHome.liveMarketTrendsDesc"),
      path: "/market",
    },
    {
      icon: BarChart3,
      title: t("dropdownHome.analyticsGrowth"),
      desc: t("dropdownHome.analyticsGrowthDesc"),
      path: "/analytics-growth", // Redirect to buyer dashboard for analytics
    },
    {
      icon: Users,
      title: t("dropdownHome.communityNetwork"),
      desc: t("dropdownHome.communityNetworkDesc"),
      path: "/",
    },
    {
      icon: Bell,
      title: t("dropdownHome.latestUpdates"),
      desc: t("dropdownHome.latestUpdatesDesc"),
      path: "/",
    },
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {homeItems.map((item, index) => {
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
          {t("dropdownHome.welcomeHeading")}
        </h2>
        <p className="text-sm text-zinc-400">
          {t("dropdownHome.welcomeSub")}
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 gap-4">
        {homeItems.map((item, index) => {
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

export default DropdownHome;