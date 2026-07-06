/**
 * Availability state shown on the item card. Only "available" and
 * "festive-special" items can be added to the cart; "coming-soon" and
 * "out-of-stock" render with a badge and a disabled add button.
 */
export type ItemStatus = "available" | "coming-soon" | "out-of-stock" | "festive-special";

export const ITEM_STATUSES: ItemStatus[] = [
  "available",
  "coming-soon",
  "out-of-stock",
  "festive-special",
];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  available: "Available",
  "coming-soon": "Coming Soon",
  "out-of-stock": "Out of Stock",
  "festive-special": "Festive Special",
};

/** True when the item can actually be ordered right now. */
export function isOrderable(status: ItemStatus | undefined): boolean {
  return status === undefined || status === "available" || status === "festive-special";
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  tags?: string[];
  /** Hidden from customers entirely when false. Defaults to true when absent. */
  isVisible?: boolean;
  status?: ItemStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface MenuCategory {
  /** DB id — present on data loaded from Supabase, absent in seed JSON. */
  id?: string;
  slug: string;
  name: string;
  emoji: string;
  isVisible?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  items: MenuItem[];
}

export interface MenuData {
  categories: MenuCategory[];
}

/** Flat admin-side view of a menu item, joined with its category. */
export interface AdminMenuItem extends MenuItem {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  categoryEmoji: string;
  sortOrder: number;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface FssaiInfo {
  licenceNumber: string;
  issueDate: string;
  expiryDate: string;
  certImage: string;
}

export interface MessageTemplates {
  orderPrefix: string;
  orderSuffix: string;
  generalInquiry: string;
  supportComplaint: string;
  supportTrack: string;
  supportFeedback: string;
}

/** Standalone type for data/messages.json — templates may contain {{siteUrl}} and {{brandName}} */
export type MessagesData = MessageTemplates;

export interface SupportConfig {
  whatsappNumber: string;
  responseTime: string;
}

export interface RetentionConfig {
  promoText: string;
  promoLink: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  location: string;
  avatarEmoji?: string;
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
    story?: string;
    paragraphs: string[];
    highlights: string[];
  };
  faq: FaqEntry[];
  fssai: FssaiInfo;
  deliveryArea: string;
  deliveryNote?: string;
  businessHours: BusinessHour[];
  orderSource?: string;
  messages: MessageTemplates;
  support: SupportConfig;
  retention: RetentionConfig;
  testimonials?: Testimonial[];
}

/**
 * Search/answer/generative engine settings, editable from the admin panel.
 * Empty strings fall back to sensible defaults derived from site data.
 */
export interface SeoData {
  /** Overrides the home <title>. Empty → default built from brand + tagline. */
  metaTitle: string;
  /** Overrides the meta description. Empty → site.description. */
  metaDescription: string;
  /** Extra keywords merged with the built-in ones. */
  keywords: string[];
  /** Opening paragraph of /llms.txt — how AI assistants should describe the kitchen. */
  aiSummary: string;
  /** Google Search Console verification token (content of the meta tag). */
  googleSiteVerification: string;
}

export const DEFAULT_SEO: SeoData = {
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  aiSummary: "",
  googleSiteVerification: "",
};

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  image?: string;
}

export interface OrderEntry {
  id: string;
  timestamp: string;
  items: CartLine[];
  total: number;
  source: string;
}

export interface OrderLog {
  orders: OrderEntry[];
}
