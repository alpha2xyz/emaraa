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
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

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
/**
 * The OTP test bypass (server/routes.ts) lets whitelisted fake numbers log in with
 * a fixed code and no SMS. That is exactly what the investor demo deployment needs,
 * and exactly what must never be reachable on production.
 *
 * The env flag alone is one dashboard typo away from an auth bypass on the live
 * site, so it is not the only guard: the bypass is only allowed when the database
 * behind it is NOT production. If both are true the process refuses to start —
 * loudly, at boot, rather than silently serving a bypass to real users.
 */
const PRODUCTION_PROJECT_REF = "txzbzpnrclkdodosbndy";

function assertTestModeIsNotOnProduction(): void {
  if (process.env.OTP_TEST_MODE !== "true") return;
  if (!(process.env.SUPABASE_URL ?? "").includes(PRODUCTION_PROJECT_REF)) return;
  throw new Error(
    "OTP_TEST_MODE=true with SUPABASE_URL pointing at the production Supabase project. " +
      "This would expose the OTP bypass to real users. Refusing to start. " +
      "Unset OTP_TEST_MODE, or point this deployment at the demo project.",
  );
}

export function createApp(): Express {
  assertTestModeIsNotOnProduction();

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
  opts: { onError?: (err: unknown) => void; rethrow?: boolean } = {}
) {
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    opts.onError?.(err);
    const e = (err ?? {}) as { status?: number; statusCode?: number; message?: string };
    const status = e.status || e.statusCode || 500;
    const message = e.message || "Internal Server Error";

    res.status(status).json({ message });
    if (opts.rethrow) throw err;
  });
}
