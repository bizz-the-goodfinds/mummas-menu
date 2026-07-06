"use client";

/**
 * Complete editor for the site document — every field of SiteData is
 * editable here: brand, contact, address, social, about, FAQs,
 * testimonials, FSSAI, business hours, support, and retention.
 */

import { useEffect, useState } from "react";
import { EditorSkeleton } from "@/components/ui/Skeleton";
import { Button, Card, Field, TextArea, TextInput } from "./ui";
import { useAdminApi } from "./useAdminApi";
import type { SiteData } from "@/lib/types";

export function SiteEditor({ token }: { token: string }) {
  void token; // auth handled by useAdminApi
  const api = useAdminApi();
  const [site, setSite] = useState<SiteData | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content/site")
      .then((r) => r.json())
      .then(setSite);
  }, []);

  if (!site) return <EditorSkeleton />;

  // Immutable deep-update helper: mutate a clone in `fn`, then set state.
  function update(fn: (draft: SiteData) => void) {
    setSite((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  async function save() {
    setStatus("Saving…");
    try {
      await api("/api/content/site", { method: "PUT", body: site });
      setStatus("Saved ✓");
    } catch (e) {
      setStatus((e as Error).message);
    }
    setTimeout(() => setStatus(""), 2500);
  }

  const text = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { multiline?: boolean; hint?: string },
  ) => (
    <Field label={label} hint={opts?.hint}>
      {opts?.multiline ? (
        <TextArea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">Brand & Identity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("Brand name", site.brandName, (v) => update((d) => void (d.brandName = v)))}
          {text("Short name (PWA)", site.shortName, (v) => update((d) => void (d.shortName = v)))}
        </div>
        {text("Tagline", site.tagline, (v) => update((d) => void (d.tagline = v)))}
        {text("Description", site.description, (v) => update((d) => void (d.description = v)), {
          multiline: true,
          hint: "Used in search results, social shares, and AI answers",
        })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("Site URL", site.siteUrl, (v) => update((d) => void (d.siteUrl = v)))}
          {text("Price range", site.priceRange, (v) => update((d) => void (d.priceRange = v)), {
            hint: "e.g. ₹40–₹160",
          })}
          {text("Logo path/URL", site.logo, (v) => update((d) => void (d.logo = v)))}
          {text("OG image path/URL", site.ogImage, (v) => update((d) => void (d.ogImage = v)))}
        </div>
        {text("Hours (one-line display)", site.hours, (v) => update((d) => void (d.hours = v)), {
          hint: "Shown in the footer, e.g. Mon–Sun 9am–9pm",
        })}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">Contact & Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("WhatsApp number (digits + country code)", site.whatsappNumber, (v) =>
            update((d) => void (d.whatsappNumber = v)),
          )}
          {text("Phone display", site.phoneDisplay, (v) =>
            update((d) => void (d.phoneDisplay = v)),
          )}
          {text("Email", site.email, (v) => update((d) => void (d.email = v)))}
          {text("Street", site.address.street, (v) => update((d) => void (d.address.street = v)))}
          {text("Locality / City", site.address.locality, (v) =>
            update((d) => void (d.address.locality = v)),
          )}
          {text("Region / State", site.address.region, (v) =>
            update((d) => void (d.address.region = v)),
          )}
          {text("Postal code", site.address.postalCode, (v) =>
            update((d) => void (d.address.postalCode = v)),
          )}
          {text("Country", site.address.country, (v) =>
            update((d) => void (d.address.country = v)),
          )}
        </div>
        {text("Delivery area", site.deliveryArea, (v) => update((d) => void (d.deliveryArea = v)))}
        {text(
          "Delivery note (cart)",
          site.deliveryNote ?? "",
          (v) => update((d) => void (d.deliveryNote = v)),
          { multiline: true, hint: "The outlined note under the cart subtotal" },
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">Social Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("Instagram URL", site.social.instagram, (v) =>
            update((d) => void (d.social.instagram = v)),
          )}
          {text("Facebook URL", site.social.facebook, (v) =>
            update((d) => void (d.social.facebook = v)),
          )}
          {text("WhatsApp link", site.social.whatsapp, (v) =>
            update((d) => void (d.social.whatsapp = v)),
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">About Section</h2>
        {text("Heading", site.about.heading, (v) => update((d) => void (d.about.heading = v)))}
        {text(
          "Story (short)",
          site.about.story ?? "",
          (v) => update((d) => void (d.about.story = v)),
          {
            multiline: true,
          },
        )}
        <Field label="Paragraphs">
          <div className="flex flex-col gap-2">
            {site.about.paragraphs.map((p, i) => (
              <div key={i} className="flex gap-2">
                <TextArea
                  value={p}
                  rows={2}
                  onChange={(e) => update((d) => void (d.about.paragraphs[i] = e.target.value))}
                />
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => update((d) => void d.about.paragraphs.splice(i, 1))}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => update((d) => void d.about.paragraphs.push(""))}
            >
              + Add paragraph
            </Button>
          </div>
        </Field>
        <Field label="Highlights" hint="Short bullet points shown as chips">
          <div className="flex flex-col gap-2">
            {site.about.highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <TextInput
                  value={h}
                  onChange={(e) => update((d) => void (d.about.highlights[i] = e.target.value))}
                />
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => update((d) => void d.about.highlights.splice(i, 1))}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => update((d) => void d.about.highlights.push(""))}
            >
              + Add highlight
            </Button>
          </div>
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">FAQs</h2>
        <p className="-mt-2 text-[12px] text-neutral-500">
          Shown on the home page and fed to Google (FAQ rich results) and AI assistants — the single
          most useful thing to keep updated for answer engines.
        </p>
        {site.faq.map((f, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-neutral-200/70 p-3">
            <TextInput
              value={f.question}
              placeholder="Question"
              onChange={(e) => update((d) => void (d.faq[i].question = e.target.value))}
            />
            <TextArea
              value={f.answer}
              rows={2}
              placeholder="Answer"
              onChange={(e) => update((d) => void (d.faq[i].answer = e.target.value))}
            />
            <Button
              type="button"
              variant="danger"
              className="self-end"
              onClick={() => update((d) => void d.faq.splice(i, 1))}
            >
              Remove FAQ
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => update((d) => void d.faq.push({ question: "", answer: "" }))}
        >
          + Add FAQ
        </Button>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">Testimonials</h2>
        {(site.testimonials ?? []).map((t, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-neutral-200/70 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <TextInput
                value={t.name}
                placeholder="Customer name"
                onChange={(e) => update((d) => void (d.testimonials![i].name = e.target.value))}
              />
              <TextInput
                value={t.location}
                placeholder="Location, e.g. Alkapuri"
                onChange={(e) => update((d) => void (d.testimonials![i].location = e.target.value))}
              />
            </div>
            <TextArea
              value={t.text}
              rows={2}
              placeholder="What they said"
              onChange={(e) => update((d) => void (d.testimonials![i].text = e.target.value))}
            />
            <div className="flex items-center gap-3">
              <Field label="Rating (1–5)">
                <TextInput
                  type="number"
                  min={1}
                  max={5}
                  value={t.rating}
                  onChange={(e) =>
                    update(
                      (d) =>
                        void (d.testimonials![i].rating = Math.max(
                          1,
                          Math.min(5, Number(e.target.value) || 5),
                        )),
                    )
                  }
                  className="!w-24"
                />
              </Field>
              <Field label="Avatar emoji">
                <TextInput
                  value={t.avatarEmoji ?? ""}
                  placeholder="😋"
                  maxLength={4}
                  onChange={(e) =>
                    update((d) => void (d.testimonials![i].avatarEmoji = e.target.value))
                  }
                  className="!w-24"
                />
              </Field>
              <Button
                type="button"
                variant="danger"
                className="mt-5 ml-auto"
                onClick={() => update((d) => void d.testimonials!.splice(i, 1))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            update((d) => {
              d.testimonials = d.testimonials ?? [];
              d.testimonials.push({ name: "", text: "", rating: 5, location: "" });
            })
          }
        >
          + Add testimonial
        </Button>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">FSSAI Certification</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("Licence number", site.fssai.licenceNumber, (v) =>
            update((d) => void (d.fssai.licenceNumber = v)),
          )}
          {text("Issue date", site.fssai.issueDate, (v) =>
            update((d) => void (d.fssai.issueDate = v)),
          )}
          {text("Expiry date", site.fssai.expiryDate, (v) =>
            update((d) => void (d.fssai.expiryDate = v)),
          )}
          {text("Certificate image URL", site.fssai.certImage, (v) =>
            update((d) => void (d.fssai.certImage = v)),
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-heading text-[16px] font-bold">Business Hours</h2>
        {site.businessHours.map((h, idx) => (
          <div key={h.day} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 font-medium">{h.day}</span>
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={!h.closed}
                onChange={(e) =>
                  update((d) => void (d.businessHours[idx].closed = !e.target.checked))
                }
                className="accent-brand-red"
              />
              Open
            </label>
            {!h.closed && (
              <>
                <TextInput
                  value={h.open}
                  onChange={(e) => update((d) => void (d.businessHours[idx].open = e.target.value))}
                  className="!w-24"
                  placeholder="09:00"
                />
                <span>–</span>
                <TextInput
                  value={h.close}
                  onChange={(e) =>
                    update((d) => void (d.businessHours[idx].close = e.target.value))
                  }
                  className="!w-24"
                  placeholder="21:00"
                />
              </>
            )}
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-heading text-[16px] font-bold">Support & Retention</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("Support WhatsApp number", site.support.whatsappNumber, (v) =>
            update((d) => void (d.support.whatsappNumber = v)),
          )}
          {text("Support response time", site.support.responseTime, (v) =>
            update((d) => void (d.support.responseTime = v)),
          )}
          {text("Promo text", site.retention.promoText, (v) =>
            update((d) => void (d.retention.promoText = v)),
          )}
          {text("Promo link", site.retention.promoLink, (v) =>
            update((d) => void (d.retention.promoLink = v)),
          )}
        </div>
      </Card>

      <div className="sticky bottom-4 flex items-center gap-3">
        <Button onClick={save}>Save site content</Button>
        {status && (
          <span className="glass rounded-full px-3 py-1 text-[13px] font-semibold text-neutral-700">
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
