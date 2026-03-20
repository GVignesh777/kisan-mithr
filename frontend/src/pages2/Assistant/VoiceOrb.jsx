import React from 'react';

const VoiceOrb = ({ state }) => {
  const getStateClass = () => {
    switch (state) {
      case 'idle': 
        return 'animate-[pulse_4s_ease-in-out_infinite] shadow-[0_0_40px_rgba(22,101,52,0.4),0_0_80px_rgba(74,222,128,0.3)]';
      case 'listening': 
        return 'animate-[pulse_1.5s_ease-in-out_infinite] scale-110 shadow-[0_0_60px_rgba(56,189,248,0.6),0_0_100px_rgba(74,222,128,0.5)]';
      case 'thinking': 
        return 'animate-spin shadow-[0_0_50px_rgba(139,90,43,0.6),inset_0_0_30px_rgba(74,222,128,0.5)]';
      case 'speaking': 
        return 'animate-pulse scale-105 shadow-[0_0_80px_rgba(74,222,128,0.8),0_0_120px_rgba(56,189,248,0.6),inset_0_0_40px_rgba(255,255,255,0.5)]';
      default: 
        return 'animate-[pulse_4s_ease-in-out_infinite] shadow-[0_0_40px_rgba(22,101,52,0.4),0_0_80px_rgba(74,222,128,0.3)]';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Outer glow rings */}
      <div className={`absolute w-full h-full rounded-full transition-all duration-500 bg-gradient-to-tr from-green-500 via-emerald-500 to-teal-400 blur-xl opacity-60 ${getStateClass()}`} />
      
      {/* Inner solid core */}
      <div className={`relative w-32 h-32 rounded-full bg-gradient-to-tr from-green-400 via-emerald-400 to-teal-300 opacity-90 transition-all duration-500 z-10 ${getStateClass()}`}>
          {/* Glass reflection */}
          <div className="absolute top-2 left-4 w-16 h-16 rounded-full bg-white/30 blur-md" />
      </div>
    </div>
  );
};

export default VoiceOrb;
