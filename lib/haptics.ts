/** Light haptic tap for native-feeling feedback in the installed PWA (no-op where unsupported, e.g. iOS Safari). */
export function haptic(pattern: number | number[] = 12) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignored — vibration is best-effort
    }
  }
}
