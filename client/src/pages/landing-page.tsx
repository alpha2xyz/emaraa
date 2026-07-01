import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/use-lang";
import { useSeo } from "@/hooks/use-seo";
import { Link } from "wouter";
import {
  Globe,
  ClipboardList,
  Search,
  BarChart3,
  Home,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Bell,
  MapPin,
  ArrowLeft,
  ArrowDown,
  ChevronDown,
  Instagram,
  Linkedin,
} from "lucide-react";

// ── Building illustration ───────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 460 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-h-[420px]"
      aria-hidden="true"
    >
      <defs>
        <filter id="card-glow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#2563eb" floodOpacity="0.10" />
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.04" />
        </filter>
        <filter id="pill-glow" x="-25%" y="-30%" width="150%" height="165%">
          <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="#000" floodOpacity="0.07" />
        </filter>
      </defs>

      {/* Soft background blob — cyan glow on dark hero */}
      <circle cx="262" cy="222" r="178" fill="var(--owner-soft)" />

      {/* Ground */}
      <rect x="48" y="388" width="380" height="7" rx="3.5" fill="#D0DCE8" />

      {/* Left building – light teal */}
      <rect x="66" y="202" width="88" height="186" rx="8" fill="#4A6D8C" />
      <rect x="80" y="218" width="20" height="15" rx="2.5" fill="white" opacity="0.4" />
      <rect x="108" y="218" width="20" height="15" rx="2.5" fill="white" opacity="0.6" />
      <rect x="80" y="244" width="20" height="15" rx="2.5" fill="white" opacity="0.6" />
      <rect x="108" y="244" width="20" height="15" rx="2.5" fill="white" opacity="0.25" />
      <rect x="80" y="270" width="20" height="15" rx="2.5" fill="white" opacity="0.4" />
      <rect x="108" y="270" width="20" height="15" rx="2.5" fill="white" opacity="0.6" />
      <rect x="80" y="296" width="20" height="15" rx="2.5" fill="white" opacity="0.25" />
      <rect x="108" y="296" width="20" height="15" rx="2.5" fill="white" opacity="0.4" />
      <rect x="80" y="322" width="20" height="15" rx="2.5" fill="white" opacity="0.6" />
      <rect x="108" y="322" width="20" height="15" rx="2.5" fill="white" opacity="0.4" />
      <rect x="80" y="348" width="20" height="15" rx="2.5" fill="white" opacity="0.4" />
      <rect x="108" y="348" width="20" height="15" rx="2.5" fill="white" opacity="0.25" />

      {/* Main tall building – deep blue */}
      <rect x="174" y="64" width="156" height="324" rx="10" fill="#065B98" />
      <rect x="194" y="52" width="116" height="18" rx="6" fill="#06477a" />
      {/* Windows – 4 cols × 6 rows */}
      <rect x="190" y="84" width="24" height="26" rx="3" fill="white" opacity="0.4" />
      <rect x="222" y="84" width="24" height="26" rx="3" fill="white" opacity="0.2" />
      <rect x="254" y="84" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="286" y="84" width="24" height="26" rx="3" fill="white" opacity="0.3" />
      <rect x="190" y="122" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="222" y="122" width="24" height="26" rx="3" fill="white" opacity="0.4" />
      <rect x="254" y="122" width="24" height="26" rx="3" fill="white" opacity="0.2" />
      <rect x="286" y="122" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="190" y="160" width="24" height="26" rx="3" fill="white" opacity="0.3" />
      <rect x="222" y="160" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="254" y="160" width="24" height="26" rx="3" fill="white" opacity="0.4" />
      <rect x="286" y="160" width="24" height="26" rx="3" fill="white" opacity="0.2" />
      <rect x="190" y="198" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="222" y="198" width="24" height="26" rx="3" fill="white" opacity="0.3" />
      <rect x="254" y="198" width="24" height="26" rx="3" fill="white" opacity="0.4" />
      <rect x="286" y="198" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="190" y="236" width="24" height="26" rx="3" fill="white" opacity="0.2" />
      <rect x="222" y="236" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="254" y="236" width="24" height="26" rx="3" fill="white" opacity="0.3" />
      <rect x="286" y="236" width="24" height="26" rx="3" fill="white" opacity="0.4" />
      <rect x="190" y="274" width="24" height="26" rx="3" fill="white" opacity="0.4" />
      <rect x="222" y="274" width="24" height="26" rx="3" fill="white" opacity="0.2" />
      <rect x="254" y="274" width="24" height="26" rx="3" fill="white" opacity="0.5" />
      <rect x="286" y="274" width="24" height="26" rx="3" fill="white" opacity="0.3" />
      {/* Door */}
      <rect x="226" y="348" width="50" height="40" rx="4" fill="#06477a" />
      <rect x="248" y="348" width="2" height="40" fill="white" opacity="0.1" />

      {/* Right building – pale teal */}
      <rect x="348" y="238" width="80" height="150" rx="8" fill="#B8CCD9" />
      <rect x="360" y="254" width="18" height="14" rx="2" fill="white" opacity="0.5" />
      <rect x="386" y="254" width="18" height="14" rx="2" fill="white" opacity="0.35" />
      <rect x="360" y="280" width="18" height="14" rx="2" fill="white" opacity="0.35" />
      <rect x="386" y="280" width="18" height="14" rx="2" fill="white" opacity="0.55" />
      <rect x="360" y="306" width="18" height="14" rx="2" fill="white" opacity="0.55" />
      <rect x="386" y="306" width="18" height="14" rx="2" fill="white" opacity="0.35" />
      <rect x="360" y="332" width="18" height="14" rx="2" fill="white" opacity="0.35" />
      <rect x="386" y="332" width="18" height="14" rx="2" fill="white" opacity="0.5" />

      {/* Floating request card */}
      <rect x="292" y="86" width="160" height="100" rx="14" fill="white" filter="url(#card-glow)" />
      <rect x="310" y="106" width="26" height="30" rx="4" fill="#eff6ff" />
      <rect x="314" y="112" width="18" height="2.5" rx="1.25" fill="#0DB8D3" />
      <rect x="314" y="118" width="18" height="2.5" rx="1.25" fill="#0DB8D3" opacity="0.5" />
      <rect x="314" y="124" width="12" height="2.5" rx="1.25" fill="#0DB8D3" opacity="0.3" />
      <rect x="344" y="108" width="88" height="9" rx="4.5" fill="#d9eef4" />
      <rect x="344" y="122" width="66" height="7" rx="3.5" fill="#e2e8f0" />
      <rect x="310" y="150" width="70" height="22" rx="11" fill="#0DB8D3" />
      <circle cx="402" cy="151" r="14" fill="#dcfce7" />
      <path
        d="M396 151 L400.5 155.5 L409 144"
        stroke="#16a34a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Floating approved pill */}
      <rect x="40" y="146" width="124" height="48" rx="24" fill="white" filter="url(#pill-glow)" />
      <circle cx="64" cy="170" r="14" fill="#dcfce7" />
      <path
        d="M58 170 L62.5 175 L71.5 163"
        stroke="#16a34a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="84" y="162" width="66" height="9" rx="4.5" fill="#f0fdf4" />
      <rect x="84" y="175" width="50" height="7" rx="3.5" fill="#dcfce7" />

      {/* Decorative dots */}
      <circle cx="440" cy="96" r="10" fill="#B8CCD9" opacity="0.55" />
      <circle cx="458" cy="126" r="6" fill="#8AAABF" opacity="0.4" />
      <circle cx="420" cy="140" r="5" fill="#D0DCE8" opacity="0.8" />
      <circle cx="50" cy="330" r="7" fill="#8AAABF" opacity="0.32" />
      <circle cx="156" cy="164" r="5" fill="#4A6D8C" opacity="0.3" />
    </svg>
  );
}

