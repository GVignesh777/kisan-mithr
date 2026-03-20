import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/km-1.png';

export default function Loader({ progress: externalProgress }) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [networkInfo, setNetworkInfo] = useState('');

  useEffect(() => {
    // Detect Network Speed via Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const type = connection.effectiveType; // 'slow-2g', '2g', '3g', or '4g'
      const speedStr = connection.downlink ? `${connection.downlink}Mbps` : '';
      setNetworkInfo(`${type ? type.toUpperCase() : 'WIFI'} ${speedStr ? `(${speedStr})` : ''}`);
      
      const updateConnectionStatus = () => {
         const newType = connection.effectiveType;
         const newSpeed = connection.downlink ? `${connection.downlink}Mbps` : '';
         setNetworkInfo(`${newType ? newType.toUpperCase() : 'WIFI'} ${newSpeed ? `(${newSpeed})` : ''}`);
      };
      
      connection.addEventListener('change', updateConnectionStatus);
      return () => {
        connection.removeEventListener('change', updateConnectionStatus);
      };
    } else {
      setNetworkInfo('Active Connection');
    }
  }, []);

  useEffect(() => {
    // Simulator interval
    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        let speedMultiplier = 1;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
          speedMultiplier = 0.2;
        } else if (connection && connection.effectiveType === '3g') {
           speedMultiplier = 0.5;
        } else if (connection && connection.effectiveType === '4g') {
           speedMultiplier = 1.2;
        }

        let increment = (Math.random() * 8 + 2) * speedMultiplier;
        
        // Asymptotically approach 99
        if (prev > 70) increment *= 0.5;
        if (prev > 85) increment *= 0.3;
        if (prev > 95) increment *= 0.1;

        const nextProgress = Math.min(prev + increment, 99);
        return nextProgress;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Use external progress if it is provided and valid, otherwise use internal estimated progress
  const displayProgress = externalProgress !== undefined && externalProgress > 0 
    ? Math.max(Math.floor(externalProgress), Math.floor(internalProgress))
    : Math.floor(internalProgress);

  useEffect(() => {
    if (displayProgress < 20) setLoadingText('Establishing secure connection...');
    else if (displayProgress < 45) setLoadingText('Fetching farm data...');
    else if (displayProgress < 75) setLoadingText('Loading user preferences...');
    else if (displayProgress < 95) setLoadingText('Preparing AI assistant...');
    else setLoadingText('Finishing up...');
  }, [displayProgress]);

  return (
    <div className="fixed inset-0 bg-[#0b1120] flex flex-col items-center justify-center z-[9999] overflow-hidden">
      {/* Background Ambience / Glassmorphism Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-green-500/20 rounded-full blur-[120px] translate-x-[-30%] translate-y-[-20%]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-600/20 rounded-full blur-[120px] translate-x-[30%] translate-y-[20%]" 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8 py-10 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        {/* Animated Logo Container */}
        <div className="relative w-28 h-28 mb-10 flex items-center justify-center">
          {/* Orbital rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-green-400/40"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-12px] rounded-full border border-dashed border-blue-400/30"
          />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-24px] rounded-full border border-dashed border-white/10"
          />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 bg-white/90 shadow-[0_0_40px_rgba(72,187,120,0.3)] rounded-full flex items-center justify-center relative z-10 p-2"
          >
            <img src={logo} alt="Kisan Mithr Logo" className="w-[85%] h-[85%] object-contain" />
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-end px-1">
            <AnimatePresence mode="wait">
              <motion.span 
                key={loadingText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-gray-300 text-sm font-medium tracking-wide"
              >
                {loadingText}
              </motion.span>
            </AnimatePresence>
            <span className="text-white text-xl font-bold font-mono tracking-tighter drop-shadow-md">
              {displayProgress}%
            </span>
          </div>

          <div className="h-2 w-full bg-gray-800/80 rounded-full overflow-hidden relative border border-gray-700/50 shadow-inner">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            >
               {/* Internal shimmer line */}
               <motion.div
                 className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                 animate={{ x: ['-100%', '200%'] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               />
            </motion.div>
          </div>
          
          {/* Network indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center mt-6 pt-4 border-t border-white/5"
          >
             <span className="text-xs text-gray-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Status: Nominal
             </span>
             {networkInfo && (
               <span className="text-[10px] text-gray-300 font-mono bg-white/5 px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                 {networkInfo}
               </span>
             )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}