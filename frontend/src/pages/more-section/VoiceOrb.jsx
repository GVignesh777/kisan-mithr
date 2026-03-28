import React from 'react';

const VoiceOrb = ({ state }) => {
  // idle, listening, thinking, speaking
  const getGlowColor = () => {
    switch (state) {
      case 'listening': return 'rgba(14, 165, 233, 0.5)'; // Sky blue
      case 'thinking': return 'rgba(245, 158, 11, 0.5)'; // Amber
      case 'speaking': return 'rgba(34, 197, 94, 0.5)';  // Green
      default: return 'rgba(34, 197, 94, 0.3)';         // Default Green
    }
  };

  const getInnerColor = () => {
    switch (state) {
      case 'listening': return 'bg-sky-500';
      case 'thinking': return 'bg-amber-500';
      case 'speaking': return 'bg-green-500';
      default: return 'bg-green-600';
    }
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer Glow Layers */}
      <div 
        className="absolute inset-0 rounded-full blur-[40px] transition-all duration-1000 opacity-60"
        style={{ backgroundColor: getGlowColor() }}
      />
      <div 
        className={`absolute inset-4 rounded-full blur-[20px] transition-all duration-700 opacity-40 animate-pulse`}
        style={{ backgroundColor: getGlowColor() }}
      />

      {/* Main Orb Sphere */}
      <div className={`relative w-28 h-28 rounded-full shadow-2xl transition-all duration-700 overflow-hidden border border-white/20
        ${getInnerColor()}
        ${state === 'listening' ? 'scale-110' : 'scale-100'}
      `}>
        {/* Inner Shimmer Detail */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/40" />
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]`} />
        
        {/* Pulsing Core */}
        <div className={`absolute inset-4 rounded-full bg-white/10 blur-sm
          ${state === 'listening' || state === 'speaking' ? 'animate-ping opacity-30' : 'opacity-0'}
        `} />
      </div>

      {/* Decorative Rings (Glass-style) */}
      <div className={`absolute inset-0 rounded-full border border-white/5 transition-transform duration-1000
        ${state === 'listening' ? 'scale-125 rotate-45' : 'scale-110 rotate-0'}
      `} />
      <div className={`absolute inset-2 rounded-full border border-white/5 transition-transform duration-1000
        ${state === 'speaking' ? 'scale-110 -rotate-45' : 'scale-105 rotate-0'}
      `} />
    </div>
  );
};

export default VoiceOrb;

