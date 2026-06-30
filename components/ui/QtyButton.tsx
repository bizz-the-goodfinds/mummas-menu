"use client";

interface QtyButtonProps {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  itemName: string;
  size?: "sm" | "md";
}

export function QtyButton({ qty, onAdd, onRemove, itemName, size = "md" }: QtyButtonProps) {
  const btnCls = size === "sm" ? "w-[26px] h-[26px] text-sm" : "w-[32px] h-[32px] text-base";

  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        aria-label={`Add ${itemName}`}
        className="bg-brand-red rounded-full px-4 py-1.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(211,47,47,0.3)] transition-transform hover:-translate-y-0.5"
      >
        ADD
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onRemove}
        aria-label={`Remove one ${itemName}`}
        className={`${btnCls} bg-brand-pink text-brand-red flex items-center justify-center rounded-full font-bold transition-colors hover:bg-red-100`}
      >
        −
      </button>
      <span className="min-w-[20px] text-center text-sm font-bold">{qty}</span>
      <button
        onClick={onAdd}
        aria-label={`Add one more ${itemName}`}
        className={`${btnCls} bg-brand-red flex items-center justify-center rounded-full font-bold text-white transition-colors hover:bg-red-700`}
      >
        +
      </button>
    </div>
  );
}
