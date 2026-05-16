import { useLang } from "@/hooks/use-lang";
import { Building2, ShieldCheck, Phone, Mail } from "lucide-react";

export default function AboutPage() {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#2E4A6B] to-[#1A2E42] text-white py-16 px-6 text-center">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-3">
          {isRTL ? "عِماره" : "Emaraa"}
        </h1>
        <p className="text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
          {isRTL
            ? "سوق B2B سعودي يربط ملّاك العقارات بمزودي خدمات إدارة المرافق الموثوقين"
            : "Saudi B2B marketplace connecting property owners with trusted facility management providers"}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isRTL ? "مهمتنا" : "Our Mission"}
          </h2>
          <p className="text-gray-600 leading-relaxed text-base">
            {isRTL
              ? "نؤمن بأن كل عقار سكني يستحق إدارة مرافق احترافية وشفافة. عِماره تُبسّط العملية: المالك يرفع طلبه، ومزودو الخدمات المعتمدون يتقدمون بعروضهم، والمالك يختار الأنسب — كل ذلك في مكان واحد وبدون وسيط."
              : "We believe every residential property deserves professional, transparent facility management. Emaraa simplifies the process: owners post their requests, vetted providers submit proposals, and owners choose the best fit — all in one place, no middlemen."}
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isRTL ? "كيف تعمل المنصة؟" : "How It Works"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "١",
                ar: "المالك يسجّل عقاره",
                en: "Owner registers property",
              },
              {
                step: "٢",
                ar: "مزودو الخدمات يرسلون عروضهم بصيغة PDF",
                en: "Providers submit PDF proposals",
              },
              {
                step: "٣",
                ar: "المالك يقبل العرض الأنسب ويتواصل مباشرة",
                en: "Owner accepts the best offer and connects directly",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-[#EEF2F7] flex items-center justify-center mx-auto mb-3 text-[#2E4A6B] font-bold text-lg">
                  {item.step}
                </div>
                <p className="text-gray-700 text-sm font-medium">{isRTL ? item.ar : item.en}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Verification */}
        <section className="bg-[#EEF2F7] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-[#2E4A6B]" />
            <h2 className="text-xl font-bold text-gray-900">
              {isRTL ? "التحقق من مزودي الخدمات" : "Provider Verification"}
            </h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isRTL
              ? "كل مزود خدمة يمر بمراجعة يدوية من فريق عِماره قبل الموافقة. نتحقق من السجل التجاري، بروفايل الشركة، ورخصة فال — لضمان أن الملاك يتعاملون فقط مع شركات موثوقة."
              : "Every service provider undergoes manual review by the Emaraa team before approval. We verify the commercial register, company profile, and FAL license — ensuring owners only deal with trusted companies."}
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isRTL ? "تواصل معنا" : "Contact Us"}
          </h2>
          <div className="space-y-4">
            <a
              href="mailto:info@emaraa.sa"
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
            >
              <Mail className="w-5 h-5 text-[#2E4A6B]" />
              <div>
                <p className="text-xs text-gray-500">{isRTL ? "البريد الإلكتروني" : "Email"}</p>
                <p className="font-medium text-gray-800">info@emaraa.sa</p>
              </div>
            </a>
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 hover:shadow-md transition-shadow"
            >
              <Phone className="w-5 h-5 text-[#2E4A6B]" />
              <div>
                <p className="text-xs text-gray-500">WhatsApp</p>
                <p className="font-medium text-gray-800">
                  {isRTL ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* Focus note */}
        <section className="border-t border-gray-100 pt-8 text-center">
          <p className="text-sm text-gray-400">
            {isRTL
              ? "عِماره متاحة حالياً للعقارات السكنية في الرياض • النطاق يتوسع بعد أكتوبر 2026"
              : "Emaraa is currently available for residential properties in Riyadh • Coverage expanding after October 2026"}
          </p>
        </section>
      </div>
    </div>
  );
}
