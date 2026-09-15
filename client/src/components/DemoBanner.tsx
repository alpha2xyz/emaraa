import { useLang } from "@/hooks/use-lang";

/**
 * Persistent "this is a demo" bar, shown only on the investor demo deployment
 * (VITE_DEMO_MODE=true — set on the emaraa-demo Vercel project, nowhere else).
 *
 * It is not dismissible on purpose. Every name, company, price and phone number
 * in the demo database is invented, and anyone looking over Abdallah's shoulder
 * in a meeting has to be able to tell that at a glance, at any moment — not only
 * if they happened to be watching when the page loaded.
 */
// `import.meta.env` is undefined under the build-time prerender (script/prerender.tsx),
// which imports these components in plain Node with no Vite transform. Optional
// chaining keeps the prerender working; it resolves to false there, which is what a
// crawler should see anyway.
export const IS_DEMO = import.meta.env?.VITE_DEMO_MODE === "true";

/**
 * The fixed code the demo accounts log in with. Must match OTP_TEST_CODE on the
 * demo deployment. Shown in the UI on purpose: on the demo no SMS is sent, so the
 * code has to come from somewhere, and it guards nothing -- it only works for the
 * seeded fake numbers listed in OTP_TEST_NUMBERS, and only where OTP_TEST_MODE is
 * on, which is never production.
 */
export const DEMO_OTP_CODE = import.meta.env?.VITE_DEMO_OTP_CODE ?? "1234";

export default function DemoBanner() {
  const { lang } = useLang();
  if (!IS_DEMO) return null;

  return (
    <div
      role="note"
      className="w-full text-center py-1.5 px-3 text-xs font-medium"
      style={{
        background: "var(--warn-soft, rgba(251,191,36,0.14))",
        color: "var(--warn, #FBBF24)",
        borderBottom: "1px solid rgba(251,191,36,0.28)",
      }}
    >
      {lang === "ar"
        ? "نسخة تجريبية · جميع البيانات والأسماء والأسعار افتراضية"
        : "Demo environment · all data, names and prices are fictional"}
    </div>
  );
}
