import React from 'react';

const WaveformVisualizer = ({ state }) => {
  // We'll simulate a waveform with animated bars when listening or speaking
  const bars = Array.from({ length: 20 });
  
  const getBarHeights = () => {
      if (state === 'speaking') {
          // taller, faster bars
          return bars.map((_, i) => ({
              height: `${Math.random() * 60 + 20}%`,
              animationDuration: `${Math.random() * 0.5 + 0.3}s`
          }));
      } else if (state === 'listening') {
          // smoother, medium bars
          return bars.map((_, i) => ({
              height: `${Math.random() * 30 + 10}%`,
              animationDuration: `${Math.random() * 0.8 + 0.5}s`
          }));
      }
      return bars.map(() => ({ height: '10%', animationDuration: '1s' }));
  };

  const activeBars = getBarHeights();

  return (
    <div className="flex items-end justify-center gap-1 h-12 w-64 my-6 opacity-80">
      <style>{`
        @keyframes pulse-rapid {
          0%, 100% { transform: scaleY(1); opacity: 0.9; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }
      `}</style>
      {activeBars.map((style, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transform transition-all 
            ${state === 'speaking' ? 'bg-gradient-to-t from-green-400 to-teal-500' : 'bg-gradient-to-t from-sky-400 to-blue-500'}
          `}
          style={{
            height: style.height,
            animation: `pulse-rapid ${style.animationDuration} ease-in-out infinite alternate`,
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
