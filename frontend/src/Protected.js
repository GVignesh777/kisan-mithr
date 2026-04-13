import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useUserStore from "./store/useUserStore";
import { useAuth } from "./context/AuthContext";
import Loader from "./utils/loader";

/**
 * ProtectedRoute: Ensures user is authenticated.
 * If not authenticated, redirects to login.
 * If authenticated but no role selection, redirects to role page.
 */
export const ProtectedRoute = () => {
    const location = useLocation();
    const { user, authChecked } = useAuth();

    // SHOW LOADER while checking
    if (!authChecked) {
        return <Loader />;
    }

    // REDIRECT TO LOGIN if not authenticated
    if (!user && location.pathname !== "/user-login") {
        return <Navigate to="/user-login" state={{ from: location }} replace />;
    }

    // AUTHENTICATED BUT NO ROLE (and not already on role selection page)
    if (user && !user.role && location.pathname !== "/role") {
        return <Navigate to="/role" replace />;
    }

    return <Outlet />;
};

/**
 * RoleGuard: Enforces role-based access control.
 * Redirects unauthorized users to their authorized dashboards.
 */
export const RoleGuard = ({ allowedRoles }) => {
    const { user } = useAuth();
    const userRole = useMemo(() => user?.role?.toLowerCase(), [user?.role]);

    if (!userRole) {
        return <Navigate to="/role" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        console.warn(`[RoleGuard] Access Denied. User: ${user?.username}, Role: "${userRole}", Required: [${allowedRoles}]`);
        switch (userRole) {
            case 'admin':
                return <Navigate to="/admin-dashboard" replace />;
            case 'buyer':
                return <Navigate to="/buyer-dashboard" replace />;
            case 'farmer':
                return <Navigate to="/" replace />;
            default:
                return <Navigate to="/role" replace />;
        }
    }

    return <Outlet />;
};

/**
 * PublicRoute: Prevents logged-in users from accessing login/register pages.
 */
export const PublicRoute = () => {
    const { user, authChecked } = useAuth();

    if (!authChecked) return <Loader />;

    if (user) {
        // If logged in, redirect away from public pages to their respective dashboards
        const role = user?.role?.toLowerCase();
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (role === 'buyer') return <Navigate to="/buyer-dashboard" replace />;
        return <Navigate to="/" replace />;
    }
    
    return <Outlet />;
};