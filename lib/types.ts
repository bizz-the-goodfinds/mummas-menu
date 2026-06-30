export interface MenuItem {
  id: string;
  name: string;
  price: number;
  veg: boolean;
  description: string;
  image: string;
}

export interface MenuCategory {
  slug: string;
  name: string;
  emoji: string;
  items: MenuItem[];
}

export interface MenuData {
  categories: MenuCategory[];
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface SiteData {
  brandName: string;
  shortName: string;
  tagline: string;
  description: string;
  siteUrl: string;
  logo: string;
  ogImage: string;
  whatsappNumber: string;
  phoneDisplay: string;
  email: string;
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
  };
  hours: string;
  priceRange: string;
  social: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  about: {
    heading: string;
    paragraphs: string[];
    highlights: string[];
  };
  faq: FaqEntry[];
}

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
}
