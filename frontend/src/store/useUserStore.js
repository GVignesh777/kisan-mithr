import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthChecked: false, // New state
      setUser: (userData) => set({ user: userData, isAuthenticated: true, isAuthChecked: true }),
      setAuthChecked: (status) => set({ isAuthChecked: status }),
      clearUser: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, isAuthenticated: false, isAuthChecked: true });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);


export default useUserStore;