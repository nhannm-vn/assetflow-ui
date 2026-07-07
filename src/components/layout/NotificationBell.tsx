import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui/DataDisplay";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotificationRealtime,
  useNotificationsQuery,
  useUnreadCountQuery,
} from "@/hooks/useNotifications";
import { useIsAuthenticated } from "@/store/authStore";

export function NotificationBell() {
  const isAuthenticated = useIsAuthenticated();
  const { data: items = [] } = useNotificationsQuery(isAuthenticated);
  const { data: unreadCount = 0 } = useUnreadCountQuery(isAuthenticated);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  useNotificationRealtime(isAuthenticated);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        type="button"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 animate-[popup_.15s_ease-out] rounded-xl border border-slate-100 bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Thông báo</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                type="button"
              >
                <CheckCheck size={13} /> Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <EmptyState title="Không có thông báo" description="Bạn sẽ thấy cập nhật tại đây." />
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                  type="button"
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-50",
                    !n.isRead && "bg-indigo-50/60"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />}
                    <p className={cn("flex-1 text-slate-700", !n.isRead && "font-semibold text-slate-900")}>
                      {n.content}
                    </p>
                  </div>
                  <span className="pl-3.5 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
