import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { LogOut } from "lucide-react";

export function HamburgerMenu() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  async function handleSignOut() {
    await signOut();
    navigate("/signin");
  }

  return (
    <button
      type="button"
      className="signout-button logout-button"
      onClick={handleSignOut}
    >
      <LogOut size={15} strokeWidth={2} aria-hidden="true" />
      <span>Sign Out</span>
    </button>
  );
}
