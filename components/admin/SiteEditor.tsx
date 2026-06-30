"use client";

import { useEffect, useState } from "react";
import type { SiteData } from "@/lib/types";

export function SiteEditor({ token }: { token: string }) {
  const [site, setSite] = useState<SiteData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/site")
      .then((r) => r.json())
      .then(setSite);
  }, []);

  if (!site) return <p className="text-sm text-neutral-500">Loading site info…</p>;

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

  function field(label: string, value: string, onChange: (v: string) => void, multiline = false) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">{label}</span>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border px-3 py-2"
            rows={3}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        )}
      </label>
    );
  }

  function updateHour(idx: number, patch: Partial<SiteData["businessHours"][number]>) {
    setSite((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      next.businessHours[idx] = { ...next.businessHours[idx], ...patch };
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex max-w-2xl flex-col gap-4 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-bold">Brand & Contact</h2>
        {field("Brand Name", site.brandName, (v) => setSite({ ...site, brandName: v }))}
        {field("Tagline", site.tagline, (v) => setSite({ ...site, tagline: v }))}
        {field("Description", site.description, (v) => setSite({ ...site, description: v }), true)}
        {field("Site URL", site.siteUrl, (v) => setSite({ ...site, siteUrl: v }))}
        {field("WhatsApp Number (digits, with country code)", site.whatsappNumber, (v) =>
          setSite({ ...site, whatsappNumber: v }),
        )}
        {field("Phone Display", site.phoneDisplay, (v) => setSite({ ...site, phoneDisplay: v }))}
        {field("Email", site.email, (v) => setSite({ ...site, email: v }))}
        {field("Street Address", site.address.street, (v) =>
          setSite({ ...site, address: { ...site.address, street: v } }),
        )}
        {field("Locality / City", site.address.locality, (v) =>
          setSite({ ...site, address: { ...site.address, locality: v } }),
        )}
        {field("Region / State", site.address.region, (v) =>
          setSite({ ...site, address: { ...site.address, region: v } }),
        )}
        {field("Postal Code", site.address.postalCode, (v) =>
          setSite({ ...site, address: { ...site.address, postalCode: v } }),
        )}
        {field("Delivery Area", site.deliveryArea, (v) => setSite({ ...site, deliveryArea: v }))}
        {field("Instagram URL", site.social.instagram, (v) =>
          setSite({ ...site, social: { ...site.social, instagram: v } }),
        )}
        {field("Facebook URL", site.social.facebook, (v) =>
          setSite({ ...site, social: { ...site.social, facebook: v } }),
        )}
      </div>

      <div className="glass flex max-w-2xl flex-col gap-4 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-bold">FSSAI Certification</h2>
        {field("Licence Number", site.fssai.licenceNumber, (v) =>
          setSite({ ...site, fssai: { ...site.fssai, licenceNumber: v } }),
        )}
        {field("Issue Date", site.fssai.issueDate, (v) =>
          setSite({ ...site, fssai: { ...site.fssai, issueDate: v } }),
        )}
        {field("Expiry Date", site.fssai.expiryDate, (v) =>
          setSite({ ...site, fssai: { ...site.fssai, expiryDate: v } }),
        )}
        {field("Certificate Image (URL or /images/uploads/…)", site.fssai.certImage, (v) =>
          setSite({ ...site, fssai: { ...site.fssai, certImage: v } }),
        )}
      </div>

      <div className="glass flex max-w-2xl flex-col gap-3 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-bold">Business Hours</h2>
        {site.businessHours.map((h, idx) => (
          <div key={h.day} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 font-medium">{h.day}</span>
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={!h.closed}
                onChange={(e) => updateHour(idx, { closed: !e.target.checked })}
              />
              Open
            </label>
            {!h.closed && (
              <>
                <input
                  value={h.open}
                  onChange={(e) => updateHour(idx, { open: e.target.value })}
                  className="w-24 rounded-lg border px-2 py-1"
                  placeholder="09:00"
                />
                <span>–</span>
                <input
                  value={h.close}
                  onChange={(e) => updateHour(idx, { close: e.target.value })}
                  className="w-24 rounded-lg border px-2 py-1"
                  placeholder="21:00"
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="glass flex max-w-2xl flex-col gap-4 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-bold">Customer Retention</h2>
        {field("Promo Text", site.retention.promoText, (v) =>
          setSite({ ...site, retention: { ...site.retention, promoText: v } }),
        )}
        {field("Promo Link", site.retention.promoLink, (v) =>
          setSite({ ...site, retention: { ...site.retention, promoLink: v } }),
        )}
        {field("Support Response Time", site.support.responseTime, (v) =>
          setSite({ ...site, support: { ...site.support, responseTime: v } }),
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          className="bg-brand-red rounded-full px-6 py-2.5 text-sm font-semibold text-white"
        >
          Save Site Info
        </button>
        {status && <span className="text-sm text-neutral-600">{status}</span>}
      </div>
    </div>
  );
}
