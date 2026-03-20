import React, { useState } from "react";
import {
  User, Shield, Smartphone, MapPin, Camera,
  Edit2, ShieldCheck, FileText, CheckCircle2,
  Clock, BadgeCheck, ExternalLink, X,
  Globe, Zap, Fingerprint, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useUserStore from "../../../store/useUserStore";

const BuyerProfile = () => {
  const { user } = useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userName = user?.username || user?.googleName || "Valued Buyer";
  const userRole = user?.role || "Premium Buyer";
  const profilePic = user?.profilePicture || user?.googlePhoto;

  const metrics = [
    { label: "TRADES",      value: "142",   icon: Zap,        color: "text-amber-400",   bg: "bg-amber-500/10"  },
    { label: "RELIABILITY", value: "99.8%", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "RATING",      value: "4.9★",  icon: BadgeCheck,  color: "text-blue-400",   bg: "bg-blue-500/10"   },
  ];

  const documents = [
    { name: "Trade License 2026", size: "1.2 MB", status: "Verified"  },
    { name: "GST Certificate",    size: "850 KB",  status: "Verified"  },
    { name: "Audit Report v2.4",  size: "4.5 MB",  status: "In Review" },
  ];

  return (
    <div className="w-full pb-12">

      {/* ── Two-column grid: Profile Card | Data Nodes ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8 items-start">

        {/* ───── LEFT: Profile Identity Card ───── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

          {/* Avatar */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-3xl bg-zinc-800 border-4 border-zinc-800 shadow-xl overflow-hidden relative group">
                {profilePic ? (
                  <img src={profilePic} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-green-400 text-4xl font-black">
                    {userName.charAt(0)}
                  </div>
                )}
                <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={22} />
                </button>
              </div>
              {/* Verification badge */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 border-4 border-zinc-900 rounded-2xl flex items-center justify-center text-green-400 shadow-lg">
                <Fingerprint size={18} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-1">{userName}</h2>
            <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
              {userRole}
            </span>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-3 w-full mt-8">
              {metrics.map((m, i) => (
                <div key={i} className={`${m.bg} border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-1.5`}>
                  <m.icon size={16} className={m.color} />
                  <span className="text-sm font-black text-white">{m.value}</span>
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-tight text-center">{m.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full mt-8 py-3.5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-500 transition-all"
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>

          {/* Telemetry bar */}
          <div className="mt-6 pt-5 border-t border-white/5 relative z-10 space-y-2.5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Live Telemetry</p>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
              <span className="text-xs font-bold text-zinc-300">System Online • Secure Protocol</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-500">
              <Activity size={12} className="shrink-0" />
              <span className="text-xs font-medium">Last synced: 0.2s ago</span>
            </div>
          </div>
        </motion.div>

        {/* ───── RIGHT: Data Nodes Grid ───── */}
        <div className="space-y-6">

          {/* Row 1: Identity + Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Identity Hub */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/60 border border-white/5 rounded-3xl p-7 shadow-xl"
            >
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <User size={14} className="text-green-400" /> Identity Hub
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Display Name</p>
                  <p className="text-base font-black text-white">{userName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-400 truncate">{user?.email || "NOT LINKED"}</p>
                    {user?.email && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Role</p>
                  <span className="text-xs font-black text-green-400 uppercase tracking-widest">{userRole}</span>
                </div>
              </div>
            </motion.div>

            {/* Security Node */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-zinc-900/60 border border-white/5 rounded-3xl p-7 shadow-xl"
            >
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Shield size={14} className="text-blue-400" /> Security Access
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-zinc-500 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase mb-0.5">Mobile</p>
                      <p className="text-xs font-bold text-white">+91 ••••• ••789</p>
                    </div>
                  </div>
                  <button className="text-[9px] font-black uppercase px-2.5 py-1 bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-3.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-emerald-500/60 uppercase mb-0.5">KYC Status</p>
                    <p className="text-xs font-black text-emerald-400">Verified • Level 03</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Logistics */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/60 border border-white/5 rounded-3xl p-7 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <MapPin size={14} className="text-red-400" /> Logistics Grid
              </h3>
              <button className="text-[10px] font-black uppercase text-green-400 hover:underline">
                + Add Node
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-5 p-3">
                  <Globe size={48} />
                </div>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Primary Distribution</p>
                <p className="text-sm font-bold text-zinc-300 leading-relaxed">
                  Sector 12, Industrial Area North, <br />
                  Ludhiana, Punjab — 141001
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3.5">
                {[
                  { icon: CheckCircle2, color: "text-green-400", label: "Geo-fencing active" },
                  { icon: CheckCircle2, color: "text-green-400", label: "Tax-node computation set" },
                  { icon: Clock, color: "text-amber-400", label: "Audit in 12 days" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-zinc-500">
                    <item.icon size={14} className={`${item.color} shrink-0`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Row 3: Document Vault */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-zinc-900/60 border border-white/5 rounded-3xl p-7 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <FileText size={14} className="text-zinc-400" /> Tactical Vault
              </h3>
              <button className="px-4 py-1.5 text-[10px] font-black text-black bg-green-500 rounded-xl hover:scale-105 active:scale-95 transition-all">
                Upload
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {documents.map((doc, i) => (
                <div key={i} className="p-5 bg-zinc-950 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all group">
                  <FileText className="mb-3 text-zinc-600 group-hover:text-blue-400 transition-colors" size={22} />
                  <p className="text-sm font-black text-white mb-0.5 leading-tight">{doc.name}</p>
                  <p className="text-[10px] font-bold text-zinc-600 mb-4">{doc.size}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                      doc.status === "Verified" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {doc.status}
                    </span>
                    <ExternalLink size={13} className="text-zinc-700 hover:text-white cursor-pointer transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>{/* end right */}
      </div>{/* end grid */}

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Edit Profile</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Manual node override</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Display Name", type: "text", value: userName },
                  { label: "Email",        type: "email", value: user?.email || "" },
                  { label: "Phone",        type: "tel",   value: "+91 91234 56789" },
                ].map((field, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">{field.label}</label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button className="flex-1 py-3.5 bg-green-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20">
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 text-zinc-400"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BuyerProfile;
