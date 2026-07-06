"use client";

import { useEffect, useState } from "react";
import { EditorSkeleton } from "@/components/ui/Skeleton";
import { Button, Card, Field, TextArea } from "./ui";
import { useAdminApi } from "./useAdminApi";
import type { MessagesData, SiteData } from "@/lib/types";

const FIELDS: Array<{ key: keyof MessagesData; label: string; help: string; sample?: boolean }> = [
  {
    key: "orderPrefix",
    label: "Order — opening line",
    help: "Shown before the itemised order list",
    sample: true,
  },
  {
    key: "orderSuffix",
    label: "Order — closing line",
    help: "Shown after the total, e.g. payment note",
    sample: true,
  },
  { key: "generalInquiry", label: "General inquiry", help: "Floating WhatsApp button message" },
  { key: "supportComplaint", label: "Support — complaint", help: "Pre-filled complaint message" },
  { key: "supportTrack", label: "Support — track order", help: "Pre-filled tracking message" },
  { key: "supportFeedback", label: "Support — feedback", help: "Pre-filled feedback message" },
];

const SAMPLE_ORDER =
  "1. Aloo Paratha × 2 = ₹160\n2. Paneer Butter Masala × 1 = ₹110\n\n*Total: ₹270*";

function WhatsAppBubble({ text }: { text: string }) {
  return (
    <div className="rounded-xl rounded-tl-sm bg-[#dcf8c6] px-3 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap text-neutral-800 shadow-sm">
      {text}
    </div>
  );
}

export function MessagesTab({ token }: { token: string }) {
  void token; // auth handled by useAdminApi
  const api = useAdminApi();
  const [messages, setMessages] = useState<MessagesData | null>(null);
  const [site, setSite] = useState<SiteData | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/content/messages").then((r) => r.json()),
      fetch("/api/content/site").then((r) => r.json()),
    ])
      .then(([m, s]) => {
        setMessages(m);
        setSite(s);
      })
      .catch(() => setError("Failed to load templates"));
  }, []);

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!messages || !site) return <EditorSkeleton />;

  // Live values, exactly as lib/whatsapp.ts substitutes them at checkout
  const render = (template: string) =>
    template
      .replace(/\{\{brandName\}\}/g, site.brandName)
      .replace(/\{\{siteUrl\}\}/g, site.siteUrl);

  function setTemplate(key: keyof MessagesData, value: string) {
    setMessages((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    setStatus("Saving…");
    try {
      await api("/api/content/messages", { method: "PUT", body: messages });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus((e as Error).message);
    }
    setTimeout(() => setStatus(""), 2500);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Card>
        <p className="text-[13px] leading-relaxed text-neutral-600">
          Each template supports two variables:{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px]">
            {"{{brandName}}"}
          </code>{" "}
          and{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px]">
            {"{{siteUrl}}"}
          </code>
          . The green bubble under each field shows the message exactly as the customer&apos;s
          WhatsApp will open it, using your live brand name and site URL.
        </p>
      </Card>

      {FIELDS.map(({ key, label, help, sample }) => (
        <Card key={key} className="flex flex-col gap-3">
          <Field label={label} hint={help}>
            <TextArea
              value={messages[key]}
              onChange={(e) => setTemplate(key, e.target.value)}
              rows={3}
              className="font-mono !text-[12.5px]"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Preview
            </p>
            <WhatsAppBubble
              text={
                sample
                  ? key === "orderPrefix"
                    ? render(messages.orderPrefix) + SAMPLE_ORDER
                    : SAMPLE_ORDER + render(messages.orderSuffix)
                  : render(messages[key])
              }
            />
          </div>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={save}>Save messages</Button>
        {status && <span className="text-[13px] font-semibold text-neutral-600">{status}</span>}
      </div>
    </div>
  );
}
