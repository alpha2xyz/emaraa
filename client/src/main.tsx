import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

const dsn = import.meta.env.VITE_SENTRY_DSN;

// Sentry is fully gated behind VITE_SENTRY_DSN — no init, no overhead when unset.
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

function ErrorFallback() {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "8px",
        padding: "24px",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <p style={{ fontSize: "18px", fontWeight: 600 }}>حدث خطأ ما. حدّث الصفحة.</p>
      <p style={{ fontSize: "14px", opacity: 0.7 }}>Something went wrong. Please refresh.</p>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);

// Only wrap in Sentry's ErrorBoundary when a DSN is configured; otherwise render bare.
root.render(
  dsn ? (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  ) : (
    <App />
  ),
);
