import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/use-lang";
import { applyConsent, readConsent } from "@/lib/gtag";

/**
 * Cookie consent bar.
 *
 * The site carries Google Ads conversion and remarketing tags. Until 2026-09-13
 * there was no consent step at all, while the privacy policy claimed no
 * advertising cookies were used. This closes that gap on both sides: the policy
 * now describes the tags, and nothing is stored until the visitor chooses here.
 *
 * Gating is done with Consent Mode v2 (see client/index.html and lib/gtag.ts)
 * rather than by withholding the script, so a visitor who accepts is measured
 * correctly from that moment without a reload.
 */
export default function CookieConsent() {
  const { lang } = useLang();
  const isRTL = lang === "ar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      // Re-apply the saved decision on every load: Consent Mode defaults to
      // denied on each page view, so a previous "granted" must be replayed.
      applyConsent(stored, false);
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (decision: "granted" | "denied") => {
    applyConsent(decision);
    setVisible(false);
  };

  const t = isRTL
    ? {
        body: "نستخدم ملفات أساسية لتشغيل المنصة، وملفات تحليلات وإعلانات لقياس أثر حملاتنا. اختيارك محفوظ، وتقدر تغيّره في أي وقت.",
        accept: "أوافق على الكل",
        reject: "الأساسية فقط",
        policy: "سياسة الخصوصية",
      }
    : {
        body: "We use essential cookies to run the platform, plus analytics and advertising cookies to measure how our campaigns perform. Your choice is saved, and you can change it any time.",
        accept: "Accept all",
        reject: "Essential only",
        policy: "Privacy Policy",
      };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={isRTL ? "إعدادات ملفات تعريف الارتباط" : "Cookie settings"}
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm"
    >
      <div className="container mx-auto flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-[13px] leading-relaxed text-muted-foreground md:text-sm">
          {t.body}{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t.policy}
          </Link>
        </p>
        <div className="flex flex-shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 md:flex-none"
            onClick={() => decide("denied")}
          >
            {t.reject}
          </Button>
          <Button
            size="sm"
            className="flex-1 md:flex-none"
            style={{ background: "var(--owner)", color: "#04222c" }}
            onClick={() => decide("granted")}
          >
            {t.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