// ── Browser-framed product screenshot ───────────────────────────────────────
function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="flex h-9 items-center gap-1.5 border-b border-border px-3" style={{ background: "var(--navy-3)" }}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-3 flex h-5 max-w-[230px] flex-1 items-center truncate rounded-md border border-border px-2 text-[10px] text-muted-foreground" style={{ background: "var(--navy-2)" }}>
          {url}
        </span>
      </div>
      <div className="p-4" style={{ background: "var(--navy-2)" }}>{children}</div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { lang, toggleLang } = useLang();

  const content = {
    ar: {
      siteName: "عِمــارة",
      login: "تسجيل الدخول",
      chip: "منصة سعودية · سكني وتجاري",
      heroTitle: "عِمــارة،",
      heroHighlight: "عمارتك، مُدارة بكفاءة",
      heroDesc:
        "ابحث، قارن، وتعاقد سنوياً مع شركات مرافق مرخّصة من الهيئة العامة للعقار، في أول منصة متخصصة لعقود إدارة المرافق العقارية.",
      getStarted: "ابدأ مجاناً",
      learnMore: "اعرف المزيد",
      whoTitle: "من يستفيد من عِمــارة؟",
      whoSubtitle: "سواء كنت مالك مبنى سكني أو تجاري، عِمــارة تُيسّر عليك إدارة مرافقك",
      residentialTitle: "المباني السكنية",
      residentialItems: [
        "أبراج سكنية ومجمعات",
        "فلل وملاحق",
        "خدمات نظافة يومية",
        "صيانة دورية للمرافق",
      ],
      commercialTitle: "المباني التجارية",
      commercialItems: [
        "مكاتب وأبراج تجارية",
        "مراكز تسوق ومحلات",
        "مستودعات ومصانع",
        "HVAC · مصاعد · مواقف · إطفاء",
      ],
      startNow: "ابدأ الآن",
      howItWorksTitle: "كيف تعمل المنصة",
      howItWorksDesc: "العثور على مزود الخدمة المناسب لم يكن أسهل من أي وقت مضى. ابدأ في دقائق.",
      step1Title: "أضف عقارك",
      step1Desc: "أضف تفاصيل عِمارتك (سكني أو تجاري) والخدمات التي تحتاجها",
      step1Reassurance: "أسهل من أي وقت مضى، ابدأ وفي دقائق ستجد مزود الخدمة المناسب لك",
      howItWorksCtaNudge: "العثور على مزود الخدمة المناسب أصبح أسهل من أي وقت، ابدأ الآن",
      step2Title: "احصل على عروض",
      step2Desc: "مقدمو الخدمات المؤهلون يقدمون عروضهم على طلباتك",
      step3Title: "قارن واختر",
      step3Desc: "راجع العروض واختر أفضل مزود خدمة مناسب لك",
      screens: {
        urlForm: "emaraa.app/dashboard/owner/onboarding",
        urlDash: "emaraa.app/dashboard/owner",
        propLabel: "اسم العقار",
        propValue: "برج النخيل السكني",
        typeLabel: "نوع المبنى",
        typeRes: "سكني",
        typeCom: "تجاري",
        districtLabel: "الحي",
        districtValue: "العليا",
        unitsLabel: "عدد الوحدات",
        saveBtn: "حفظ ونشر الطلب",
        offersHead: "عروض المزوّدين على طلبك",
        co1: "مرافق الرياض المتكاملة",
        co1sub: "مرخّصة من الهيئة · وصل الآن",
        co2: "الإتقان لإدارة المرافق",
        co2sub: "مرخّصة من الهيئة · قبل ساعة",
        newBadge: "عرض جديد",
        compareHead: "قارن واختر العرض المناسب",
        totalLabel: "الإجمالي",
        perUnit: "للوحدة",
        riyal: "ريال",
        selectBtn: "اختيار",
      },
      providerCTATitle: "هل أنت شركة إدارة مرافق؟",
      providerCTADesc: "انضم إلى عِمــارة للعثور على عملاء جدد، والتقديم على المشاريع، التي تساعد على تنمية عملك.",
      joinProvider: "كن شريكاً في عِمــارة",
      providerLogin: "تسجيل دخول مزود",
      faqTitle: "أسئلة شائعة",
      faqSubtitle: "كل ما تحتاج معرفته قبل البدء",
      faqs: [
        { q: "كيف أتأكد أن شركة إدارة المرافق موثوقة ومرخّصة؟", a: "كل عرض يصلك يأتي من شركة إدارة مرافق مرخّصة من الهيئة العامة للعقار (رخصة فال) ولديها سجل تجاري ساري، راجعها واعتمدها فريقنا قبل أن يصل عرضها إليك. أنت تستلم عروضاً من جهات موثوقة فقط." },
        { q: "هل أقدر أجد شركة إدارة مرافق معتمدة في الرياض؟", a: "نعم، نبدأ بمدينة الرياض في المرحلة الأولى بشركات إدارة مرافق مرخّصة ومعتمدة، ونتوسّع تدريجياً إلى مدن أخرى." },
        { q: "متى تصلني عروض الأسعار بعد نشر طلبي؟", a: "بمجرد نشر طلبك يصل إشعار فوري للشركات المعتمدة، وتبدأ عروض الأسعار بالوصول عادةً خلال وقت قصير." },
        { q: "هل رقمي وبياناتي تبقى خاصة؟", a: "نعم. لا يظهر رقمك لأي شركة إلا بعد قبولك لعرضها، وملف العرض الكامل لا يُفتح إلا بعد القبول." },
        { q: "كيف أقارن بين عروض شركات إدارة المرافق؟", a: "تقارن العروض جنباً إلى جنب — السعر الإجمالي والسعر لكل وحدة وملاحظات كل شركة — وتختار الأنسب لعقارك. القرار بيدك." },
        { q: "هل أقدر أتعاقد سنوياً لإدارة وصيانة عمارتي عبر المنصة؟", a: "نعم، المنصة متخصصة في عقود إدارة المرافق السنوية للعقارات السكنية والتجارية. تنشر احتياج عمارتك مرة واحدة، تستقبل عروضاً كاملة بنطاق الخدمة، وتتعاقد مع الشركة التي تختارها." },
      ],
      ctaTitle: "جاهز تبدأ بإدارة عمارتك بكفاءة؟",
      ctaDesc: "أضف عقارك خلال دقائق واستقبل عروضاً من مزوّدين موثوقين.",
      ctaBtn: "ابدأ الآن",
      whatsappLabel: "تواصل معنا عبر واتساب",
      quickLinks: "روابط سريعة",
      contactUs: "اتصل بنا",
      aboutUs: "عن عِمــارة",
      viewDemo: "دليل المنصة",
      termsOfUse: "شروط الاستخدام",
      privacyPolicy: "سياسة الخصوصية",
      footerTagline: "عمارتك، مُدارة بشكل مثالي",
      followUs: "تابعنا",
      footerCopyright: "© 2026 عِمــارة. جميع الحقوق محفوظة.",
    },
    en: {
      siteName: "EMARAA",
      login: "Login",
      chip: "Saudi Platform · Residential & Commercial",
      heroTitle: "EMARAA,",
      heroHighlight: "Your Building, Perfectly Managed",
      heroDesc:
        "Search, compare, and contract annually with REGA-licensed facility management companies — on the first platform specialized in property facility management contracts.",
      getStarted: "Get Started Free",
      learnMore: "Learn More",
      whoTitle: "Who is EMARAA for?",
      whoSubtitle:
        "Whether you own a residential or commercial building, EMARAA streamlines your facility management",
      residentialTitle: "Residential Buildings",
      residentialItems: [
        "Apartment towers & complexes",
        "Villas & annexes",
        "Daily cleaning services",
        "Periodic facility maintenance",
      ],
      commercialTitle: "Commercial Buildings",
      commercialItems: [
        "Office towers & commercial buildings",
        "Shopping centers & retail",
        "Warehouses & factories",
        "HVAC · Elevators · Parking · Fire systems",
      ],
      startNow: "Get Started",
      howItWorksTitle: "How It Works",
      howItWorksDesc:
        "Finding the right service provider has never been easier. Get started in minutes.",
      step1Title: "List Your Property",
      step1Desc: "Add your building details (residential or commercial) and the services you need",
      step1Reassurance: "Easier than ever — start now and find the right service provider in minutes.",
      howItWorksCtaNudge: "Finding the right provider is easier than ever — start now.",
      step2Title: "Get Matched",
      step2Desc: "Qualified service providers bid on your requests",
      step3Title: "Compare & Choose",
      step3Desc: "Review bids and select the best provider for you",
      screens: {
        urlForm: "emaraa.app/dashboard/owner/onboarding",
        urlDash: "emaraa.app/dashboard/owner",
        propLabel: "Property name",
        propValue: "Al-Nakheel Residential Tower",
        typeLabel: "Building type",
        typeRes: "Residential",
        typeCom: "Commercial",
        districtLabel: "District",
        districtValue: "Al-Olaya",
        unitsLabel: "Units",
        saveBtn: "Save & post request",
        offersHead: "Provider offers on your request",
        co1: "Riyadh Integrated Facilities",
        co1sub: "REGA-licensed · just now",
        co2: "Al-Itqan Facility Mgmt",
        co2sub: "REGA-licensed · 1h ago",
        newBadge: "New offer",
        compareHead: "Compare & choose the right offer",
        totalLabel: "Total",
        perUnit: "per unit",
        riyal: "SAR",
        selectBtn: "Select",
      },
      providerCTATitle: "Are You a Facility Management Company?",
      providerCTADesc: "Join EMARAA to find new clients and apply for projects that help grow your business.",
      joinProvider: "Become a Partner",
      providerLogin: "Provider Login",
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "Everything you need to know before you start",
      faqs: [
        { q: "How can I be sure a facility management company is licensed and trustworthy?", a: "Every offer you receive comes from a facility management company holding a valid REGA (FAL) license and an active commercial registration, reviewed and approved by our team before it reaches you. You only get offers from trusted, vetted companies." },
        { q: "Can I find an accredited facility management company in Riyadh?", a: "Yes — we're launching in Riyadh first with licensed, accredited facility management companies, and expanding to other cities gradually." },
        { q: "When will I receive price offers after posting my request?", a: "As soon as you post your request, approved companies get an instant notification, and offers usually start arriving shortly after." },
        { q: "Do my phone number and data stay private?", a: "Yes. Your number is never shown to a company until you accept their offer, and the full proposal file only opens after you accept." },
        { q: "How do I compare offers from facility management companies?", a: "You compare them side by side — total price, per-unit price, and each company's notes — and choose what suits your property. The decision is yours." },
        { q: "Can I sign an annual facility management contract for my building through the platform?", a: "Yes — the platform specializes in annual facility management contracts for residential and commercial properties. Post your building's needs once, receive complete scoped offers, and contract with the company you choose." },
      ],
      ctaTitle: "Ready to manage your building efficiently?",
      ctaDesc: "Add your property in minutes and receive offers from trusted providers.",
      ctaBtn: "Get Started",
      whatsappLabel: "Chat with us on WhatsApp",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      aboutUs: "About Emaraa",
      viewDemo: "Platform Guide",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      footerTagline: "Your Building, Perfectly Managed",
      followUs: "Follow us",
      footerCopyright: "© 2026 EMARAA. All rights reserved.",
    },
  };

  const t = content[lang];
  const isRTL = lang === "ar";

  useSeo({
    title: "عِمارة | منصة سعودية لربط ملاك العقارات بشركات إدارة المرافق المرخّصة",
    description:
      "عِمارة تربط ملاك العقارات السكنية والتجارية بشركات إدارة مرافق مرخّصة من الهيئة العامة للعقار في الرياض. انشر احتياج عقارك واستقبل عروض أسعار، قارن واختر الأفضل.",
    path: "/",
  });

  // FAQPage structured data — always from the Arabic copy (primary language)
  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.ar.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  return (
    <div className="page-enter min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--owner)" }}>
              {t.siteName}
            </span>
            <nav className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLang}
                className="text-muted-foreground hover:text-[#0DB8D3] gap-1.5"
              >
                <Globe className="h-4 w-4" />
                {lang === "ar" ? "EN" : "عربي"}
              </Button>
              <Link href="/auth?mode=login">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-foreground border-border hover:border-[#0DB8D3] hover:text-[#0DB8D3]"
                >
                  {t.login}
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ background: "linear-gradient(160deg, #0f3a47, #0F2733 75%)" }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Text side */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide" style={{ color: "var(--owner)", background: "var(--owner-soft)" }}>
                  {t.chip}
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3">
                  {t.heroTitle}
                </h1>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ color: "var(--owner)" }}>
                  {t.heroHighlight}
                </h1>
              </div>
              <p className="text-lg leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.7)" }}>{t.heroDesc}</p>
              <div className="flex">
                <Button
                  size="lg"
                  className="px-8 gap-2 active:scale-95 transition-transform shadow-md hover:shadow-lg hover:opacity-90"
                  style={{ background: "var(--owner)", color: "#04222c" }}
                  onClick={() => {
                    const el = document.getElementById("how-it-works");
                    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                  }}
                >
                  {t.learnMore}
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Illustration side */}
            <div className="flex items-center justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────────────── */}
      <div className="py-6 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" style={{ color: "var(--provider)" }} />
              <span>{lang === "ar" ? "مزوّدون مرخّصون من الهيئة" : "REGA-licensed providers"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Home className="w-5 h-5 flex-shrink-0" style={{ color: "#E58AA0" }} />
              <span>{lang === "ar" ? "مرافق سكنية وتجارية" : "Residential & Commercial"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bell className="w-5 h-5 flex-shrink-0" style={{ color: "var(--owner)" }} />
              <span>{lang === "ar" ? "إشعارات فورية" : "Instant Notifications"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: "#F0A87F" }} />
              <span>{lang === "ar" ? "الرياض — المرحلة الأولى" : "Riyadh — Phase One"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Who benefits ────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--navy-2)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">{t.whoTitle}</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{t.whoSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Residential */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "var(--residential-soft)" }}>
                  <Home className="w-7 h-7" strokeWidth={1.5} style={{ color: "#E58AA0" }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t.residentialTitle}</h3>
                <ul className="space-y-2.5 mb-6">
                  {t.residentialItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#E58AA0" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Commercial */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "var(--commercial-soft)" }}>
                  <Building2 className="w-7 h-7" strokeWidth={1.5} style={{ color: "#F0A87F" }} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t.commercialTitle}</h3>
                <ul className="space-y-2.5 mb-6">
                  {t.commercialItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#F0A87F" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          {/* Single shared owner CTA */}
          <div className="text-center mt-10">
            <Link href="/auth?role=owner">
              <Button
                size="lg"
                className="px-12 active:scale-95 transition-transform shadow-md hover:shadow-lg hover:opacity-90"
                style={{ background: "var(--owner)", color: "#04222c" }}
              >
                {t.startNow}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works (real product screens) ─────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              {t.howItWorksTitle}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              {t.howItWorksDesc}
            </p>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-20">
            {/* Step 1 — list property */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--owner-soft)" }}>
                    <ClipboardList className="h-5 w-5" style={{ color: "var(--owner)" }} />
                  </span>
                  <span className="text-4xl font-extrabold leading-none opacity-40" style={{ color: "var(--owner)" }}>1</span>
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-foreground">{t.step1Title}</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t.step1Desc}</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t.step1Reassurance}</p>
              </div>
              <BrowserFrame url={t.screens.urlForm}>
                <div className="rounded-xl border border-border p-4" style={{ background: "var(--card)" }}>
                  <p className="mb-1.5 text-xs font-bold text-foreground">{t.screens.propLabel}</p>
                  <div className="mb-3 flex h-8 items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground">{t.screens.propValue}</div>
                  <p className="mb-1.5 text-xs font-bold text-foreground">{t.screens.typeLabel}</p>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border-2 py-2.5 text-center text-xs font-bold" style={{ borderColor: "var(--residential)", background: "var(--residential-soft)", color: "#E58AA0" }}>
                      <Home className="mx-auto mb-1 h-4 w-4" />
                      {t.screens.typeRes}
                    </div>
                    <div className="rounded-lg border border-border py-2.5 text-center text-xs font-bold text-muted-foreground">
                      <Building2 className="mx-auto mb-1 h-4 w-4" />
                      {t.screens.typeCom}
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-2.5">
                    <div>
                      <p className="mb-1.5 text-xs font-bold text-foreground">{t.screens.districtLabel}</p>
                      <div className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground">{t.screens.districtValue}</div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-bold text-foreground">{t.screens.unitsLabel}</p>
                      <div className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground">12</div>
                    </div>
                  </div>
                  <div className="flex h-9 items-center justify-center rounded-lg text-xs font-bold" style={{ background: "var(--owner)", color: "#04222c" }}>{t.screens.saveBtn}</div>
                </div>
              </BrowserFrame>
            </div>

            {/* Step 2 — receive offers (reversed on desktop) */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="md:order-2">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--owner-soft)" }}>
                    <Search className="h-5 w-5" style={{ color: "var(--owner)" }} />
                  </span>
                  <span className="text-4xl font-extrabold leading-none opacity-40" style={{ color: "var(--owner)" }}>2</span>
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-foreground">{t.step2Title}</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t.step2Desc}</p>
              </div>
              <div className="md:order-1">
                <BrowserFrame url={t.screens.urlDash}>
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                    <Bell className="h-3.5 w-3.5" style={{ color: "var(--owner)" }} />
                    {t.screens.offersHead}
                  </p>
                  {[
                    { n: t.screens.co1, s: t.screens.co1sub },
                    { n: t.screens.co2, s: t.screens.co2sub },
                  ].map((c, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2.5 rounded-xl border border-border p-2.5" style={{ background: "var(--card)" }}>
                      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: "var(--provider-soft)" }}>
                        <Building2 className="h-4 w-4" style={{ color: "var(--provider)" }} />
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-foreground">{c.n}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{c.s}</p>
                      </div>
                      <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>{t.screens.newBadge}</span>
                    </div>
                  ))}
                </BrowserFrame>
              </div>
            </div>

            {/* Step 3 — compare & choose */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--owner-soft)" }}>
                    <BarChart3 className="h-5 w-5" style={{ color: "var(--owner)" }} />
                  </span>
                  <span className="text-4xl font-extrabold leading-none opacity-40" style={{ color: "var(--owner)" }}>3</span>
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-foreground">{t.step3Title}</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t.step3Desc}</p>
              </div>
              <BrowserFrame url={t.screens.urlDash}>
                <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                  <BarChart3 className="h-3.5 w-3.5" style={{ color: "var(--owner)" }} />
                  {t.screens.compareHead}
                </p>
                <div className="mb-2 flex items-center gap-2.5 rounded-xl border-2 p-2.5" style={{ background: "var(--card)", borderColor: "var(--provider)", boxShadow: "0 5px 14px rgba(27,127,220,0.25)" }}>
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: "var(--provider-soft)" }}>
                    <Building2 className="h-4 w-4" style={{ color: "var(--provider)" }} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">{t.screens.co2}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{t.screens.totalLabel}: 24,000 {t.screens.riyal} · {t.screens.perUnit} 2,000</p>
                  </div>
                  <span className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white" style={{ background: "var(--provider)" }}>{t.screens.selectBtn} ✓</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-border p-2.5" style={{ background: "var(--card)" }}>
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: "var(--provider-soft)" }}>
                    <Building2 className="h-4 w-4" style={{ color: "var(--provider)" }} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">{t.screens.co1}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{t.screens.totalLabel}: 27,600 {t.screens.riyal} · {t.screens.perUnit} 2,300</p>
                  </div>
                  <span className="rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground">{t.screens.selectBtn}</span>
                </div>
              </BrowserFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing owner CTA (full-bleed band) ──────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 text-center"
        style={{ background: "linear-gradient(135deg, #0f3a47 0%, #0F2733 75%)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        {/* faint dot pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-3 text-2xl md:text-3xl font-extrabold text-white">{t.ctaTitle}</h2>
            <p className="mx-auto mb-4 max-w-lg text-base" style={{ color: "rgba(255,255,255,0.82)" }}>
              {t.ctaDesc}
            </p>
            <p className="mx-auto mb-8 max-w-lg text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t.howItWorksCtaNudge}
            </p>
            <Link href="/auth?role=owner">
              <Button
                size="lg"
                className="px-12 font-semibold hover:opacity-90 active:scale-95 transition-transform"
                style={{ background: "var(--owner)", color: "#04222c" }}
              >
                {t.ctaBtn}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      <section className="py-20" style={{ background: "var(--navy-2)" }}>
        <div className="container mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl md:text-4xl font-extrabold text-foreground">{t.faqTitle}</h2>
            <p className="text-base md:text-lg text-muted-foreground">{t.faqSubtitle}</p>
          </div>
          <div className="space-y-3">
            {t.faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-foreground">
                  {f.q}
                  <ChevronDown className="h-5 w-5 flex-none text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Provider CTA (full-bleed band) ──────────────────────────────── */}
      <section
        className="relative overflow-hidden py-14 text-center"
        style={{ background: "linear-gradient(135deg, #0e3a5c, #193546)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        {/* faint dot pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        {/* soft corner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 h-[360px] w-[360px] start-[-80px]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)" }}
        />
        <div className="relative container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              {t.providerCTATitle}
            </h2>
            <p className="text-base md:text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
              {t.providerCTADesc}
            </p>
            <div className="flex justify-center">
              <Link href="/auth?role=provider">
                <Button
                  size="lg"
                  className="group h-auto gap-3.5 rounded-full ps-1.5 pe-7 py-1.5 text-base font-bold text-white shadow-lg transition-transform active:scale-95 hover:opacity-90"
                  style={{ background: "var(--provider)" }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full transition-colors" style={{ background: "#0e2f4d" }}>
                    <ArrowLeft className="text-white" />
                  </span>
                  {t.joinProvider}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xl font-extrabold mb-2" style={{ color: "var(--owner)" }}>{t.siteName}</p>
              <p className="text-sm text-muted-foreground mb-4">{t.footerTagline}</p>
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t.followUs}</h4>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/emaraa.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-[#0DB8D3] hover:border-[#0DB8D3]"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/emaraafm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-[#0DB8D3] hover:border-[#0DB8D3]"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t.quickLinks}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-[#0DB8D3] transition-colors no-underline"
                  >
                    {t.contactUs}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[#0DB8D3] transition-colors no-underline"
                  >
                    {t.aboutUs}
                  </Link>
                </li>
                <li>
                  <a
                    href="/emaraa-guide.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#0DB8D3] transition-colors no-underline"
                  >
                    {t.viewDemo}
                  </a>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-[#0DB8D3] transition-colors no-underline"
                  >
                    {t.termsOfUse}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-[#0DB8D3] transition-colors no-underline"
                  >
                    {t.privacyPolicy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">{t.footerCopyright}</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp button ─────────────────────────────────────── */}
      <a
        href="https://wa.me/966501315725?text=مرحباً، لدي استفسار عن منصة عِمارة"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.whatsappLabel}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#1EA952] shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#fff" aria-hidden="true">
          <path d="M17.6 6.32A8 8 0 0 0 4.21 16.05L3 21l5.06-1.18A8 8 0 1 0 17.6 6.32zM12 19.4a6.9 6.9 0 0 1-3.5-.96l-.25-.15-2.6.68.7-2.53-.16-.26A6.9 6.9 0 1 1 12 19.4zm3.9-5.2c-.21-.1-1.26-.62-1.45-.69s-.34-.1-.48.11-.55.68-.67.82-.25.16-.46.05a5.66 5.66 0 0 1-2.83-2.47c-.21-.36.21-.34.6-1.12a.38.38 0 0 0-.02-.36c-.05-.1-.48-1.15-.66-1.57s-.35-.36-.48-.36h-.41a.79.79 0 0 0-.57.27 2.4 2.4 0 0 0-.75 1.78 4.17 4.17 0 0 0 .87 2.2 9.54 9.54 0 0 0 3.65 3.23c2.27.99 2.27.66 2.68.62a2.18 2.18 0 0 0 1.43-1.01 1.78 1.78 0 0 0 .12-1.01c-.05-.1-.19-.16-.4-.26z" />
        </svg>
      </a>
    </div>
  );
}
