import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Never write tokens or phone numbers to logs.
const REDACT_KEYS = new Set([
  "token",
  "sessionToken",
  "supabaseToken",
  "password",
  "phone",
  "session_token",
]);

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const redacted = Object.fromEntries(
          Object.entries(capturedJsonResponse).map(([k, v]) =>
            REDACT_KEYS.has(k) ? [k, "[redacted]"] : [k, v]
          )
        );
        logLine += ` :: ${JSON.stringify(redacted)}`;
      }

      log(logLine);
    }
  });

  next();
}

function allowedOrigins(): string[] {
  if (process.env.FRONTEND_URL) return [process.env.FRONTEND_URL];
  if (process.env.NODE_ENV === "production") {
    return ["https://emaraa.app", "https://emaraa.vercel.app"];
  }
  return ["http://localhost:5000"];
}

/**
 * The single Express app factory. Both entry points use it — `server/index.ts`
 * (local dev via tsx) and `api/index.ts` (production on Vercel).
 *
 * Why this exists: until 2026-09-13 the two entries were built separately and had
 * drifted. Production mounted only the body parsers — no Helmet, no CORS, no
 * redacting logger — so every security header the dev server appeared to have was
 * absent from the deployed site, and any middleware added later would silently go
 * to whichever file the author happened to open. Anything that must hold in
 * production belongs in here, not in either entry file.
 */
export function createApp(): Express {
  const app = express();

  // Trust exactly one proxy hop (Vercel's edge), expressed as a hop count rather
  // than `true`. The OTP per-IP cap keys on req.ip; with a permissive setting a
  // client could spoof X-Forwarded-For and mint a fresh IP per request, which
  // would make the cap decorative. One hop means only the edge's value is honored.
  app.set("trust proxy", 1);

  // CSP is deliberately NOT set here. In production vercel.json is the single
  // source of truth for it; mounting a second policy would make the browser
  // enforce the intersection of the two, so a change in vercel.json would appear
  // not to work. In dev, Vite injects an inline fast-refresh preamble that a
  // strict script-src blocks before the SPA renders. Helmet's other headers
  // (HSTS, nosniff, frameguard, referrer policy) apply in both environments.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.disable("x-powered-by"); // don't reveal Express

  app.use(
    cors({
      origin: allowedOrigins(),
      credentials: true,
    })
  );

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.use(express.urlencoded({ extended: false }));

  app.use(requestLogger);

  return app;
}

/**
 * Terminal error handler. Mount AFTER routes are registered.
 *
 * `onError` lets the production entry report to Sentry. The dev entry rethrows so
 * a stack surfaces in the terminal; production must not rethrow, since throwing
 * after the response has been sent takes the serverless function down with it.
 */
export function mountErrorHandler(
  app: Express,
  opts: { onError?: (err: any) => void; rethrow?: boolean } = {}
) {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    opts.onError?.(err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    if (opts.rethrow) throw err;
  });
}
