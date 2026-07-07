import { Link } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300">
        <PackageSearch size={26} />
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-indigo-600">404</p>
        <h1 className="text-2xl font-semibold text-slate-900">Không tìm thấy trang</h1>
        <p className="mt-1 text-sm text-slate-500">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      </div>
      <Link to="/">
        <Button>Về trang chủ</Button>
      </Link>
    </div>
  );
}
