import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 [&>aside]:flex">
            <Sidebar />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-white"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-slate-600" type="button">
            <Menu size={20} />
          </button>
          <p className="text-base font-medium tracking-tight text-slate-900">AssetHub</p>
        </div>
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
