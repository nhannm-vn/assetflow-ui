import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15 " +
    "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700",
        accent: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        danger: "bg-red-600 text-white shadow-xs hover:bg-red-700",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
        outline:
          "bg-white text-slate-700 border border-slate-200 shadow-xs hover:border-slate-300 hover:bg-slate-50",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-9 px-4 text-sm gap-2",
        lg: "h-11 px-5 text-sm gap-2",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, type = "button", ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
