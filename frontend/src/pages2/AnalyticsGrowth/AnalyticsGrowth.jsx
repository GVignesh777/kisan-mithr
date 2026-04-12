import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  BrainCircuit, 
  TrendingUp, 
  Droplets, 
  TreePine, 
  CloudSun, 
  FileDown 
} from 'lucide-react';
import Header from "../../components/header/Header";
import Footer from "../../components/Footer";

// Lazy loading tabs for performance
import axiosInstance from '../../services/url.service';
const OverviewDashboard = React.lazy(() => import('./tabs/OverviewDashboard'));
const CropAnalytics = React.lazy(() => import('./tabs/CropAnalytics'));
const ProfitExpenses = React.lazy(() => import('./tabs/ProfitExpenses'));
const SmartInsights = React.lazy(() => import('./tabs/SmartInsights'));
const ResourceUsage = React.lazy(() => import('./tabs/ResourceUsage'));
const GrowthPlanning = React.lazy(() => import('./tabs/GrowthPlanning'));
const WeatherImpact = React.lazy(() => import('./tabs/WeatherImpact'));
const ReportsExport = React.lazy(() => import('./tabs/ReportsExport'));

const AnalyticsGrowth = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/analytics/overview');
      setOverviewData(res.data.data);
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'crop', label: 'Crop Analytics', icon: BarChart3 },
    { id: 'profit', label: 'Profit & Expenses', icon: Wallet },
    { id: 'insights', label: 'Smart Insights', icon: BrainCircuit },
    { id: 'resource', label: 'Resource Usage', icon: Droplets },
    { id: 'growth', label: 'Growth Planning', icon: TreePine },
    { id: 'weather', label: 'Weather Impact', icon: CloudSun },
    { id: 'reports', label: 'Reports & Export', icon: FileDown },
  ];

  const renderContent = () => {
    const commonProps = { overviewData, loading, onRefresh: fetchOverview };
    switch (activeTab) {
      case 'overview': return <OverviewDashboard {...commonProps} />;
      case 'crop': return <CropAnalytics {...commonProps} />;
      case 'profit': return <ProfitExpenses {...commonProps} />;
      case 'insights': return <SmartInsights {...commonProps} />;
      case 'resource': return <ResourceUsage {...commonProps} />;
      case 'growth': return <GrowthPlanning {...commonProps} />;
      case 'weather': return <WeatherImpact {...commonProps} />;
      case 'reports': return <ReportsExport {...commonProps} />;
      default: return <OverviewDashboard {...commonProps} />;
    }
  };


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="sticky top-28 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl">
            <div className="mb-6 px-2">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                Analytics & Growth
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Smart Farm Intelligence</p>
            </div>
            
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-left whitespace-nowrap lg:whitespace-normal flex-shrink-0 ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-600/20 to-emerald-500/10 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-green-400' : 'text-zinc-500'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-grow min-w-0">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 min-h-[700px] shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 h-full">
              <React.Suspense fallback={
                <div className="h-full flex items-center justify-center min-h-[500px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-zinc-400 font-medium animate-pulse">Loading intelligence...</p>
                  </div>
                </div>
              }>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </React.Suspense>
            </div>
          </div>
        </div>
        
      </div>
      
      <Footer />
    </div>
  );
};

export default AnalyticsGrowth;
