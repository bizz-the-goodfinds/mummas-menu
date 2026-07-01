export interface MenuItem {
  id: string;
  name: string;
  price: number;
  veg: boolean;
  description: string;
  image: string;
  tags?: string[];
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
  avatar?: string;
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
