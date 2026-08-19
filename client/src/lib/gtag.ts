// Google Ads conversion tracking (base gtag snippet loads in client/index.html).
const GOOGLE_ADS_ID = "AW-18391925803";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// IMPORTANT: Google Ads only counts a hit as a "Conversion" (and only uses it
// for bidding) when send_to includes a conversion action LABEL, e.g.
// "AW-18391925803/AbCdEfGh123". The bare account ID is NOT enough. No
// conversion actions exist in the Ads account yet, so right now these events
// fire (base tag + named events reach Google's servers) but do NOT show up as
// a Conversion in Google Ads.
//
// To activate: in Google Ads, create a conversion action per event below,
// copy its label, and add it here — that's the only code change needed.
const CONVERSION_LABELS: Partial<Record<string, string>> = {
  // request_submitted: "",
  // otp_verify_success: "",
  // owner_signup: "",
};

export function trackConversion(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const label = CONVERSION_LABELS[eventName];
  const send_to = label ? `${GOOGLE_ADS_ID}/${label}` : GOOGLE_ADS_ID;
  window.gtag("event", eventName, { send_to, ...params });
}
