"use client";

import { useEffect, useState } from "react";
import type { MessagesData } from "@/lib/types";

const FIELDS: Array<{ key: keyof MessagesData; label: string; help: string }> = [
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

const SAMPLE_BRAND = "Mumma's Menu";
const SAMPLE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://mummas-menu.vercel.app";

function preview(template: string): string {
  return template
    .replace(/\{\{brandName\}\}/g, SAMPLE_BRAND)
    .replace(/\{\{siteUrl\}\}/g, SAMPLE_URL);
}

export function MessagesTab({ token }: { token: string }) {
  const [messages, setMessages] = useState<MessagesData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/messages")
      .then((r) => r.json())
      .then(setMessages);
  }, []);

  if (!messages) return <p className="text-sm text-neutral-500">Loading message templates…</p>;

  function setTemplate(key: keyof MessagesData, value: string) {
    setMessages((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!messages) return;
    setStatus("Saving…");
    const res = await fetch("/api/content/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(messages),
    });
    setStatus(res.ok ? "Saved ✓" : "Save failed");
    setTimeout(() => setStatus(""), 2500);
  }

  const previewOrder =
    preview(messages.orderPrefix) +
    `1. Aloo Paratha × 2 = ₹160\n2. Paneer Butter Masala × 1 = ₹110\n\n*Total: ₹270*` +
    preview(messages.orderSuffix);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="glass flex flex-col gap-4 rounded-2xl p-6">
        <div>
          <h2 className="font-heading text-lg font-bold">WhatsApp Message Templates</h2>
          <p className="mt-1 text-[12px] text-neutral-500">
            Use{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[11px]">
              {"{{brandName}}"}
            </code>{" "}
            and{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[11px]">
              {"{{siteUrl}}"}
            </code>{" "}
            as variables — they are replaced automatically with the live values.
          </p>
        </div>

        {FIELDS.map(({ key, label, help }) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{label}</span>
            <span className="text-xs text-neutral-500">{help}</span>
            <textarea
              value={messages[key]}
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
          {preview(messages.generalInquiry)}
        </div>
      </div>
    </div>
  );
}
