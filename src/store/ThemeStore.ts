import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  isMenuOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleMenu: () => void;
  setIsMenuOpen: (open: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      isMenuOpen: false,

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      setTheme: (theme) => set({ theme }),

      toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),

      setIsMenuOpen: (open) => set({ isMenuOpen: open }),
    }),
    {
      name: "ledgerpulse-theme",
      // only save theme, not isMenuOpen
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);
