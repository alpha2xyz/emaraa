import { Mail, Phone, MapPin, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "../hooks/use-lang";
import { Globe } from "lucide-react";

export default function ContactPage() {
  const { lang, setLang } = useLang();
  const isRTL = lang === "ar";
  const t =
    lang === "ar"
      ? {
          title: "تواصل معنا",
          subtitle: "نحن هنا للمساعدة. تواصل معنا عبر أي وسيلة.",
          email: "البريد الإلكتروني",
          phone: "الهاتف",
          whatsapp: "واتساب",
          location: "الموقع",
          loc: "الرياض، المملكة العربية السعودية",
          back: "العودة للرئيسية",
        }
      : {
          title: "Contact Us",
          subtitle: "We are here to help. Reach us through any channel.",
          email: "Email",
          phone: "Phone",
          whatsapp: "WhatsApp",
          location: "Location",
          loc: "Riyadh, Saudi Arabia",
          back: "Back to Home",
        };

  const contacts = [
    {
      icon: Mail,
      label: t.email,
      value: "info@emaraa.app",
      href: "mailto:info@emaraa.app",
      external: false,
    },
    {
      icon: Phone,
      label: t.phone,
      value: "0501315725",
      href: "tel:+966501315725",
      external: false,
    },
    {
      icon: MessageCircle,
      label: t.whatsapp,
      value: "0501315725",
      href: "https://wa.me/966501315725",
      external: true,
    },
    {
      icon: MapPin,
      label: t.location,
      value: t.loc,
      href: "https://maps.google.com/?q=Riyadh,Saudi+Arabia",
      external: true,
    },
  ];

  return (
    <div className="page-enter min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header strip */}
      <div
        style={{ background: "linear-gradient(135deg, #0f3a47, #193546)", borderBottom: "2px solid var(--owner)" }}
        className="text-white py-6 px-4 flex items-center justify-between"
        dir="rtl"
      >
        <p className="font-bold text-xl">عِمارة</p>
        <div className="flex items-center gap-3">
          <div className="text-start">
            <p className="text-xl font-bold">{t.title}</p>
            <p className="text-sm opacity-75">Contact Us</p>
          </div>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0DB8D3] mb-6 transition-colors">
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {t.back}
          </button>
        </Link>
        <p className="text-muted-foreground mb-8">{t.subtitle}</p>
        <div className="space-y-4">
          {contacts.map(({ icon: Icon, label, value, href, external }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--owner-soft)" }}>
                  <Icon className="w-6 h-6" style={{ color: "var(--owner)" }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="font-semibold text-foreground hover:text-[#0DB8D3] transition-colors"
                  >
                    {value}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
