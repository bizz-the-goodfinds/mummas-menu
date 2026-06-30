import type { Metadata } from "next";
import Image from "next/image";
import { getSiteData } from "@/lib/data";
import { FssaiBadge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `Trust & Certifications — ${site.brandName}`,
    description: `${site.brandName} is an FSSAI-licensed cloud kitchen. View our food safety certification, licence details, and hygiene standards.`,
    alternates: { canonical: "/trust" },
  };
}

export default async function TrustPage() {
  const site = await getSiteData();

  const certJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.brandName,
    url: site.siteUrl,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "License",
      name: "FSSAI Food Safety Licence",
      identifier: site.fssai.licenceNumber,
      validFrom: site.fssai.issueDate,
      validUntil: site.fssai.expiryDate,
    },
  };

  return (
    <section className="py-16 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(certJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeader
          title="Trust & Certifications"
          subtitle={`${site.brandName} is committed to food safety, hygiene, and transparency in everything we cook.`}
          centered
          className="mb-12"
        />

        <div className="glass-strong mb-10 grid items-center gap-8 rounded-3xl p-8 md:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col items-center gap-4">
            {site.fssai.certImage ? (
              <div className="relative aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl border border-green-200 shadow-md">
                <Image
                  src={site.fssai.certImage}
                  alt={`FSSAI certificate for ${site.brandName}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full max-w-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-green-300 bg-green-50 p-6 text-center">
                <FssaiBadge />
                <p className="text-[12px] text-green-700">Certificate image will be added soon</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-heading mb-4 text-[22px] font-bold">FSSAI Food Safety Licence</h2>
            <dl className="flex flex-col gap-3 text-[14px]">
              <div className="flex justify-between gap-4 border-b border-neutral-200 pb-2">
                <dt className="text-neutral-500">Licence Number</dt>
                <dd className="font-semibold">{site.fssai.licenceNumber}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-neutral-200 pb-2">
                <dt className="text-neutral-500">Issued On</dt>
                <dd className="font-semibold">{site.fssai.issueDate}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-neutral-200 pb-2">
                <dt className="text-neutral-500">Valid Until</dt>
                <dd className="font-semibold">{site.fssai.expiryDate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Licensed Entity</dt>
                <dd className="font-semibold">{site.brandName}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TrustPoint
            icon="🧼"
            title="Strict Hygiene"
            desc="Sanitised kitchen, gloves & hairnets at every step."
          />
          <TrustPoint
            icon="🌿"
            title="Zero Artificial Colours"
            desc="Only natural ingredients — no shortcuts, ever."
          />
          <TrustPoint
            icon="🔥"
            title="Cooked Fresh Daily"
            desc="Nothing pre-made, nothing frozen for days."
          />
        </div>
      </div>
    </section>
  );
}

function TrustPoint({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <span className="mb-2 block text-[28px]" aria-hidden>
        {icon}
      </span>
      <h3 className="font-heading mb-1 text-[14px] font-bold">{title}</h3>
      <p className="text-[12px] text-neutral-600">{desc}</p>
    </div>
  );
}
