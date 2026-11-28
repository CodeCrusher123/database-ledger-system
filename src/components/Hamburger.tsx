import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useThemeStore } from "../store/ThemeStore";
import { LogOut, Sun, Moon } from "lucide-react";
import "../styles/HamburgerMenu.css";

export function HamburgerMenu() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  async function handleSignOut() {
    await signOut();
    navigate("/signin");
  }

  return (
    <div className="hamburger-menu" aria-label="hamburger-menu">
      <button
        type="button"
        className="theme-toggler"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon size={15} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Sun size={15} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        className="signout-button logout-button"
        onClick={handleSignOut}
      >
        <LogOut size={15} strokeWidth={2} aria-hidden="true" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
