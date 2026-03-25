import React, { useState, useEffect, useRef } from "react";
import PageTransitionLoader from "./components/PageTransitionLoader";
import NetworkSplashScreen from "./components/NetworkSplashScreen";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth & Protection
import { ProtectedRoute, PublicRoute, RoleGuard } from "./Protected";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import useLanguageStore from "./store/useLanguageStore";

// Profile & Notifications
import ProfilePage from "./pages/ProfileSettings/ProfilePage";
import NotificationsPage from "./pages/ProfileSettings/NotificationsPage";

// Public Pages
import Login from "./pages/user-login/Login";
import ForgotPasswordHTML from "./pages/user-login/ForgotPass";
import ResetPasswordHTML from "./pages/user-login/ResetPass";
import AdminLogin from './pages/Admin/AdminLogin';
import ErrorPage from "./components/ErrorPage";
import OurTeamPage from "./pages/OurTeamPage";

// Role Selection
import Role from "./components/Role";

// Farmer Pages
import HomePage from "./components/HomePage";
import VoiceAssistant from "./pages/more-section/VoiceAssistant";
import WeatherDashboard from './pages2/Weather/WeatherDashboard';
import MarketPrices from './pages2/Market/MarketPrices';
import CropHealthMap from './pages2/CropHealth/CropHealthMap';
import PestDetector from './pages2/PestDetect/PestDetector';
import FarmProfileForm from './pages2/FarmProfile/FarmProfileForm';
import LivestockGuide from './pages2/Livestock/LivestockGuide';
import GovSchemes from './pages2/GovSchemes/GovSchemes';
import SatelliteHealthCockpit from './pages2/CropHealth/SatelliteHealthCockpit';

// Buyer Pages
import BuyerLayout from './pages/Buyer/BuyerLayout';
import BuyerOverview from './pages/Buyer/tabs/BuyerOverview';
import BuyerMarketplace from './pages/Buyer/tabs/BuyerMarketplace';
import BuyerOrders from './pages/Buyer/tabs/BuyerOrders';
import BuyerInventory from './pages/Buyer/tabs/BuyerInventory';
import BuyerPayments from './pages/Buyer/tabs/BuyerPayments';
import BuyerProfile from './pages/Buyer/tabs/BuyerProfile';
import BuyerSettings from './pages/Buyer/tabs/BuyerSettings';

// Admin Pages
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminConversations from './pages/Admin/AdminConversations';
import AdminDiseaseReports from './pages/Admin/AdminDiseaseReports';
import AdminImageModeration from './pages/Admin/AdminImageModeration';
import AdminMarketPrices from './pages/Admin/AdminMarketPrices';
import AdminFarmerMap from './pages/Admin/AdminFarmerMap';
import AdminSystemHealth from './pages/Admin/AdminSystemHealth';
import AdminNotifications from './pages/Admin/AdminNotifications';
import AdminFeedback from './pages/Admin/AdminFeedback';
import AdminAI from './pages/Admin/AdminAI';

/* ─────────────────────────────────────────────
   Route Change Listener
   Sits inside <Router>, watches location changes,
   and shows the PageTransitionLoader overlay.
───────────────────────────────────────────── */

const RouteChangeListener = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('enter');
  const isFirst = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    // Skip the very first render (page load)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    // Clear any running timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // 1. Fade the overlay IN
    setPhase('enter');
    setVisible(true);

    // 2. After 650ms start fading OUT
    timerRef.current = setTimeout(() => {
      setPhase('exit');
      // 3. After fade-out completes, unmount
      timerRef.current = setTimeout(() => setVisible(false), 320);
    }, 650);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <PageTransitionLoader visible={visible} phase={phase} />;
};


const App = () => {
  const { language } = useLanguageStore();

  // Show splash only once per browser session
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("km_splash_seen")
  );

  const handleSplashDone = () => {
    sessionStorage.setItem("km_splash_seen", "1");
    setShowSplash(false);
  };

  const getFontClass = () => {
    if (language?.includes('hi')) return 'font-hind';
    if (language?.includes('te')) return 'font-anek';
    return 'font-sans';
  };

  return (
    <div className={`${getFontClass()} antialiased transition-all duration-300 min-h-screen bg-zinc-950 text-white`}>
      {showSplash && <NetworkSplashScreen onDone={handleSplashDone} />}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />


      <Router>
        <RouteChangeListener />
        <Routes>
          {/* 🔓 Public Routes (Accessible only when logged out) */}
          <Route element={<PublicRoute />}>
            <Route path="/user-login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordHTML />} />
            <Route path="/resetPassword/:token" element={<ResetPasswordHTML />} />
          </Route>

          {/* Admin login is always accessible — not gated by PublicRoute */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* 🔒 Core Protected Routes (Must be Logged In) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/role" element={<Role />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* 🚜 Farmer Specific Routes */}
            <Route element={<RoleGuard allowedRoles={['farmer']} />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/assistant" element={<VoiceAssistant />} />
              <Route path="/weather" element={<WeatherDashboard />} />
              <Route path="/market" element={<MarketPrices />} />
              <Route path="/crop-health" element={<CropHealthMap />} />
              <Route path="/satellite-cockpit" element={<SatelliteHealthCockpit />} />
              <Route path="/pest-detect" element={<PestDetector />} />
              <Route path="/farm-profile" element={<FarmProfileForm />} />
              <Route path="/livestock" element={<LivestockGuide />} />
              <Route path="/schemes" element={<GovSchemes />} />
            </Route>

            {/* 🛒 Buyer Specific Routes */}
            <Route element={<RoleGuard allowedRoles={['buyer']} />}>
              <Route path="/buyer-dashboard" element={<BuyerLayout />}>
                <Route index element={<BuyerOverview />} />
                <Route path="market" element={<BuyerMarketplace />} />
                <Route path="orders" element={<BuyerOrders />} />
                <Route path="inventory" element={<BuyerInventory />} />
                <Route path="payments" element={<BuyerPayments />} />
                <Route path="profile" element={<BuyerProfile />} />
                <Route path="settings" element={<BuyerSettings />} />
              </Route>
            </Route>



          </Route> {/* End ProtectedRoute */}

          {/* 🛡️ Admin Specific Routes — guarded by adminToken (email+password), NOT the standard user session */}
          <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>} path="/admin-dashboard">
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminDiseaseReports />} />
            <Route path="conversations" element={<AdminConversations />} />
            <Route path="moderation" element={<AdminImageModeration />} />
            <Route path="market" element={<AdminMarketPrices />} />
            <Route path="analytics" element={<AdminDashboardPage />} />
            <Route path="map" element={<AdminFarmerMap />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="health" element={<AdminSystemHealth />} />
            <Route path="ai" element={<AdminAI />} />
          </Route>

          {/* 🚩 Standalone Pages */}
          <Route path="/our-team" element={<OurTeamPage />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* 🔍 404 Redirect */}
          <Route
            path="*"
            element={<Navigate to="/error" state={{ error: "Error 404: Page not found" }} replace />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;