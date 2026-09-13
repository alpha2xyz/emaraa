import { initSentry } from "./sentry";

// Initialize Sentry first — no-op unless SENTRY_DSN is set.
initSentry();

import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createApp, mountErrorHandler, log } from "./app";
import { createServer } from "http";

// Local dev entry. All middleware lives in createApp() so that production
// (api/index.ts) gets the identical stack — see the comment in server/app.ts.
const app = createApp();
const httpServer = createServer(app);

export { log };

(async () => {
  await registerRoutes(httpServer, app);

  mountErrorHandler(app, { rethrow: true });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(port, host, () => {
    log(`serving on port ${port}`);
  });
})().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
