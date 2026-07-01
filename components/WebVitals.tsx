"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackWebVital } from "@/lib/analytics";

export function WebVitals() {
  useReportWebVitals((metric) => {
    trackWebVital(metric.name, metric.value, metric.id);
  });
  return null;
}
