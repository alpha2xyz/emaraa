import type { SignatureAdapter } from "./types.js";

// Picks which vendor implementation to use. Two exist — Signit and SADQ — and both stay in the
// tree on purpose so either can be exercised without deleting the other.
//
// Two different questions, deliberately kept apart:
//   - Which vendor starts a NEW signature?  ESIGN_VENDOR, read by selectedVendor().
//   - Which vendor owns an EXISTING one?    deals.signature_provider, written when the request was
//                                           created and passed to adapterFor() afterwards.
// A deal created on Signit keeps polling, linking and downloading from Signit even after
// ESIGN_VENDOR flips to sadq. Without that split, changing the env var would strand every deal
// already in flight.

export const ESIGN_VENDORS = ["signit", "sadq"] as const;
export type EsignVendor = (typeof ESIGN_VENDORS)[number];

/**
 * Vendor for new signature requests. Unset, or any value that is not a recognised vendor name,
 * falls back to sadq — the chosen vendor since 2026-09-20 (Signit was dropped as the default but
 * stays a valid explicit value; set ESIGN_VENDOR=signit to opt back into it).
 */
export function selectedVendor(): EsignVendor {
  const raw = (process.env.ESIGN_VENDOR ?? "sadq").trim().toLowerCase();
  return (ESIGN_VENDORS as readonly string[]).includes(raw) ? (raw as EsignVendor) : "sadq";
}

/**
 * Loads one vendor's adapter. Dynamic import for the same reason the call sites in routes.ts
 * already use one: neither vendor's module should load on requests that never touch signing.
 */
export async function adapterFor(vendor: string | null | undefined): Promise<SignatureAdapter> {
  if (vendor === "sadq") {
    return (await import("./sadq-adapter.js")).sadqAdapter;
  }
  // Anything else, including a null signature_provider on a row written before this existed.
  return (await import("./signit-adapter.js")).signitAdapter;
}

/** Adapter for new requests, with the vendor name to record alongside them. */
export async function newRequestAdapter(): Promise<{ vendor: EsignVendor; adapter: SignatureAdapter }> {
  const vendor = selectedVendor();
  return { vendor, adapter: await adapterFor(vendor) };
}
