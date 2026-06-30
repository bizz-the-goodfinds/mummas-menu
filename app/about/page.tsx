import type { Metadata } from "next";
import About from "@/components/About";
import { getSiteData } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: `About Us — ${site.brandName}`,
    description: `Learn about ${site.brandName}, a home-style cloud kitchen serving freshly made Indian comfort food with no artificial colours.`,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const site = await getSiteData();
  return (
    <div className="pt-8">
      <About site={site} />
    </div>
  );
}
