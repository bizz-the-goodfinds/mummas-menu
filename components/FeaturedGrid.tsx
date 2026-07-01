"use client";

import { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/types";
import { ItemCard } from "@/components/ui/ItemCard";

type FeaturedItem = MenuItem & { categoryEmoji: string };

interface FeaturedGridProps {
  /** Fixed tag-based picks (bestseller / mumma's sp.), always shown. */
  taggedItems: FeaturedItem[];
  /** Full pool of untagged items to draw random picks from. */
  untaggedPool: FeaturedItem[];
  /** How many random untagged items to mix in. */
  untaggedCount: number;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function FeaturedGrid({ taggedItems, untaggedPool, untaggedCount }: FeaturedGridProps) {
  // Matches the server-rendered markup so hydration doesn't mismatch; the
  // real randomization happens client-side after mount, on every page load.
  const [items, setItems] = useState<FeaturedItem[]>([
    ...taggedItems,
    ...untaggedPool.slice(0, untaggedCount),
  ]);

  useEffect(() => {
    // Randomizing must happen post-mount (client-only Math.random) to avoid
    // an SSR/CSR hydration mismatch, so this can't be computed during render.
    const randomUntagged = shuffle(untaggedPool).slice(0, untaggedCount);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(shuffle([...taggedItems, ...randomUntagged]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          categoryEmoji={item.categoryEmoji}
          variant="horizontal"
        />
      ))}
    </div>
  );
}
