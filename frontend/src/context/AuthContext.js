import { createContext, useContext, useEffect, useState } from "react";
import { checkUserAuth } from "../services/user.service";
import useUserStore from "../store/useUserStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const { setUser: setStoreUser, clearUser: clearStoreUser, setAuthChecked: setStoreAuthChecked } = useUserStore();

    const checkAuth = async () => {
        try {
            const result = await checkUserAuth();
            if (result?.isAuthenticated) {
                setUser(result.user);
                setStoreUser(result.user); // Sync with store
            } else {
                setUser(null);
                clearStoreUser(); // Sync with store
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            setUser(null);
            clearStoreUser();
        } finally {
            setAuthChecked(true);
            setStoreAuthChecked(true); // Sync with store
        }
    };

    useEffect(() => {
        checkAuth(); // ✅ ONLY ONCE globally
    }, []);

    return (
        <AuthContext.Provider value={{ user, authChecked, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
