import { useLang } from "@/hooks/use-lang";
import { ShieldCheck, Building2, Users, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF]" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1A2E42] via-[#2E4A6B] to-[#3A6A9E] text-white py-10 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight">
            {isRTL ? "بُنيت لأن الطريقة القديمة لم تعد تكفي" : "Built Because the Old Way Wasn't Good Enough"}
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            {isRTL
              ? "إدارة عقارك لا ينبغي أن تبدأ بـ \"من يعرف شركة نظافة موثوقة؟\" في مجموعة واتساب."
              : "Managing your building shouldn't start with \"does anyone know a reliable cleaning company?\" in a WhatsApp group."}
          </p>
        </div>
      </div>

      {/* ── Why Emaraa ── */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            {isRTL ? "لماذا عِمارة؟" : "Why Emaraa?"}
          </h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            {isRTL
              ? "في السوق السعودي، مالك العقار يجد مزود الخدمة بالمعارف أو الصدفة. لا مقارنة، لا توثيق، لا ضمان. عِمارة بُنيت لتغيير هذا."
              : "In the Saudi market, property owners find service providers through connections or chance. No comparison, no documentation, no guarantee. Emaraa was built to change that."}
          </p>
        </div>

        {/* Problem → Solution cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            {
              icon: "📋",
              ar: { title: "عروض مكتوبة لا شفهية", body: "كل مزود يُقدّم عرضه بصيغة PDF رسمية — لا وعود شفهية، لا مفاجآت في السعر." },
              en: { title: "Written Offers, Not Verbal", body: "Every provider submits a formal PDF proposal — no verbal promises, no price surprises." },
            },
            {
              icon: "🛡️",
              ar: { title: "مزودون مُتحقَّق منهم فقط", body: "كل شركة تمر بمراجعة يدوية: سجل تجاري، بروفايل، ورخصة فال — قبل أي تواصل مع المُلاك." },
              en: { title: "Verified Providers Only", body: "Every company goes through manual review: commercial register, profile, and FAL license — before any contact with owners." },
            },
            {
              icon: "⚖️",
              ar: { title: "المقارنة بين يديك", body: "تصلك عروض متعددة على نفس الطلب — تختار بمعلومة كاملة، لا بـ \"هذا اللي أعرفه\"." },
              en: { title: "Comparison Is Yours", body: "Multiple offers arrive for the same request — you choose with full information, not just 'who I know'." },
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">{isRTL ? item.ar.title : item.en.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{isRTL ? item.ar.body : item.en.body}</p>
            </div>
          ))}
        </div>

        {/* ── Values ── */}
        <div className="bg-[#1A2E42] rounded-2xl p-8 text-white mb-16">
          <h2 className="text-2xl font-extrabold mb-6 text-center">
            {isRTL ? "ما الذي نؤمن به" : "What We Stand For"}
          </h2>
          <div className="space-y-5">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                ar: { title: "الثقة تُبنى بالتوثيق", body: "لا نثق بالكلام — كل مزود معنا يُثبت هويته ورخصته قبل أن يصل للمُلاك." },
                en: { title: "Trust Is Built With Documentation", body: "We don't take anyone's word for it — every provider proves their identity and license before reaching owners." },
              },
              {
                icon: <Sparkles className="w-5 h-5" />,
                ar: { title: "الشفافية في كل خطوة", body: "السعر مكتوب، العرض مرفوع، القرار للمالك. لا عمولات مخفية، لا وسطاء بينك وبين المزود." },
                en: { title: "Transparency at Every Step", body: "Price is written, offer is uploaded, decision is yours. No hidden fees, no middlemen between you and the provider." },
              },
              {
                icon: <Building2 className="w-5 h-5" />,
                ar: { title: "سعودية الهوية", body: "منصة بُنيت في الرياض، لفهم طبيعة السوق السعودي، ومتطلبات التراخيص المحلية، وخصوصية قطاع العقارات في المملكة." },
                en: { title: "Saudi by Identity", body: "A platform built in Riyadh, understanding the Saudi market, local licensing requirements, and the specifics of the Kingdom's real estate sector." },
              },
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {v.icon}
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{isRTL ? v.ar.title : v.en.title}</p>
                  <p className="text-blue-200 text-xs leading-relaxed">{isRTL ? v.ar.body : v.en.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Market Numbers ── */}
        <div className="mb-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">
            {isRTL ? "الفرصة في الرياض" : "The Riyadh Opportunity"}
          </h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            {isRTL ? "أرقام رسمية — هذا هو السوق الذي ينتظرك" : "Official figures — this is the market waiting for you"}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: "+700K", label: isRTL ? "وحدة سكنية في الرياض" : "Residential units in Riyadh", src: isRTL ? "إحصاء 2022" : "Census 2022" },
              { num: "9,354", label: isRTL ? "جمعية ملاك نشطة في المملكة" : "Active owners associations in KSA", src: "REGA 2024" },
              { num: "3.4%", label: isRTL ? "نمو سكاني سنوي في الرياض" : "Annual population growth in Riyadh", src: isRTL ? "الهيئة العامة للإحصاء" : "GASTAT" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-2xl font-extrabold text-[#2E4A6B] mb-1" style={{ fontFamily: "Tajawal, sans-serif" }}>{s.num}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
                <p className="text-[10px] text-gray-300 mt-1">{s.src}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Founder Note ── */}
        <div className="bg-[#EEF2F7] rounded-2xl p-7 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#2E4A6B] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{isRTL ? "من المؤسس" : "From the Founder"}</p>
              <p className="text-xs text-gray-400">{isRTL ? "عبدالله الفرائضي — الرياض" : "Abdallah Alfaraidi — Riyadh"}</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isRTL
              ? "\"بنيت عِمارة لأني رأيت كيف يتعامل الملاك مع مزودي الخدمات — رسائل متناثرة في واتساب، أسعار شفهية، وثقة مبنية على الحظ. أردت أن يكون هناك مكان واحد، منظّم، يُعطي المالك خيارات حقيقية ويُعطي المزود الجيّد فرصة حقيقية. هذه هي عِمارة.\""
              : "\"I built Emaraa because I saw how owners dealt with service providers — scattered WhatsApp messages, verbal prices, and trust built on luck. I wanted one organized place that gives owners real choices and gives good providers a real chance. That's Emaraa.\""}
          </p>
        </div>

        {/* ── CTA ── */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-5">
            {isRTL ? "هل لديك عقار سكني في الرياض؟" : "Do you have a residential property in Riyadh?"}
          </p>
          <Link href="/auth">
            <button className="bg-[#2E4A6B] hover:bg-[#1A2E42] text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
              {isRTL ? "ابدأ مجاناً" : "Get Started Free"}
            </button>
          </Link>
        </div>
      </div>

      {/* ── Saudi Made badge ── */}
      <div className="flex justify-end px-6 pb-6">
        <img
          src="https://www.tameeni.com/images/saudi-made-ar.png"
          alt="صنع في السعودية"
          className="h-9 object-contain opacity-70"
        />
      </div>
    </div>
  );
}
