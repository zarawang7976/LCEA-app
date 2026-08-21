const MEASUREMENT_ID = "G-L5PMN3GXG0";
const CALCULATOR_USED_KEY = "hipmetrics-ga-calculator-used";

let calculatorUsedThisLoad = false;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]): void {
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/** SPA page view. Sends only a path name — no user or calculator data. */
export function trackPageView(path: string): void {
  gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
    send_to: MEASUREMENT_ID,
  });
}

/**
 * Fires `calculator_used` at most once per browser session.
 * No event parameters: does not send images, measurements, coordinates, or PII.
 */
export function trackCalculatorUsed(): void {
  if (calculatorUsedThisLoad) return;
  try {
    if (sessionStorage.getItem(CALCULATOR_USED_KEY) === "1") {
      calculatorUsedThisLoad = true;
      return;
    }
    sessionStorage.setItem(CALCULATOR_USED_KEY, "1");
  } catch {
    /* ignore storage errors */
  }
  calculatorUsedThisLoad = true;
  gtag("event", "calculator_used");
}
