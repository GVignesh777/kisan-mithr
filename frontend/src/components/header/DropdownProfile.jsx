import React from "react";
import {
  User,
  LayoutDashboard,
  Settings,
  Shield,
  Bell,
  LogOut,
} from "lucide-react";
import useUserStore from "../../store/useUserStore";
import { logoutUser } from "../../services/user.service";
import { toast } from "react-toastify";

const profileItems = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    desc: "Access your personalized dashboard",
  },
  {
    icon: User,
    title: "My Profile",
    desc: "View & edit personal information",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Check alerts & scheme updates",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    desc: "Manage password & security settings",
  },
  {
    icon: Settings,
    title: "Account Settings",
    desc: "Customize your account preferences",
  },
];

const DropdownProfile = () => {
  const { user, clearUser } = useUserStore();
  const userName = user?.username || user?.googleName || "Guest";
  // console.log("user", user)
  const profile =
    user?.profilePicture ||
    user?.googlePhoto ||
    "";
  const role = user?.role;
  console.log(profile);
  // console.log("profile is,", user.googlePhoto)

  const handleLogOut = async () => {
    try {
      await logoutUser();
      clearUser();
      // navigate("/user-login");
      toast.success("user logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Failed to logout", error);
    }
  };

  return (
    <div className="fixed sm:absolute left-1/2 sm:left-auto right-auto sm:right-3 top-20 sm:top-16 -translate-x-1/2 sm:translate-x-0 w-[300px] sm:w-[320px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.5)] rounded-2xl p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top translate-y-2 group-hover:translate-y-0">
      {/* User Info Section */}
      <div className="flex items-center gap-4 border-b border-zinc-800/60 pb-4 mb-4">
        <div className="w-12 h-12 bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center rounded-full font-bold text-lg overflow-hidden flex-shrink-0">
          {profile ? (
            <img
              className="w-full h-full object-cover"
              src={profile}
              referrerPolicy="no-referrer"
              alt="profile"
            />
          ) : (
            <span>{userName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-100 truncate">{userName}</h3>
          <p className="text-xs text-zinc-400 capitalize">{role || 'User'} • Telangana</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {profileItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/80 transition-all duration-200 cursor-pointer group/item"
            >
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg group-hover/item:border-green-500/40 group-hover/item:bg-green-500/10 transition-colors flex-shrink-0">
                <Icon className="w-4 h-4 text-zinc-400 group-hover/item:text-green-400 transition-colors" />
              </div>

              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-zinc-200 group-hover/item:text-green-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-500 truncate">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logout Section */}
      <div className="border-t border-zinc-800/60 mt-3 pt-3">
        <div 
          onClick={handleLogOut}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all duration-200 cursor-pointer group/logout"
        >
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg group-hover/logout:border-red-500/40 group-hover/logout:bg-red-500/20 transition-colors flex-shrink-0">
            <LogOut className="w-4 h-4 text-zinc-400 group-hover/logout:text-red-400 transition-colors" />
          </div>
          <span className="text-sm font-semibold text-zinc-300 group-hover/logout:text-red-400 transition-colors">
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default DropdownProfile;
