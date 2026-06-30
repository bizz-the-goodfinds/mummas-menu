interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      <h2 className="font-heading text-[26px] leading-tight font-bold md:text-[32px]">{title}</h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
