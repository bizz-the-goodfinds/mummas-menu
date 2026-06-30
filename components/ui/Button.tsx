import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-red text-white shadow-[0_10px_24px_rgba(211,47,47,0.35)] hover:shadow-[0_14px_28px_rgba(211,47,47,0.45)] hover:-translate-y-0.5",
  secondary: "glass-strong text-brand-red hover:-translate-y-0.5",
  ghost: "text-neutral-700 hover:text-brand-red hover:bg-brand-pink/50",
  whatsapp:
    "bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)] hover:shadow-[0_14px_28px_rgba(37,211,102,0.45)] hover:-translate-y-0.5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px] gap-1.5",
  md: "px-6 py-3 text-[14px] gap-2",
  lg: "px-7 py-3.5 text-[15px] gap-2",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      {...props}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </a>
  );
}
