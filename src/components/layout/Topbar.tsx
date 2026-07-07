import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { NotificationBell } from "./NotificationBell";

export function Topbar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/85 px-6 backdrop-blur-md">
      <div />
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <div className="mx-1 h-6 w-px bg-slate-100" />
        <button
          onClick={handleLogout}
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
