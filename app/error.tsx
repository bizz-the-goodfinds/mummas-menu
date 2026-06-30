"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="glass mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] text-[52px]">
        😔
      </div>
      <h1 className="font-heading mb-3 text-[28px] font-bold md:text-[34px]">
        Something went wrong
      </h1>
      <p className="mb-8 max-w-[400px] text-[15px] leading-[1.7] text-neutral-500">
        Our kitchen hit a small snag. Please try again — or order directly on WhatsApp and
        we&apos;ll sort things out for you right away.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="bg-brand-red rounded-full px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(211,47,47,0.3)] transition-transform hover:-translate-y-0.5"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="glass rounded-full px-6 py-3 text-[14px] font-semibold text-neutral-700 transition-transform hover:-translate-y-0.5"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
