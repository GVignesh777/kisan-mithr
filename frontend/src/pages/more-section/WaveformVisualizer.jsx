import React from 'react';

const WaveformVisualizer = ({ state }) => {
  // We'll simulate a high-fidelity shimmering waveform
  const bars = Array.from({ length: 24 });
  
  const getBarHeights = () => {
      if (state === 'speaking') {
          return bars.map(() => ({
              height: `${40 + Math.random() * 60}%`,
              duration: `${0.4 + Math.random() * 0.4}s`
          }));
      } else if (state === 'listening') {
          return bars.map(() => ({
              height: `${20 + Math.random() * 30}%`,
              duration: `${0.8 + Math.random() * 0.4}s`
          }));
      }
      return bars.map(() => ({ height: '15%', duration: '1.5s' }));
  };

  const activeBars = getBarHeights();

  return (
    <div className="flex items-center justify-center gap-[3px] h-10 w-full max-w-[200px] opacity-90">
      <style>{`
        @keyframes shimmer-wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.5; filter: blur(0.5px); }
          50% { transform: scaleY(1.3); opacity: 1; filter: blur(0px); }
        }
      `}</style>
      {activeBars.map((style, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-700
            ${state === 'speaking' 
              ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]' 
              : 'bg-gradient-to-t from-sky-600 via-sky-400 to-blue-300 shadow-[0_0_10px_rgba(56,189,248,0.3)]'}
          `}
          style={{
            height: style.height,
            animation: `shimmer-wave ${style.duration} cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${i * 0.04}s`
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;

