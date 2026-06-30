"use client";

import { useEffect, useState } from "react";
import type { MessageTemplates, SiteData } from "@/lib/types";

const FIELDS: Array<{ key: keyof MessageTemplates; label: string; help: string }> = [
  { key: "orderPrefix", label: "Order Prefix", help: "Shown before the itemised order list" },
  { key: "orderSuffix", label: "Order Suffix", help: "Shown after the total, e.g. payment note" },
  { key: "generalInquiry", label: "General Inquiry", help: "Floating WhatsApp button message" },
  { key: "supportComplaint", label: "Support — Complaint", help: "Pre-filled complaint message" },
  {
    key: "supportTrack",
    label: "Support — Track Order",
    help: "Pre-filled order-tracking message",
  },
  { key: "supportFeedback", label: "Support — Feedback", help: "Pre-filled feedback message" },
];

export function MessagesTab({ token }: { token: string }) {
  const [site, setSite] = useState<SiteData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/site")
      .then((r) => r.json())
      .then(setSite);
  }, []);

  if (!site) return <p className="text-sm text-neutral-500">Loading message templates…</p>;

  function setTemplate(key: keyof MessageTemplates, value: string) {
    setSite((prev) => (prev ? { ...prev, messages: { ...prev.messages, [key]: value } } : prev));
  }

  async function save() {
    if (!site) return;
    setStatus("Saving…");
    const res = await fetch("/api/content/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(site),
    });
    setStatus(res.ok ? "Saved ✓" : "Save failed");
    setTimeout(() => setStatus(""), 2500);
  }

  const previewOrder = `${site.messages.orderPrefix}1. Aloo Paratha × 2 = ₹160\n2. Paneer Butter Masala × 1 = ₹110\n\n*Total: ₹270*${site.messages.orderSuffix}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="glass flex flex-col gap-4 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-bold">WhatsApp Message Templates</h2>
        {FIELDS.map(({ key, label, help }) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{label}</span>
            <span className="text-xs text-neutral-500">{help}</span>
            <textarea
              value={site.messages[key]}
              onChange={(e) => setTemplate(key, e.target.value)}
              className="rounded-lg border px-3 py-2 font-mono text-[13px]"
              rows={3}
            />
          </label>
        ))}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={save}
            className="bg-brand-red rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            Save Messages
          </button>
          {status && <span className="text-sm text-neutral-600">{status}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-bold text-neutral-600">
          Live Preview — Order Checkout Message
        </h3>
        <div className="rounded-2xl bg-[#dcf8c6] p-4 text-[13px] whitespace-pre-wrap text-neutral-800 shadow-inner">
          {previewOrder}
        </div>
        <h3 className="font-heading mt-2 text-sm font-bold text-neutral-600">
          Live Preview — General Inquiry
        </h3>
        <div className="rounded-2xl bg-[#dcf8c6] p-4 text-[13px] whitespace-pre-wrap text-neutral-800 shadow-inner">
          {site.messages.generalInquiry}
        </div>
      </div>
    </div>
  );
}
