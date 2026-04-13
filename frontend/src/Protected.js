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
    const { isAuthenticated, isAuthChecked, user, setUser, clearUser, setAuthChecked } = useUserStore();

    useEffect(() => {
        // 1. If we are on the login page, don't trigger a recursive check
        if (location.pathname === "/user-login") {
            setAuthChecked(true);
            return;
        }

        // 2. If already checked or authenticated, stop
        if (isAuthChecked || isAuthenticated) return;

        // 3. Check for local token existence
        const hasToken = !!localStorage.getItem('auth_token');
        if (!hasToken) {
            setAuthChecked(true);
            return;
        }

        // 4. Verify with server
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
                if (isMounted) setAuthChecked(true);
            }
        };

        verifyAuth();
        
        return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, isAuthenticated, isAuthChecked]);

    // SHOW LOADER while checking
    if (!isAuthChecked && !isAuthenticated) {
        return <Loader />;
    }

    // REDIRECT TO LOGIN if not authenticated
    if (!isAuthenticated && location.pathname !== "/user-login") {
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