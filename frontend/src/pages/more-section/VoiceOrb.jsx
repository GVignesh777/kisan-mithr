import React from 'react';

const VoiceOrb = ({ state }) => {
  const getStateGlow = () => {
    switch (state) {
      case 'idle': 
        return 'from-green-600/30 via-emerald-600/10 to-transparent scale-100 opacity-40 blur-2xl';
      case 'listening': 
        return 'from-blue-500/50 via-cyan-400/30 to-transparent scale-125 opacity-70 blur-3xl animate-pulse';
      case 'thinking': 
        return 'from-amber-400/40 via-yellow-300/20 to-transparent scale-110 opacity-60 blur-2xl animate-pulse';
      case 'speaking': 
        return 'from-green-400/60 via-emerald-400/40 to-transparent scale-150 opacity-80 blur-[40px] animate-pulse';
      default:
        return 'opacity-0';
    }
  };

  return (
      <div className="relative flex items-center justify-center w-64 h-64 select-none pointer-events-none">
          {/* Dynamic Background Glow */}
          <div className={`absolute inset-0 rounded-full transition-all duration-1000 bg-gradient-to-tr ${getStateGlow()}`} />
          
          {/* The Liquid Blob (Gemini Style) */}
          <div className={`relative w-36 h-36 transition-all duration-700 ease-in-out z-20
              ${state === 'listening' ? 'scale-110' : 'scale-100'}
          `}>
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                  <defs>
                      <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                      <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                  </defs>
                  <g transform="translate(100, 100)">
                    <path 
                        fill={state === 'listening' ? 'url(#blueGradient)' : (state === 'thinking' ? 'url(#warmGradient)' : 'url(#orbGradient)')}
                        className="transition-all duration-1000"
                    >
                        <animate 
                            attributeName="d" 
                            dur={state === 'speaking' ? "2s" : "8s"} 
                            repeatCount="indefinite"
                            values="
                                M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,86.2,-0.5C85.3,14.7,80.1,29.3,71.8,42C63.5,54.7,52.1,65.4,38.6,72.4C25,79.4,9.3,82.7,-6,83.7C-21.3,84.7,-36.2,83.4,-49.4,76.8C-62.6,70.1,-74.1,58.2,-81.2,44.2C-88.3,30.2,-91,15.1,-90.4,0.3C-89.8,-14.4,-85.9,-28.9,-77.9,-41.5C-70,-54.1,-58.1,-64.8,-44.4,-72C-30.8,-79.1,-15.4,-82.7,0.3,-83.2C16,-83.7,31.3,-83.5,44.7,-76.4Z;
                                M42,-74.2C54.1,-66.5,63.5,-54.1,69.5,-40.5C75.5,-26.9,78.1,-12.1,78.2,2.8C78.4,17.7,76.2,32.7,68.8,45.3C61.4,57.9,48.8,68,34.8,73.8C20.8,79.5,5.5,80.9,-9.5,79.1C-24.5,77.3,-39.2,72.4,-51.5,63.9C-63.8,55.5,-73.7,43.5,-79.2,29.8C-84.7,16.1,-85.8,0.7,-82.8,-13.6C-79.9,-27.9,-72.9,-41.1,-62.3,-51.1C-51.7,-61.2,-37.6,-68.2,-23.6,-73.6C-9.6,-79,4.2,-82.8,18.1,-80.6C32,-78.4,45.9,-70,42,-74.2Z;
                                M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,86.2,-0.5C85.3,14.7,80.1,29.3,71.8,42C63.5,54.7,52.1,65.4,38.6,72.4C25,79.4,9.3,82.7,-6,83.7C-21.3,84.7,-36.2,83.4,-49.4,76.8C-62.6,70.1,-74.1,58.2,-81.2,44.2C-88.3,30.2,-91,15.1,-90.4,0.3C-89.8,-14.4,-85.9,-28.9,-77.9,-41.5C-70,-54.1,-58.1,-64.8,-44.4,-72C-30.8,-79.1,-15.4,-82.7,0.3,-83.2C16,-83.7,31.3,-83.5,44.7,-76.4Z"
                        />
                    </path>
                  </g>
              </svg>
          </div>
          
          {/* Subtle reflection overlay */}
          <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-white/20 blur-xl rounded-full z-30" />
      </div>
  );
};

export default VoiceOrb;
