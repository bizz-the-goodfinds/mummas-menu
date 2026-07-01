import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "./firebase";

async function track(event: string, params?: Record<string, unknown>) {
  const a = await getAnalyticsInstance();
  if (!a) return;
  logEvent(a, event, params);
}

// ─── Standard GA4 ecommerce events ───────────────────────────────────────────

export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  track("add_to_cart", {
    currency: "INR",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
      },
    ],
  });
}

export function trackRemoveFromCart(item: { id: string; name: string; price: number }) {
  track("remove_from_cart", {
    currency: "INR",
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, price: item.price }],
  });
}

export function trackViewCart(
  totalValue: number,
  items: Array<{ id: string; name: string; price: number; qty: number }>,
) {
  track("view_cart", {
    currency: "INR",
    value: totalValue,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.qty,
    })),
  });
}

export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  track("view_item", {
    currency: "INR",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
      },
    ],
  });
}

export function trackBeginCheckout(
  totalValue: number,
  items: Array<{ id: string; name: string; price: number; qty: number }>,
) {
  track("begin_checkout", {
    currency: "INR",
    value: totalValue,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.qty,
    })),
  });
}

// ─── Custom events ────────────────────────────────────────────────────────────

export function trackWhatsAppFloat() {
  track("whatsapp_float_click");
}

export function trackPwaPromptShown() {
  track("pwa_install_prompted");
}

export function trackPwaInstallAccepted() {
  track("pwa_install_accepted");
}

export function trackPwaInstallDismissed() {
  track("pwa_install_dismissed");
}

// ─── Error tracking (Crashlytics equivalent for web) ─────────────────────────

export function trackError(message: string, source?: string) {
  track("app_exception", {
    description: message,
    source: source ?? "unknown",
    fatal: false,
  });
}

// ─── Web Vitals ───────────────────────────────────────────────────────────────

export function trackWebVital(name: string, value: number, id: string) {
  track(name.toLowerCase(), {
    value: Math.round(name === "CLS" ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });
}
