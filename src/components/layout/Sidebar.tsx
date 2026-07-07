import { NavLink } from "react-router-dom";
import { Box } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_SECTIONS } from "./navConfig";
import { useAuthStore, useIsAdmin } from "@/store/authStore";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useIsAdmin();
  const role = isAdmin ? "ADMIN" : "USER";

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 lg:flex">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Box size={16} strokeWidth={2.5} className="text-white" />
        </div>
        <p className="text-[15px] font-semibold tracking-tight text-white">AssetHub</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.filter((s) => !s.roles || s.roles.includes(role)).map((section, idx) => {
          const items = section.items.filter((i) => i.roles.includes(role));
          if (items.length === 0) return null;
          return (
            <div key={idx} className="mb-5">
              {section.title && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "border-indigo-500 bg-white/[0.06] text-white"
                          : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      )
                    }
                  >
                    <item.icon size={16} className="shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
            {(user?.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{user?.email}</p>
            <p className="text-[11px] text-slate-400">{isAdmin ? "Quản trị viên" : "Nhân viên"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
