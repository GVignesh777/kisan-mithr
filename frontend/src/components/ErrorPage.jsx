import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get error from state if passed, fallback to default message
  const errorMessage = location.state?.error || "We couldn't find the field you're looking for.";

  // Cloud animation variants
  const cloudVariants = {
    animate: {
      x: ["-10%", "110%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 25,
          ease: "linear",
        },
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#f0f9f4] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Animated Clouds */}
      <motion.div 
        variants={cloudVariants} 
        animate="animate" 
        className="absolute top-20 left-0 w-full opacity-40 pointer-events-none"
      >
        <svg width="120" height="40" viewBox="0 0 120 40" fill="#a7f3d0" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 20C40 14.4772 44.4772 10 50 10C51.6083 10 53.1278 10.3807 54.4636 11.0505C57.3828 4.41738 63.9517 0 71.5 0C80.8888 0 88.6321 6.99335 89.8492 16.035C90.383 16.0118 90.9366 16 91.5 16C100.06 16 107 22.9401 107 31.5C107 40.0599 100.06 47 91.5 47H40C28.9543 47 20 38.0457 20 27C20 15.9543 28.9543 7 40 7C40.6695 7 41.3312 7.03362 41.9825 7.09841C42.8441 2.97727 46.49 0 51 0C56.5228 0 61 4.47715 61 10C61 10.2241 60.9926 10.4465 60.9781 10.6669C62.7214 9.60156 64.7891 9 67 9C74.1797 9 80 14.8203 80 22C80 23.0131 79.8839 24.008 79.6644 24.9745C80.2599 24.9914 80.8753 25 81.5 25C86.1944 25 90 28.8056 90 33.5C90 38.1944 86.1944 42 81.5 42H50C44.4772 42 40 37.5228 40 32Z" />
        </svg>
      </motion.div>

      <motion.div 
        variants={cloudVariants} 
        animate="animate" 
        className="absolute top-40 left-[-20%] w-full opacity-30 pointer-events-none"
        style={{ animationDelay: '-10s' }}
      >
        <svg width="80" height="30" viewBox="0 0 120 40" fill="#6ee7b7" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 20C40 14.4772 44.4772 10 50 10C51.6083 10 53.1278 10.3807 54.4636 11.0505C57.3828 4.41738 63.9517 0 71.5 0C80.8888 0 88.6321 6.99335 89.8492 16.035C90.383 16.0118 90.9366 16 91.5 16C100.06 16 107 22.9401 107 31.5C107 40.0599 100.06 47 91.5 47H40C28.9543 47 20 38.0457 20 27C20 15.9543 28.9543 7 40 7C40.6695 7 41.3312 7.03362 41.9825 7.09841C42.8441 2.97727 46.49 0 51 0C56.5228 0 61 4.47715 61 10C61 10.2241 60.9926 10.4465 60.9781 10.6669C62.7214 9.60156 64.7891 9 67 9C74.1797 9 80 14.8203 80 22C80 23.0131 79.8839 24.008 79.6644 24.9745C80.2599 24.9914 80.8753 25 81.5 25C86.1944 25 90 28.8056 90 33.5C90 38.1944 86.1944 42 81.5 42H50C44.4772 42 40 37.5228 40 32Z" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-10 max-w-lg w-full text-center border border-white/40"
      >
        {/* Animated Tractor & Farm Graphic */}
        <div className="relative h-48 mb-6 flex items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-t from-green-50 to-transparent">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 w-full h-4 bg-green-600 rounded-full" />
          
          {/* Tractor Engine Bumping Effect */}
          <motion.div
             animate={{ y: [0, -3, 0] }}
             transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
             className="relative z-10 bottom-3"
          >
            <svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Back Wheel */}
              <circle cx="35" cy="70" r="25" fill="#1f2937" />
              <circle cx="35" cy="70" r="18" fill="#4b5563" />
              <circle cx="35" cy="70" r="8" fill="#fbbf24" />
              {/* Front Wheel */}
              <circle cx="110" cy="80" r="15" fill="#1f2937" />
              <circle cx="110" cy="80" r="10" fill="#4b5563" />
              <circle cx="110" cy="80" r="5" fill="#fbbf24" />
              {/* Chassis */}
              <path d="M15 45H75C80.5228 45 85 49.4772 85 55V65H15V45Z" fill="#16a34a" />
              <path d="M75 50L100 55C105.523 56.1046 110 61.4772 110 67V75H75V50Z" fill="#15803d" />
              {/* Cabin */}
              <path d="M30 15H70L75 45H25L30 15Z" fill="#22c55e" />
              {/* Window */}
              <path d="M35 20H65L68 40H32L35 20Z" fill="#bae6fd" />
              {/* Exhaust */}
              <rect x="85" y="30" width="6" height="20" rx="3" fill="#6b7280" />
            </svg>
          </motion.div>

          {/* Smoke Puffs */}
          <motion.div
            animate={{ y: [-10, -30], opacity: [0.8, 0], scale: [1, 2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute right-8 top-12 w-4 h-4 rounded-full bg-gray-400"
          />
          <motion.div
            animate={{ y: [-10, -40], opacity: [0.6, 0], scale: [1, 2.5] }}
            transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute right-10 top-14 w-5 h-5 rounded-full bg-gray-300"
          />

          {/* Glitching Error Code */}
          <motion.div 
            className="absolute top-4 left-0 w-full text-center"
            animate={{ x: [-2, 2, -1, 1, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror", repeatDelay: 3 }}
          >
            <h1 className="text-6xl font-black text-green-800/20 tracking-tighter mix-blend-multiply">404</h1>
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold text-gray-800 mb-2 font-inter"
        >
          Lost your way?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600 mb-8 max-w-[280px] mx-auto leading-relaxed"
        >
          {errorMessage} The tractor might have veered off the main path.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-green-700 bg-green-100/80 hover:bg-green-200/80 border border-green-200 transition-all shadow-sm flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Go Back
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Return Home
          </motion.button>
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8 }}
           className="mt-10 flex items-center justify-center gap-2 text-gray-400 text-sm font-medium"
        >
           <span className="w-8 h-px bg-gray-300"></span>
           Kisan Mithr
           <span className="w-8 h-px bg-gray-300"></span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;