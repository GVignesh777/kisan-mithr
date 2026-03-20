import { useEffect, useState, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useUserStore from "./store/useUserStore";
import { checkUserAuth } from "./services/user.service";
import Loader from "./utils/loader";

/**
 * ProtectedRoute: Ensures user is authenticated.
 * If not authenticated, redirects to login.
 * If authenticated but no role selection, redirects to role page.
 */
export const ProtectedRoute = () => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const { isAuthenticated, user, setUser, clearUser } = useUserStore();

    useEffect(() => {
        let isMounted = true;
        const verifyAuth = async () => {
            try {
                const result = await checkUserAuth();
                if (isMounted) {
                    if (result?.isAuthenticated) {
                        setUser(result.user);
                    } else {
                        clearUser();
                    }
                }
            } catch (error) {
                console.error("Auth verification failed:", error);
                if (isMounted) clearUser();
            } finally {
                if (isMounted) setIsChecking(false);
            }
        };

        verifyAuth();
        return () => { isMounted = false; };
    }, [setUser, clearUser]);

    if (isChecking) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/user-login" state={{ from: location }} replace />;
    }

    // AUTHENTICATED BUT NO ROLE (and not already on role selection page)
    if (!user?.role && location.pathname !== "/role") {
        return <Navigate to="/role" replace />;
    }

    return <Outlet />;
};

/**
 * RoleGuard: Enforces role-based access control.
 * Redirects unauthorized users to their authorized dashboards.
 */
export const RoleGuard = ({ allowedRoles }) => {
    const { user } = useUserStore();
    const userRole = useMemo(() => user?.role?.toLowerCase(), [user?.role]);

    // If role is missing, ProtectedRoute should have caught it, but we guard here too.
    if (!userRole) {
        return <Navigate to="/role" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        console.warn(`[RoleGuard] Access Denied. User: ${user?.username}, Role: "${userRole}", Required: [${allowedRoles}]`);
        // Redirect unauthorized users to their respective dashboards
        switch (userRole) {
            case 'admin':
                return <Navigate to="/admin-dashboard" replace />;
            case 'buyer':
                return <Navigate to="/buyer-dashboard" replace />;
            case 'farmer':
                return <Navigate to="/" replace />;
            default:
                console.log("[RoleGuard] No valid role found or unauthorized access, redirecting to Role selection.");
                return <Navigate to="/role" replace />;
        }
    }

    return <Outlet />;
};

/**
 * PublicRoute: Prevents logged-in users from accessing login/register pages.
 */
export const PublicRoute = () => {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    const { user } = useUserStore();

    if (isAuthenticated) {
        // If logged in, redirect away from public pages to their respective dashboards
        const role = user?.role?.toLowerCase();
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (role === 'buyer') return <Navigate to="/buyer-dashboard" replace />;
        return <Navigate to="/" replace />;
    }
    
    return <Outlet />;
};
