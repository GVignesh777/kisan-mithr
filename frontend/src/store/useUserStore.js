import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (userData) => set({ user: userData, isAuthenticated: true }),
      clearUser: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);


export default useUserStore;