import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, LogIn, ShieldCheck, Workflow, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

const FEATURES = [
  { icon: PackageCheck, text: "Theo dõi tài sản theo thời gian thực, từ kho đến người dùng" },
  { icon: Workflow, text: "Quy trình phê duyệt theo từng phòng ban, minh bạch từng bước" },
  { icon: ShieldCheck, text: "Nhật ký đầy đủ cho mọi lượt cấp phát và thu hồi" },
];

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      const user = await login(email, password);
      const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;
      const redirectTo = from || (user?.role === "ADMIN" ? "/dashboard" : "/assets");
      navigate(redirectTo, { replace: true });
      toast.success("Đăng nhập thành công");
    } catch (err) {
      toast.error((err as { message?: string })?.message || "Đăng nhập thất bại");
    }
  });

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Panel thương hiệu — một khối màu đặc, gọn gàng, không hoạ tiết
          trang trí, đúng tinh thần trang đăng nhập của các sản phẩm SaaS
          lớn (Stripe, Linear, Vercel...). */}
      <div className="relative hidden w-[46%] flex-col justify-between bg-slate-900 px-14 py-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Box size={16} strokeWidth={2.5} />
          </div>
          <p className="text-lg font-semibold tracking-tight">AssetHub</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Hệ thống quản lý tài sản
          </p>
          <h1 className="max-w-md text-4xl font-semibold leading-[1.2] tracking-tight">
            Quản lý tài sản, quy trình duyệt và bàn giao trong một nơi.
          </h1>

          <ul className="mt-9 flex flex-col gap-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <f.icon size={13} className="text-indigo-300" />
                </div>
                <span className="text-sm leading-relaxed text-slate-300">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">© {new Date().getFullYear()} AssetHub</p>
      </div>

      {/* Form đăng nhập */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-[54%]">
        <div className="w-full max-w-[380px]">
          <div className="mb-9 flex flex-col items-center lg:items-start">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white lg:hidden">
              <Box size={18} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Đăng nhập</h2>
            <p className="mt-1.5 text-sm text-slate-500">Nhập thông tin tài khoản để tiếp tục.</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label="Email"
              type="email"
              placeholder="ban@congty.com"
              autoFocus
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" size="lg" className="mt-2 w-full" loading={isSubmitting}>
              <LogIn size={16} />
              Đăng nhập
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 lg:text-left">
            Quên mật khẩu? Liên hệ quản trị viên hệ thống của bạn.
          </p>
        </div>
      </div>
    </div>
  );
}
