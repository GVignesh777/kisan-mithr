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

// Lazy Loaded Pages for Performance Optimization
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const HomePage = React.lazy(() => import("./components/HomePage"));
const VoiceAssistant = React.lazy(() => import("./pages/more-section/VoiceAssistant"));
const Login = React.lazy(() => import("./pages/user-login/Login"));
const ProfilePage = React.lazy(() => import("./pages/ProfileSettings/ProfilePage"));
const NotificationsPage = React.lazy(() => import("./pages/ProfileSettings/NotificationsPage"));
const ForgotPasswordHTML = React.lazy(() => import("./pages/user-login/ForgotPass"));
const ResetPasswordHTML = React.lazy(() => import("./pages/user-login/ResetPass"));
const AdminLogin = React.lazy(() => import("./pages/Admin/AdminLogin"));
const OurTeamPage = React.lazy(() => import("./pages/OurTeamPage"));
const ContactUsPage = React.lazy(() => import("./pages/ContactUsPage"));
const TermsPage = React.lazy(() => import("./pages/TermsPage"));
const WeatherDashboard = React.lazy(() => import("./pages2/Weather/WeatherDashboard"));
const MarketPrices = React.lazy(() => import("./pages2/Market/MarketPrices"));
const CropHealthMap = React.lazy(() => import("./pages2/CropHealth/CropHealthMap"));
const PestDetector = React.lazy(() => import("./pages2/PestDetect/PestDetector"));
const FarmProfileForm = React.lazy(() => import("./pages2/FarmProfile/FarmProfileForm"));
const LivestockGuide = React.lazy(() => import("./pages2/Livestock/LivestockGuide"));
const GovSchemes = React.lazy(() => import("./pages2/GovSchemes/GovSchemes"));
const SatelliteHealthCockpit = React.lazy(() => import("./pages2/CropHealth/SatelliteHealthCockpit"));
const Role = React.lazy(() => import("./components/Role"));
const ErrorPage = React.lazy(() => import("./components/ErrorPage"));

// Buyer Pages (Lazy)
const BuyerLayout = React.lazy(() => import("./pages/Buyer/BuyerLayout"));
const BuyerOverview = React.lazy(() => import("./pages/Buyer/tabs/BuyerOverview"));
const BuyerMarketplace = React.lazy(() => import("./pages/Buyer/tabs/BuyerMarketplace"));
const BuyerOrders = React.lazy(() => import("./pages/Buyer/tabs/BuyerOrders"));
const BuyerInventory = React.lazy(() => import("./pages/Buyer/tabs/BuyerInventory"));
const BuyerPayments = React.lazy(() => import("./pages/Buyer/tabs/BuyerPayments"));
const BuyerProfile = React.lazy(() => import("./pages/Buyer/tabs/BuyerProfile"));
const BuyerSettings = React.lazy(() => import("./pages/Buyer/tabs/BuyerSettings"));

// Admin Pages (Lazy)
const AdminLayout = React.lazy(() => import("./components/Admin/AdminLayout"));
const AdminDashboardPage = React.lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminUsers = React.lazy(() => import("./pages/Admin/AdminUsers"));
const AdminConversations = React.lazy(() => import("./pages/Admin/AdminConversations"));
const AdminDiseaseReports = React.lazy(() => import("./pages/Admin/AdminDiseaseReports"));
const AdminImageModeration = React.lazy(() => import("./pages/Admin/AdminImageModeration"));
const AdminMarketPrices = React.lazy(() => import("./pages/Admin/AdminMarketPrices"));
const AdminFarmerMap = React.lazy(() => import("./pages/Admin/AdminFarmerMap"));
const AdminSystemHealth = React.lazy(() => import("./pages/Admin/AdminSystemHealth"));
const AdminNotifications = React.lazy(() => import("./pages/Admin/AdminNotifications"));
const AdminFeedback = React.lazy(() => import("./pages/Admin/AdminFeedback"));
const AdminAI = React.lazy(() => import("./pages/Admin/AdminAI"));

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
        <React.Suspense fallback={<PageTransitionLoader visible={true} phase="enter" />}>
          <Routes>
            {/* 🌍 Public Landing Page (SEO Targeted) */}
            <Route path="/" element={<LandingPage />} />

            {/* 🔓 Public Auth Routes (Accessible only when logged out) */}
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
                <Route path="/dashboard" element={<HomePage />} />
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
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/error" element={<ErrorPage />} />

          {/* 🔍 404 Redirect */}
          <Route
            path="*"
            element={<Navigate to="/error" state={{ error: "Error 404: Page not found" }} replace />}
          />
          </Routes>
        </React.Suspense>
      </Router>
    </div>
  );
}

export default App;