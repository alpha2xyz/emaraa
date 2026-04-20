import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/use-lang";
import { Link } from "wouter";
import {
  Building2,
  Users,
  FileText,
  Globe,
  ClipboardList,
  Search,
  BarChart3,
  CheckCircle2,
  Wrench,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function LandingPage() {
  const { lang, toggleLang } = useLang();

  const content = {
    ar: {
      siteName: "عِمارة",
      login: "تسجيل الدخول",
      registerOwner: "تسجيل كمالك",
      heroTitle: "عِمارة،",
      heroHighlight: "عمارتك، مُدارة بكفاءة",
      heroDesc:
        "عِمارة هي منصة تربط ملاك العقارات بمقدمي خدمات الصيانة والنظافة الموثوقين. انشر احتياجاتك، واستلم عروضاً تنافسية، ووظف الأفضل - كل ذلك في مكان واحد.",
      getStarted: "ابدأ مجاناً",
      learnMore: "اعرف المزيد",
      howItWorksTitle: "كيف تعمل المنصة",
      howItWorksDesc:
        "العثور على مزود الخدمة المناسب لم يكن أسهل من أي وقت مضى. ابدأ في دقائق واحصل على عروض من المحترفين لعمارتك.",
      step1Title: "أضف عقارك",
      step1Desc: "أضف تفاصيل المبنى والخدمات التي تحتاجها",
      step2Title: "احصل على عروض",
      step2Desc: "مقدمو الخدمات المؤهلون يقدمون عروضهم على طلباتك",
      step3Title: "قارن واختر",
      step3Desc: "راجع العروض واختر أفضل مزود خدمة مناسب لك",

      providerCTATitle: "هل أنت مزود خدمة؟",
      providerCTADesc:
        "انضم إلى عمارة للعثور على عملاء جدد، والمزايدة على المشاريع، وتنمية عملك. احصل على عقود إدارة عقارات ثابتة.",
      joinProvider: "انضم كمزود خدمة",
      providerLogin: "تسجيل دخول مزود خدمة",
      footerTagline: "عمارة - مبناك، مُدار بشكل مثالي",
      quickLinks: "روابط سريعة",
      contactUs: "اتصل بنا",
      joinAsProvider: "انضم كمزود",
      contactEmail: "alpha2xyz+admin@gmail.com",
      contactPhone: "+966 543 9776 799",
      contactLocation: "الرياض، المملكة العربية السعودية",
      followUs: "تابعنا",
      stayUpdated: "ابق على اطلاع بآخر الأخبار",
      adminLogin: "دخول آدمن",
      footerCopyright: "© 2025 عمارة. جميع الحقوق محفوظة.",
    },
    en: {
      siteName: "EMARAA",
      login: "Login",
      registerOwner: "Register as Owner",
      heroTitle: "Your Building,",
      heroHighlight: "Perfectly Managed",
      heroDesc:
        "EMARAA connects property owners with trusted cleaning and maintenance providers. Post your needs, receive competitive bids, and hire the best - all in one place.",
      getStarted: "Get Started Free",
      learnMore: "Learn More",
      howItWorksTitle: "How It Works",
      howItWorksDesc:
        "Finding the right service provider has never been easier. Get started in minutes and have professionals bidding on your project.",
      step1Title: "List Your Property",
      step1Desc: "Add your building details and the services you need",
      step2Title: "Get Matched",
      step2Desc: "Qualified service providers bid on your requests",
      step3Title: "Compare & Choose",
      step3Desc: "Review bids and select the best provider for you",

      providerCTATitle: "Are You a Service Provider?",
      providerCTADesc:
        "Join EMARAA to find new clients, bid on projects, and grow your business. Access a steady stream of property management contracts.",
      joinProvider: "Join as Service Provider",
      providerLogin: "Provider Login",
      footerTagline: "EMARA - Your Building, Perfectly Managed",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      joinAsProvider: "Join as Provider",
      contactEmail: "alpha2xyz+admin@gmail.com",
      contactPhone: "+966 543 9776 799",
      contactLocation: "Riyadh, Saudi Arabia",
      followUs: "Follow Us",
      stayUpdated: "Stay updated with latest news",
      adminLogin: "Admin Login",
      footerCopyright: "© 2025 EMARAA. All rights reserved.",
    },
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-gray-800 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-400">
                {t.siteName}
              </span>
            </div>

            <nav className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLang}
                className="text-white hover:text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {lang === "ar" ? "العربية" : "English"}
              </Button>
              <Link href="/auth?mode=login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-gray-700 border border-gray-600"
                >
                  {t.login}
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 via-gray-50 to-white py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-relaxed">
            {t.heroTitle}
            <br />
            <span className="text-blue-600 mt-4 inline-block">{t.heroHighlight}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth?role=owner">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {t.getStarted}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-400 text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 px-8 bg-white"
              onClick={() => {
                const element = document.getElementById("how-it-works");
                if (element) {
                  const offsetTop = element.offsetTop - 100;
                  window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth",
                  });
                }
              }}
            >
              {t.learnMore}
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.howItWorksTitle}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              {t.howItWorksDesc}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <Card className="relative pt-6 bg-white hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 group overflow-visible">
              <div className="absolute -top-4 start-6 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <CardContent className="text-center p-6 pt-2 bg-white">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <ClipboardList
                    className="w-10 h-10 text-blue-600"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {t.step1Title}
                </h3>
                <p className="text-sm text-gray-600">{t.step1Desc}</p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative pt-6 bg-white hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 group overflow-visible">
              <div className="absolute -top-4 start-6 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <CardContent className="text-center p-6 pt-2 bg-white">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Search
                    className="w-10 h-10 text-blue-600"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {t.step2Title}
                </h3>
                <p className="text-sm text-gray-600">{t.step2Desc}</p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative pt-6 bg-white hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 group overflow-visible">
              <div className="absolute -top-4 start-6 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <CardContent className="text-center p-6 pt-2 bg-white">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <BarChart3
                    className="w-10 h-10 text-blue-600"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">
                  {t.step3Title}
                </h3>
                <p className="text-sm text-gray-600">{t.step3Desc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Provider CTA */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Wrench className="w-12 h-12 text-green-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.providerCTATitle}
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-8">
              {t.providerCTADesc}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth?role=provider">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white border-0 px-10 shadow-lg"
                >
                  <Users className="h-5 w-5 me-2" />
                  {t.joinProvider}
                </Button>
              </Link>
              <Link href="/auth?role=provider&mode=login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-10"
                >
                  {t.providerLogin}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-3">
                {t.siteName}
              </h3>
              <p className="text-sm text-gray-600">{t.footerTagline}</p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {t.quickLinks}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">
                  <Link href="/contact">{t.contactUs}</Link>
                </li>
                <li className="hover:text-blue-600 cursor-pointer">
                  <Link href="/auth?role=provider">{t.joinAsProvider}</Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {t.contactUs}
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" strokeWidth={2} />
                  {t.contactEmail}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" strokeWidth={2} />
                  {t.contactPhone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" strokeWidth={2} />
                  {t.contactLocation}
                </p>
              </div>
            </div>

            {/* Column 4 - مخفي مؤقتاً
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{t.followUs}</h4>
                      <p className="text-sm text-gray-600 mb-3">{t.stayUpdated}</p>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded hover:bg-blue-600 transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 bg-gray-300 rounded hover:bg-blue-600 transition-colors cursor-pointer"></div>
                        <div className="w-8 h-8 bg-gray-300 rounded hover:bg-blue-600 transition-colors cursor-pointer"></div>
                      </div>
                    </div>
                    */}
          </div>

          <div className="border-t border-gray-300 pt-6 text-center">
            <p className="text-sm text-gray-600">{t.footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
