import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      <tr className="[&>th]:px-4 [&>th]:py-3">{children}</tr>
    </thead>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return (
    <tbody className="divide-y divide-slate-100 bg-white [&>tr:hover]:bg-slate-50/60 [&>tr>td]:px-4 [&>tr>td]:py-3.5">
      {children}
    </tbody>
  );
}

/** Skeleton loader cho bảng — mượt hơn spinner khi tải dữ liệu server. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <tbody className="divide-y divide-slate-100 bg-white [&>tr>td]:px-4 [&>tr>td]:py-3.5">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <div
                className="h-4 animate-pulse rounded bg-slate-100"
                style={{ width: `${55 + ((r * 13 + c * 27) % 40)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function Spinner({ label = "Đang tải…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-14 text-slate-400", className)}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function EmptyState({
  title = "Chưa có dữ liệu",
  description,
  action,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-300">
        <Icon size={20} />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-xs text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.75rem] font-medium tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
