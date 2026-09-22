import { createHmac } from "node:crypto";
import { PRODUCTION_PROJECT_REF } from "./production-ref.js";

/**
 * Issues the cookie that middleware.ts checks. Format and expiry rules live in that file's
 * cookieIsValid — the two must stay in step, they cannot share code because middleware runs
 * on a different runtime.
 */

const ONE_HOUR_SECONDS = 60 * 60;

export function demoGateCookie(): string | null {
  if (process.env.DEMO_GATE_ENABLED !== "true") return null;
  const secret = process.env.DEMO_GATE_SECRET;
  if (!secret) return null;
  // Never mint a gate cookie from a deployment talking to production, whatever the flag says.
  if ((process.env.SUPABASE_URL ?? "").includes(PRODUCTION_PROJECT_REF)) return null;

  const expiry = String(Date.now() + ONE_HOUR_SECONDS * 1000);
  const signature = createHmac("sha256", secret).update(expiry).digest("hex");
  return `demo_gate=${expiry}.${signature}; Path=/; Max-Age=${ONE_HOUR_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}
