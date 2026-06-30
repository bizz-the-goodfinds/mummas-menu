import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

export function Card({ strong = false, className = "", children, ...props }: CardProps) {
  return (
    <div {...props} className={`${strong ? "glass-strong" : "glass"} rounded-2xl ${className}`}>
      {children}
    </div>
  );
}
