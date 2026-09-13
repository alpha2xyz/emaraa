import { initSentry, captureError } from "../server/sentry.js";

// Initialize Sentry first — no-op unless SENTRY_DSN is set.
initSentry();

import { type Request, type Response } from "express";
import { createServer } from "http";
import { registerRoutes, seedAdmin } from "../server/routes.js";
import { createApp, mountErrorHandler } from "../server/app.js";

// Production entry (Vercel). The middleware stack comes from createApp() so it
// cannot drift from dev again — see the comment in server/app.ts.
const app = createApp();

const server = createServer(app);

let initError: Error | null = null;

const ready = (async () => {
  try {
    await registerRoutes(server, app);
    // Report to Sentry, but never rethrow: throwing after the response is sent
    // takes the serverless function down with it.
    mountErrorHandler(app, { onError: captureError });
    // Seed admin from env vars — fire-and-forget, never blocks startup
    seedAdmin().catch((e) => console.error("[seedAdmin] unexpected error:", e?.message));
  } catch (e: any) {
    captureError(e);
    initError = e;
    console.error("[emaraa] init failed:", e?.message, e?.stack);
  }
})();

export default async (req: Request, res: Response) => {
  await ready;
  if (initError) {
    res.status(500).json({ error: "Server init failed", detail: initError.message });
    return;
  }
  return app(req, res);
};
