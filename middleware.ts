import { next } from "@vercel/functions";

/**
 * Demo-only access gate.
 *
 * The demo deployment (emaraa-demo.vercel.app) used to sit behind Vercel Authentication,
 * which bounced every visit to a Vercel login and made the demo unusable on a phone.
 * This replaces it with a gate on our own side: the same admin username and password that
 * already guard /admin, and a session that expires one hour after login.
 *
 * It has to live in middleware rather than Express because vercel.json only routes
 * /api/:proxy* through the function — every HTML request is served straight from the CDN,
 * where server code never runs.
 *
 * This is a "keep strangers out of the demo" gate, not a security boundary. The data behind
 * it is seeded and fake, the deployment has no SMTP and no SMS credentials, and the app's own
 * OTP and admin auth still apply underneath it.
 */

const PRODUCTION_PROJECT_REF = "txzbzpnrclkdodosbndy";
const COOKIE_NAME = "demo_gate";

// Reachable without the cookie: the admin login page itself (otherwise there is no way in),
// the endpoint it posts to, and the cron routes, which carry their own CRON_SECRET.
const OPEN_PATHS = [/^\/admin(?:\/|$)/, /^\/api\/admin\/login\/?$/, /^\/api\/cron\//];

/**
 * Same shape as server/app.ts's boot guards, and for the same reason. DEMO_GATE_ENABLED set
 * on the wrong project would redirect every emaraa.app visitor to /admin — an outage, from one
 * dashboard typo. The flag is therefore never trusted alone: the database behind the deployment
 * must also not be production.
 */
function gateIsOn(): boolean {
  if (process.env.DEMO_GATE_ENABLED !== "true") return false;
  return !(process.env.SUPABASE_URL ?? "").includes(PRODUCTION_PROJECT_REF);
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

function equalsConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Cookie is `<expiryEpochMs>.<hex hmac-sha256 of that same string>`, issued by
 * server/demo-gate.ts. Expiry is read from the signed payload rather than trusted to
 * Max-Age, since a client controls when it actually drops a cookie.
 */
async function cookieIsValid(raw: string | null, secret: string): Promise<boolean> {
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return false;
  const expiry = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expiry));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return equalsConstantTime(signature, expected);
}

export default async function middleware(request: Request) {
  try {
    // TEMPORARY: proves middleware actually runs on this project (Vite SPA + a vercel.json that
    // already declares its own rewrites). Remove once the gate is confirmed working.
    if (new URL(request.url).pathname === "/__mw-check") {
      return new Response(`middleware alive, gate=${gateIsOn()}`, {
        headers: { "content-type": "text/plain" },
      });
    }

    if (!gateIsOn()) return next();

    const secret = process.env.DEMO_GATE_SECRET;
    // No secret means no cookie can ever validate, which would lock the demo out entirely.
    // Open rather than closed: this gate protects fake data, a lockout protects nothing.
    if (!secret) return next();

    const { pathname } = new URL(request.url);
    if (OPEN_PATHS.some((p) => p.test(pathname))) return next();

    if (await cookieIsValid(readCookie(request.headers.get("cookie"), COOKIE_NAME), secret)) {
      return next();
    }

    return Response.redirect(new URL("/admin", request.url), 302);
  } catch {
    // A gate that 500s on the demo is worse than a gate that lets someone look at seeded data.
    return next();
  }
}

export const config = {
  // Static assets are excluded so the admin login page can actually load its own bundle while
  // the rest of the site is still gated.
  matcher: [
    "/((?!assets/|fonts/|images/|favicon|robots\\.txt|sitemap|.*\\.(?:js|mjs|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|map|txt|xml|pdf)$).*)",
  ],
};
