import { Link } from "wouter";
import { Instagram, Linkedin, X as XIcon } from "lucide-react";
import { useLang } from "@/hooks/use-lang";

/**
 * Site footer.
 *
 * Extracted from landing-page.tsx on 2026-09-13. It had been inlined there, so
 * it rendered on the homepage only: /about, /terms, /privacy and /contact ended
 * with no footer and no way back into the site. That also meant the legal
 * identity line below would have reached exactly one page.
 *
 * Carries the establishment name and commercial register number, which the site
 * did not state anywhere despite the CR being issued 2026-09-11.
 */

const CR_NUMBER = "7055192426";
const ENTITY_AR = "مؤسسة عبدالله حاتم الفرائضي";
const ENTITY_EN = "Abdullah Hatim Alfaraidi Establishment";

export default function Footer() {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  const t = isRTL
    ? {
        siteName: "عِمــارة",
        tagline: "عمارتك، مُدارة بشكل مثالي",
        followUs: "تابعنا",
        quickLinks: "روابط سريعة",
        contactUs: "اتصل بنا",
        aboutUs: "عن عِمــارة",
        viewDemo: "دليل المنصة",
        termsOfUse: "شروط الاستخدام",
        privacyPolicy: "سياسة الخصوصية",
        copyright: "© 2026 عِمــارة. جميع الحقوق محفوظة.",
        legal: `${ENTITY_AR} · سجل تجاري ${CR_NUMBER}`,
      }
    : {
        siteName: "EMARAA",
        tagline: "Your Building, Perfectly Managed",
        followUs: "Follow us",
        quickLinks: "Quick Links",
        contactUs: "Contact Us",
        aboutUs: "About Emaraa",
        viewDemo: "Platform Guide",
        termsOfUse: "Terms of Use",
        privacyPolicy: "Privacy Policy",
        copyright: "© 2026 EMARAA. All rights reserved.",
        legal: `${ENTITY_EN} · Commercial Register ${CR_NUMBER}`,
      };

  const linkClass =
    "text-muted-foreground hover:text-[#0DB8D3] active:text-[#0DB8D3] transition-colors no-underline";
  const socialClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-[#0DB8D3] hover:border-[#0DB8D3] active:text-[#0DB8D3] active:border-[#0DB8D3]";

  return (
    <footer className="bg-card border-t border-border py-10 md:py-12 pb-safe">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xl font-extrabold mb-2" style={{ color: "var(--owner)" }}>
              {t.siteName}
            </p>
            <p className="text-sm text-muted-foreground mb-4">{t.tagline}</p>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t.followUs}</h4>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/emaraa.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={socialClass}
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/emaraafm"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className={socialClass}
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/Emaraa_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className={socialClass}
                >
                  <XIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">{t.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className={linkClass}>
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>
                  {t.aboutUs}
                </Link>
              </li>
              <li>
                <a
                  href="/emaraa-guide.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t.viewDemo}
                </a>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  {t.termsOfUse}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClass}>
                  {t.privacyPolicy}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">{t.copyright}</p>
          <p className="mt-1 text-xs text-muted-foreground/80">{t.legal}</p>
        </div>
      </div>
    </footer>
  );
}
