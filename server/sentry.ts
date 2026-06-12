import * as Sentry from "@sentry/node";

// Server-side Sentry, fully gated behind SENTRY_DSN.
// initSentry() and captureError() are both no-ops when the DSN is unset.
export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? "development",
      tracesSampleRate: 0.1,
    });
  }
}

export function captureError(e: unknown) {
  if (process.env.SENTRY_DSN) Sentry.captureException(e);
}
