import type { Metadata } from "next";
import { getSiteData } from "@/lib/data";
import { AskAiButtons } from "@/components/AskAiButtons";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  const description = `Ask ChatGPT, Claude, or Gemini anything about ${site.brandName} — menu, prices, delivery, timings. The AI reads our live data and answers instantly.`;
  return {
    title: `Ask AI About ${site.brandName}`,
    description,
    alternates: { canonical: "/ask-ai" },
    openGraph: {
      title: `Ask AI About ${site.brandName}`,
      description,
      url: `${site.siteUrl}/ask-ai`,
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.brandName }],
    },
  };
}

export default async function AskAiPage() {
  const site = await getSiteData();

  // The pre-filled prompt points the assistant at our live llms.txt feed so
  // its answers come from our own data, not stale training knowledge.
  const prompt =
    `I'm a customer of ${site.brandName} (${site.siteUrl}), a 100% pure-veg, ` +
    `FSSAI-approved homestyle cloud kitchen in ${site.address.locality}. ` +
    `Please read ${site.siteUrl}/llms.txt for their live menu, prices, hours, ` +
    `and ordering info, then help me with my questions about it.`;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 text-center">
          <span className="text-brand-red mb-2 inline-block text-[13px] font-semibold tracking-wider uppercase">
            New · AI Assistant
          </span>
          <h1 className="font-heading mb-3 text-[30px] leading-tight md:text-[38px]">
            Ask AI about {site.brandName}
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-neutral-600">
            Pick your favourite AI assistant — it opens with everything about our kitchen already
            loaded. Then just ask: <em>&ldquo;What&apos;s good for a light dinner?&rdquo;</em>,{" "}
            <em>&ldquo;Do they have farali food?&rdquo;</em>, or{" "}
            <em>&ldquo;How do I order for tomorrow morning?&rdquo;</em>
          </p>
        </div>

        <AskAiButtons prompt={prompt} />

        <div className="glass mt-10 rounded-2xl p-5 text-center">
          <p className="text-[13px] leading-relaxed text-neutral-600">
            The assistant reads our live menu and info from{" "}
            <a href="/llms.txt" className="text-brand-red font-semibold hover:underline">
              {site.siteUrl.replace(/^https?:\/\//, "")}/llms.txt
            </a>{" "}
            — so prices, dishes, and timings in its answers are always current. For orders, it will
            point you back to our WhatsApp checkout.
          </p>
        </div>
      </div>
    </section>
  );
}
