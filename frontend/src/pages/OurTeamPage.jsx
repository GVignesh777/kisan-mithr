import React, { useEffect } from 'react';
import Header from '../components/header/Header';
import Footer from '../components/Footer';
import OurTeam from '../components/OurTeam';
import { motion } from 'framer-motion';

const OurTeamPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-zinc-950 min-h-screen font-sans selection:bg-green-500/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <OurTeam />
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OurTeamPage;
