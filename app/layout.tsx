import type { Metadata } from "next";
import { Baloo_2, Poppins } from "next/font/google";
import "./globals.css";
import { getSiteData, getMenuData } from "@/lib/data";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Toast from "@/components/Toast";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { BottomNav } from "@/components/ui/BottomNav";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: `${site.brandName} — FSSAI Approved Homestyle Cloud Kitchen | Order on WhatsApp`,
      template: `%s | ${site.brandName}`,
    },
    description: site.description,
    keywords: [
      "cloud kitchen",
      "FSSAI approved kitchen",
      "home food delivery",
      "paratha order online",
      "WhatsApp food order",
      site.brandName,
      "homestyle food",
      "Indian tiffin",
      "Gujarati food",
      "Maharashtrian farali",
      site.address.locality,
    ],
    applicationName: site.brandName,
    authors: [{ name: site.brandName }],
    creator: site.brandName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: site.siteUrl,
      siteName: site.brandName,
      title: `${site.brandName} — FSSAI Approved Homestyle Cloud Kitchen`,
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
    icons: { icon: "/favicon.ico" },
    manifest: "/manifest.webmanifest",
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [site, menu] = await Promise.all([getSiteData(), getMenuData()]);

  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
    name: site.brandName,
    description: site.description,
    url: site.siteUrl,
    image: `${site.siteUrl}${site.ogImage}`,
    logo: `${site.siteUrl}${site.logo}`,
    telephone: site.phoneDisplay,
    email: site.email,
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
    openingHoursSpecification: site.businessHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${h.day}`,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [site.social.instagram, site.social.facebook, site.social.whatsapp].filter(Boolean),
    acceptsReservations: false,
    hasMenu: `${site.siteUrl}/menu`,
    areaServed: site.deliveryArea,
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
      <body className="relative flex min-h-full flex-col overflow-x-hidden pb-[56px] font-sans md:pb-0">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {/* Warm pinkish bleed top-left */}
          <div className="absolute -top-[80px] -left-[80px] h-[500px] w-[500px] rounded-full bg-[#ffd6d6] opacity-50 blur-[90px]" />
          {/* Soft rose right */}
          <div className="absolute top-[20%] -right-[100px] h-[420px] w-[420px] rounded-full bg-[#ffeded] opacity-60 blur-[80px]" />
          {/* Light ochre bottom center */}
          <div className="absolute bottom-0 left-[25%] h-[340px] w-[340px] rounded-full bg-[#fff3e0] opacity-40 blur-[70px]" />
          {/* Subtle red accent bottom-right */}
          <div className="absolute -right-[60px] -bottom-[60px] h-[280px] w-[280px] rounded-full bg-[#d32f2f] opacity-[0.06] blur-[60px]" />
        </div>
        <CartProvider>
          <ServiceWorkerRegister />
          <Header brandName={site.brandName} />
          <main className="flex-1">{children}</main>
          <Footer site={site} />
          <CartDrawer site={site} menu={menu} />
          <WhatsAppFloat site={site} />
          <Toast />
          <BottomNav />
          <InstallPrompt />
        </CartProvider>
      </body>
    </html>
  );
}
