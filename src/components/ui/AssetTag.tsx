import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AssetTagProps {
  children: ReactNode;
  className?: string;
  tone?: "slate" | "indigo";
}

// Yếu tố nhận diện riêng của app: mã tài sản hiển thị như thẻ treo vật lý
// (asset tag) — có lỗ đục ở đầu, font mono như số serial thật.
export function AssetTag({ children, className, tone = "slate" }: AssetTagProps) {
  const toneClass =
    tone === "indigo"
      ? "border-indigo-300 bg-indigo-50 text-indigo-800"
      : "border-slate-200 bg-white text-slate-700";

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-tag border py-1 pl-4 pr-2.5 font-mono text-xs font-medium",
        toneClass,
        className
      )}
    >
      <span
        className={cn(
          "absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border",
          tone === "indigo" ? "border-indigo-400 bg-indigo-100" : "border-slate-300 bg-canvas"
        )}
      />
      {children}
    </span>
  );
}
