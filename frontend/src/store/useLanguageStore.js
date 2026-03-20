import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLanguageStore = create(
  persist(
    (set) => ({
      language: "en", // default English

      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "language-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useLanguageStore;