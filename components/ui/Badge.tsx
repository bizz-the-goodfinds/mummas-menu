const TAG_STYLES: Record<string, string> = {
  bestseller: "bg-amber-100 text-amber-700 border border-amber-200",
  "most-loved": "bg-pink-100 text-pink-700 border border-pink-200",
  "mummas-sp": "bg-orange-100 text-orange-700 border border-orange-200",
  new: "bg-blue-100 text-blue-700 border border-blue-200",
  spicy: "bg-red-100 text-red-700 border border-red-200",
};

const TAG_LABELS: Record<string, string> = {
  bestseller: "⭐ Bestseller",
  "most-loved": "💕 Most Loved",
  "mummas-sp": "❤️ Mumma's Sp.",
  new: "✨ New",
  spicy: "🌶 Spicy",
};

export function VegBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-green-600 px-1 py-0.5 text-[11px] leading-none font-semibold text-green-700">
      <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
      VEG
    </span>
  );
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  "coming-soon": {
    label: "🔜 Coming Soon",
    className: "bg-sky-100 text-sky-700 border border-sky-200",
  },
  "out-of-stock": {
    label: "⏳ Out of Stock",
    className: "bg-neutral-200 text-neutral-600 border border-neutral-300",
  },
  "festive-special": {
    label: "🪔 Festive Special",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
};

/** Availability badge — renders nothing for plain "available" items. */
export function StatusBadge({ status }: { status?: string }) {
  const cfg = status ? STATUS_BADGES[status] : undefined;
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] ?? "bg-neutral-100 text-neutral-600 border border-neutral-200";
  const label = TAG_LABELS[tag] ?? tag;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

export function FssaiBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        FSSAI Approved
      </span>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="text-[11px] leading-none font-bold text-green-800">FSSAI Approved</p>
        <p className="mt-0.5 text-[10px] leading-tight text-green-600">Licensed Cloud Kitchen</p>
      </div>
    </div>
  );
}
