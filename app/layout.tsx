import type { Metadata } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import "./globals.css";
import { getSiteData } from "@/lib/data";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Toast from "@/components/Toast";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: `${site.brandName} — Homestyle Cloud Kitchen | Order on WhatsApp`,
      template: `%s | ${site.brandName}`,
    },
    description: site.description,
    keywords: [
      "cloud kitchen",
      "home food delivery",
      "paratha order online",
      "WhatsApp food order",
      site.brandName,
      "homestyle food",
      "Indian tiffin",
    ],
    applicationName: site.brandName,
    authors: [{ name: site.brandName }],
    creator: site.brandName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: site.siteUrl,
      siteName: site.brandName,
      title: `${site.brandName} — Homestyle Cloud Kitchen`,
      description: site.description,
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.brandName }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.brandName} — Homestyle Cloud Kitchen`,
      description: site.description,
      images: [site.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSiteData();

  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.brandName,
    description: site.description,
    url: site.siteUrl,
    image: `${site.siteUrl}${site.ogImage}`,
    logo: `${site.siteUrl}${site.logo}`,
    telephone: site.phoneDisplay,
    priceRange: site.priceRange,
    servesCuisine: ["Indian", "Gujarati", "Maharashtrian", "Vegetarian"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street || undefined,
      addressLocality: site.address.locality,
      addressRegion: site.address.region || undefined,
      postalCode: site.address.postalCode || undefined,
      addressCountry: site.address.country,
    },
    sameAs: [site.social.instagram, site.social.facebook, site.social.whatsapp].filter(Boolean),
    acceptsReservations: false,
    hasMenu: `${site.siteUrl}/#menu`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <html lang="en" className={`${poppins.variable} ${baloo.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans relative overflow-x-hidden">
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute w-[420px] h-[420px] rounded-full bg-brand-red opacity-45 blur-[60px] -top-[120px] -left-[100px]" />
          <div className="absolute w-[360px] h-[360px] rounded-full bg-brand-pink opacity-45 blur-[60px] top-[30%] -right-[120px]" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-grey-dark opacity-25 blur-[60px] -bottom-[100px] left-[30%]" />
        </div>
        <CartProvider>
          <ServiceWorkerRegister />
          <Header brandName={site.brandName} />
          <main className="flex-1">{children}</main>
          <Footer site={site} />
          <CartDrawer brandName={site.brandName} whatsappNumber={site.whatsappNumber} siteUrl={site.siteUrl} />
          <WhatsAppFloat site={site} />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
