"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { useAdminApi } from "@/components/admin/useAdminApi";
import { Button, Card, Field, PageHeader, TextArea, TextInput } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SeoData } from "@/lib/types";

export default function SeoPage() {
  useAdmin();
  const api = useAdminApi();
  const [seo, setSeo] = useState<SeoData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<SeoData>("/api/admin/seo")
      .then(setSeo)
      .catch((e) => setError(e.message));
  }, [api]);

  if (error) return <p className="text-brand-red text-sm">{error}</p>;
  if (!seo) {
    return (
      <>
        <PageHeader title="SEO · AEO · GEO" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </>
    );
  }

  const set = <K extends keyof SeoData>(key: K, v: SeoData[K]) => {
    setSeo((prev) => (prev ? { ...prev, [key]: v } : prev));
    setSaved(false);
  };

  async function save() {
    setSaving(true);
    setError("");
    try {
      await api("/api/admin/seo", { method: "PUT", body: seo });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="SEO · AEO · GEO"
        subtitle="How the site appears in Google, answer boxes, and AI assistants"
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-heading text-[16px] font-bold">Search engines (SEO)</h2>
            <Field
              label="Meta title"
              hint={`${seo.metaTitle.length}/70 — shown as the headline in Google results. Leave blank for the automatic title.`}
            >
              <TextInput
                value={seo.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                maxLength={70}
                placeholder="Mumma's Menu — FSSAI Approved Homestyle Cloud Kitchen | Order on WhatsApp"
              />
            </Field>
            <Field
              label="Meta description"
              hint={`${seo.metaDescription.length}/170 — the grey text under the headline. Leave blank to use the site description.`}
            >
              <TextArea
                value={seo.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                maxLength={170}
                rows={3}
              />
            </Field>
            <Field label="Extra keywords" hint="Comma-separated, added on top of the built-in ones">
              <TextInput
                value={seo.keywords.join(", ")}
                onChange={(e) =>
                  set(
                    "keywords",
                    e.target.value.split(",").map((k) => k.trim()),
                  )
                }
                placeholder="tiffin service vadodara, farali food, gujarati thali"
              />
            </Field>
            <Field
              label="Google Search Console verification"
              hint="Paste only the content value from the meta tag Google gives you (Search Console → Settings → Ownership verification → HTML tag)"
            >
              <TextInput
                value={seo.googleSiteVerification}
                onChange={(e) => set("googleSiteVerification", e.target.value)}
                placeholder="e.g. AbC123xyz…"
              />
            </Field>
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-heading text-[16px] font-bold">
              AI assistants (GEO) & answer engines (AEO)
            </h2>
            <Field
              label="AI summary"
              hint="Opening paragraph of /llms.txt — how ChatGPT, Claude, Gemini & co. should describe the kitchen. Leave blank for the automatic one."
            >
              <TextArea
                value={seo.aiSummary}
                onChange={(e) => set("aiSummary", e.target.value)}
                maxLength={1200}
                rows={5}
                placeholder="Mumma's Menu is a 100% pure-veg, FSSAI-approved home kitchen in Vadodara…"
              />
            </Field>
            <p className="text-[12px] leading-relaxed text-neutral-500">
              The full menu, prices, hours, and FAQs are published automatically at{" "}
              <a href="/llms.txt" target="_blank" className="text-brand-red underline">
                /llms.txt
              </a>{" "}
              — a plain-text feed AI assistants read. Your FAQs (Site Content page) double as
              answer-engine content, so keep them updated.
            </p>
          </Card>

          {error && <p className="text-brand-red text-[13px]">{error}</p>}
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save SEO settings"}
            </Button>
            {saved && <span className="text-[13px] font-semibold text-green-600">Saved ✓</span>}
          </div>
        </div>

        {/* Google result preview */}
        <div className="lg:sticky lg:top-6">
          <p className="mb-2 text-[12px] font-semibold tracking-wider text-neutral-500 uppercase">
            Google preview
          </p>
          <div className="glass rounded-2xl p-4">
            <p className="truncate text-[12px] text-neutral-500">mummas-menu.vercel.app</p>
            <p className="mt-0.5 line-clamp-2 text-[16px] leading-snug text-[#1a0dab]">
              {seo.metaTitle || "Mumma's Menu — FSSAI Approved Homestyle Cloud Kitchen"}
            </p>
            <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-neutral-600">
              {seo.metaDescription || "Automatic description from Site Content will be used here."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
