import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/use-lang";
import { Link } from "wouter";
import {
  Users,
  Globe,
  ClipboardList,
  Search,
  BarChart3,
  Wrench,
  Home,
  Building2,
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

      {/* Soft background blob */}
      <circle cx="262" cy="222" r="178" fill="#eff6ff" />

      {/* Ground */}
      <rect x="48" y="388" width="380" height="7" rx="3.5" fill="#dbeafe" />

      {/* Left building – light teal */}
      <rect x="66" y="202" width="88" height="186" rx="8" fill="#60a5fa" />
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

      {/* Main tall building – deep teal */}
      <rect x="174" y="64" width="156" height="324" rx="10" fill="#2563eb" />
      <rect x="194" y="52" width="116" height="18" rx="6" fill="#1d4ed8" />
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
      <rect x="226" y="348" width="50" height="40" rx="4" fill="#1d4ed8" />
      <rect x="248" y="348" width="2" height="40" fill="white" opacity="0.1" />

      {/* Right building – pale teal */}
      <rect x="348" y="238" width="80" height="150" rx="8" fill="#bfdbfe" />
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
      <rect x="314" y="112" width="18" height="2.5" rx="1.25" fill="#2563eb" />
      <rect x="314" y="118" width="18" height="2.5" rx="1.25" fill="#2563eb" opacity="0.5" />
      <rect x="314" y="124" width="12" height="2.5" rx="1.25" fill="#2563eb" opacity="0.3" />
      <rect x="344" y="108" width="88" height="9" rx="4.5" fill="#eff6ff" />
      <rect x="344" y="122" width="66" height="7" rx="3.5" fill="#e2e8f0" />
      <rect x="310" y="150" width="70" height="22" rx="11" fill="#2563eb" />
      <circle cx="402" cy="151" r="14" fill="#dcfce7" />
      <path d="M396 151 L400.5 155.5 L409 144" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Floating approved pill */}
      <rect x="40" y="146" width="124" height="48" rx="24" fill="white" filter="url(#pill-glow)" />
      <circle cx="64" cy="170" r="14" fill="#dcfce7" />
      <path d="M58 170 L62.5 175 L71.5 163" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="84" y="162" width="66" height="9" rx="4.5" fill="#f0fdf4" />
      <rect x="84" y="175" width="50" height="7" rx="3.5" fill="#dcfce7" />

      {/* Decorative dots */}
      <circle cx="440" cy="96" r="10" fill="#bfdbfe" opacity="0.55" />
      <circle cx="458" cy="126" r="6" fill="#93c5fd" opacity="0.4" />
      <circle cx="420" cy="140" r="5" fill="#dbeafe" opacity="0.8" />
      <circle cx="50" cy="330" r="7" fill="#93c5fd" opacity="0.32" />
      <circle cx="156" cy="164" r="5" fill="#60a5fa" opacity="0.3" />
    </svg>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { lang, toggleLang } = useLang();

  const content = {
    ar: {
      siteName: "عِمارة",
      login: "تسجيل الدخول",
      chip: "منصة سعودية · سكني وتجاري",
      heroTitle: "عِمارة،",
      heroHighlight: "عمارتك، مُدارة بكفاءة",
      heroDesc:
        "منصة تربط ملاك العقارات السكنية والتجارية بمقدمي خدمات النظافة وإدارة المرافق الموثوقين. انشر احتياجاتك، واستلم عروضاً تنافسية، وتعاقد مع الأفضل.",
      getStarted: "ابدأ مجاناً",
      learnMore: "اعرف المزيد",
      stat1Num: "500+",
      stat1Label: "عقار مسجل",
      stat2Num: "150+",
      stat2Label: "مزود موثوق",
      stat3Num: "2,000+",
      stat3Label: "طلب منجز",
      whoTitle: "من يستفيد من عِمارة؟",
      whoSubtitle: "سواء كنت مالك مبنى سكني أو تجاري، عِمارة تُيسّر عليك إدارة مرافقك",
      residentialTitle: "المباني السكنية",
      residentialItems: ["أبراج سكنية ومجمعات", "فلل وملاحق", "خدمات نظافة يومية", "صيانة دورية للمرافق"],
      commercialTitle: "المباني التجارية",
      commercialItems: ["مكاتب وأبراج تجارية", "مراكز تسوق ومحلات", "مستودعات ومصانع", "HVAC · مصاعد · مواقف · إطفاء"],
      startNow: "ابدأ الآن",
      howItWorksTitle: "كيف تعمل المنصة",
      howItWorksDesc: "العثور على مزود الخدمة المناسب لم يكن أسهل من أي وقت مضى. ابدأ في دقائق.",
      step1Title: "أضف عقارك",
      step1Desc: "أضف تفاصيل مبناك (سكني أو تجاري) والخدمات التي تحتاجها",
      step2Title: "احصل على عروض",
      step2Desc: "مقدمو الخدمات المؤهلون يقدمون عروضهم على طلباتك",
      step3Title: "قارن واختر",
      step3Desc: "راجع العروض واختر أفضل مزود خدمة مناسب لك",
      providerCTATitle: "هل أنت مزود خدمة؟",
      providerCTADesc: "انضم إلى عِمارة للعثور على عملاء جدد، والمزايدة على المشاريع، وتنمية عملك.",
      joinProvider: "انضم كمزود خدمة",
      providerLogin: "تسجيل دخول مزود",
      quickLinks: "روابط سريعة",
      contactUs: "اتصل بنا",
      joinAsProvider: "انضم كمزود",
      viewDemo: "دليل المنصة",
      footerTagline: "عمارتك، مُدارة بشكل مثالي",
      footerCopyright: "© 2025 عِمارة. جميع الحقوق محفوظة.",
    },
    en: {
      siteName: "EMARAA",
      login: "Login",
      chip: "Saudi Platform · Residential & Commercial",
      heroTitle: "EMARAA,",
      heroHighlight: "Your Building, Perfectly Managed",
      heroDesc:
        "Connecting residential and commercial property owners with trusted cleaning and facility management providers. Post your needs, receive competitive quotes, and contract the best.",
      getStarted: "Get Started Free",
      learnMore: "Learn More",
      stat1Num: "500+",
      stat1Label: "Properties",
      stat2Num: "150+",
      stat2Label: "Trusted Providers",
      stat3Num: "2,000+",
      stat3Label: "Completed Requests",
      whoTitle: "Who is EMARAA for?",
      whoSubtitle: "Whether you own a residential or commercial building, EMARAA streamlines your facility management",
      residentialTitle: "Residential Buildings",
      residentialItems: ["Apartment towers & complexes", "Villas & annexes", "Daily cleaning services", "Periodic facility maintenance"],
      commercialTitle: "Commercial Buildings",
      commercialItems: ["Office towers & commercial buildings", "Shopping centers & retail", "Warehouses & factories", "HVAC · Elevators · Parking · Fire systems"],
      startNow: "Get Started",
      howItWorksTitle: "How It Works",
      howItWorksDesc: "Finding the right service provider has never been easier. Get started in minutes.",
      step1Title: "List Your Property",
      step1Desc: "Add your building details (residential or commercial) and the services you need",
      step2Title: "Get Matched",
      step2Desc: "Qualified service providers bid on your requests",
      step3Title: "Compare & Choose",
      step3Desc: "Review bids and select the best provider for you",
      providerCTATitle: "Are You a Service Provider?",
      providerCTADesc: "Join EMARAA to find new clients, bid on projects, and grow your business.",
      joinProvider: "Join as Service Provider",
      providerLogin: "Provider Login",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      joinAsProvider: "Join as Provider",
      viewDemo: "Platform Guide",
      footerTagline: "Your Building, Perfectly Managed",
      footerCopyright: "© 2025 EMARAA. All rights reserved.",
    },
  };

  const t = content[lang];
  const isRTL = lang === "ar";

  return (
    <div className="page-enter min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
              {t.siteName}
            </span>
            <nav className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLang}
                className="text-gray-600 hover:text-blue-600 gap-1.5"
              >
                <Globe className="h-4 w-4" />
                {lang === "ar" ? "EN" : "عربي"}
              </Button>
              <Link href="/auth?mode=login">
                <Button variant="outline" size="sm" className="text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600">
                  {t.login}
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

            {/* Text side */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full tracking-wide">
                  {t.chip}
                </span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-3">
                  {t.heroTitle}
                </h1>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-600 leading-tight">
                  {t.heroHighlight}
                </h1>
              </div>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                {t.heroDesc}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/auth?role=owner">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 active:scale-95 transition-transform shadow-md hover:shadow-lg">
                    {t.getStarted}
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 px-8"
                  onClick={() => {
                    const el = document.getElementById("how-it-works");
                    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                  }}
                >
                  {t.learnMore}
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

      {/* TODO: add social proof strip when real numbers are ready */}

      {/* ── Who benefits ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t.whoTitle}</h2>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">{t.whoSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Residential */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                  <Home className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t.residentialTitle}</h3>
                <ul className="space-y-2.5 mb-6">
                  {t.residentialItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-[10px] font-bold">✓</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?role=owner">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform">
                    {t.startNow}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Commercial */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
                  <Building2 className="w-7 h-7 text-amber-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t.commercialTitle}</h3>
                <ul className="space-y-2.5 mb-6">
                  {t.commercialItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-[10px] font-bold">✓</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?role=owner">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 transition-transform">
                    {t.startNow}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t.howItWorksTitle}</h2>
            <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto">{t.howItWorksDesc}</p>
          </div>

          {/* Steps */}
          <div className="max-w-4xl mx-auto">

            <div className="grid lg:grid-cols-3 gap-16 lg:gap-8">
              {[
                { num: "1", icon: ClipboardList, title: t.step1Title, desc: t.step1Desc },
                { num: "2", icon: Search,        title: t.step2Title, desc: t.step2Desc },
                { num: "3", icon: BarChart3,      title: t.step3Title, desc: t.step3Desc },
              ].map(({ num, icon: Icon, title, desc }) => (
                <div key={num} className="flex flex-col items-center text-center lg:items-center">
                  {/* Icon */}
                  <Icon className="w-12 h-12 text-blue-500 mb-4" strokeWidth={1.25} />
                  {/* Big step number */}
                  <span className="text-7xl font-extrabold text-blue-500 leading-none mb-5 tracking-tight">
                    {num}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Provider CTA ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Wrench className="w-12 h-12 text-green-500 mx-auto mb-6" strokeWidth={1.25} />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t.providerCTATitle}</h2>
            <p className="text-base md:text-lg text-gray-500 mb-10 max-w-xl mx-auto">{t.providerCTADesc}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/auth?role=provider">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-10 active:scale-95 transition-transform">
                  <Users className="h-4 w-4 me-2" />
                  {t.joinProvider}
                </Button>
              </Link>
              <Link href="/auth?role=provider&mode=login">
                <Button size="lg" variant="outline" className="border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-600 px-10">
                  {t.providerLogin}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xl font-extrabold text-blue-600 mb-2">{t.siteName}</p>
              <p className="text-sm text-gray-500">{t.footerTagline}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t.quickLinks}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  <Link href="/contact">{t.contactUs}</Link>
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  <Link href="/auth?role=provider">{t.joinAsProvider}</Link>
                </li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  <a href="/Emaraa-Demo.html" target="_blank" rel="noopener noreferrer">{t.viewDemo}</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">{t.footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
