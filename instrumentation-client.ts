import { getAnalyticsInstance } from "./lib/firebase";
import { trackError } from "./lib/analytics";

// Eagerly initialize Firebase Analytics
getAnalyticsInstance().catch(() => {});

// Track unhandled JS errors — web equivalent of Crashlytics
window.addEventListener("error", (event) => {
  trackError(event.message, event.filename || "unknown");
});

window.addEventListener("unhandledrejection", (event) => {
  const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
  trackError(msg, "unhandledrejection");
});
