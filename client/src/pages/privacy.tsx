import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "../hooks/use-lang";
import { useReveal } from "../hooks/use-reveal";
import { useSeo } from "../hooks/use-seo";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";

type Section = { title: string; body: string[] };

const arSections: Section[] = [
  {
    title: "البيانات التي نجمعها",
    body: [
      "رقم الجوال: يُجمع عند التسجيل ويُستخدم للتحقق عبر رمز OTP، ويُشارك مع مزود الخدمة بعد قبول عرضه لغرض التواصل المباشر.",
      "الاسم الكامل: يُجمع عند إنشاء الحساب لعرضه في واجهة المنصة.",
      "بيانات مزود الخدمة: اسم الشركة، المدينة، البريد الإلكتروني، السجل التجاري (PDF)، ملف الشركة (PDF)، رخصة فال (PDF).",
      "بيانات العقار والطلبات: تفاصيل المبنى ونوعه وعنوانه وطلبات الخدمة التي ينشرها مالك العقار.",
      "العروض المقدَّمة: ملفات PDF للعروض التي يرفعها مزودو الخدمة.",
      "البيانات التقنية: بيانات الجلسة المُخزَّنة محلياً في المتصفح (localStorage) لإدارة الدخول والخروج.",
    ],
  },
  {
    title: "الأساس القانوني للمعالجة",
    body: [
      "تستند معالجة بياناتك إلى الأسس القانونية التالية وفق نظام حماية البيانات الشخصية (PDPL):",
      "• تنفيذ العقد: لتشغيل المنصة وتقديم الخدمات المطلوبة.",
      "• الالتزام القانوني: للامتثال لمتطلبات الجهات التنظيمية السعودية عند الاقتضاء.",
      "• الموافقة الصريحة: لأي استخدام يتجاوز نطاق تشغيل المنصة الأساسي.",
    ],
  },
  {
    title: "كيف نستخدم بياناتك",
    body: [
      "تشغيل المنصة وتمكين التواصل بين الملاك ومزودي الخدمة.",
      "إرسال رمز التحقق (OTP) عبر الرسائل النصية لتأكيد هوية المستخدم عند التسجيل والدخول.",
      "مراجعة طلبات تسجيل مزودي الخدمة من قِبل الإدارة والتحقق من صحة مستنداتهم.",
      "تحسين تجربة الاستخدام وتطوير ميزات المنصة استناداً إلى أنماط الاستخدام.",
      "قياس أثر حملاتنا الإعلانية عبر أدوات Google، بعد موافقتك، وذلك ببيانات تصفّح مجمّعة لا تتضمن اسمك ولا رقم جوالك (التفاصيل في بند ملفات تعريف الارتباط).",
      "لا نبيع بياناتك الشخصية، ولا نشاركها مع أطراف ثالثة لأغراضها التسويقية الخاصة.",
    ],
  },
  {
    title: "مشاركة البيانات والإفصاح",
    body: [
      "نحن لا نبيع ولا نؤجر بياناتك الشخصية لأي طرف ثالث لأغراض تجارية أو تسويقية.",
      "رقم جوالك يُرسَل إلى مزود الرسائل النصية (Authentica) حصراً لإيصال رمز OTP، ولا يُستخدم لأي غرض آخر.",
      "قد تُشارَك البيانات مع الجهات التنظيمية أو القضائية السعودية عند وجود التزام قانوني صريح.",
      "بيانات العقار والطلب تظهر لمزودي الخدمة المعتمدين فقط وذلك ضمن سياق الطلب والعروض المرتبطة به، ولا تتضمن رقم جوال المالك.",
      "لا يظهر رقم جوال المالك لأي مزود خدمة قبل قبول عرضه. وعند قبول المالك لعرض مزوّد، يُتبادَل رقم الجوال بين الطرفين (المالك والمزود المقبول عرضه) لغرض التواصل المباشر وإتمام التعاقد.",
      "المزود الذي لم يُقبل عرضه (سواء كان عرضه قيد المراجعة أو مرفوضاً) لا يحصل على رقم جوال المالك في أي حال.",
      "عروض مزودي الخدمة تظهر لأصحاب العقارات المعنيين فقط.",
    ],
  },
  {
    title: "تخزين البيانات والاحتفاظ بها",
    body: [
      "تُخزَّن البيانات في قواعد بيانات Supabase على خوادم سحابية في منطقة سيول بكوريا الجنوبية (ap-northeast-2)، وتُنقل بين جهازك وهذه الخوادم عبر اتصال مشفّر.",
      "ملفات PDF تُخزَّن في Supabase Storage وتُتاح عبر روابط موقتة (مدة صلاحيتها ساعة واحدة).",
      "رموز OTP مؤقتة وتنتهي صلاحيتها خلال 5 دقائق.",
      "جلسات تسجيل الدخول تنتهي تلقائياً بعد 30 يوماً.",
      "نحتفظ ببياناتك طالما كان حسابك نشطاً؛ وعند طلب الحذف تُزال البيانات الشخصية خلال مدة معقولة وفق نظام PDPL.",
    ],
  },
  {
    title: "خدمة الرسائل النصية (OTP)",
    body: [
      "يُرسَل رمز التحقق عبر شركة Authentica (portal.authentica.sa) وهي مزود سعودي مرخّص للرسائل النصية.",
      "رقم جوالك يُرسَل إلى Authentica حصراً لغرض إيصال الرمز ولا يُستخدم لأي غرض تسويقي أو تجاري.",
      "إنشاء حسابك يُعدّ موافقةً على تلقّي رمز التحقق (OTP) عبر رسالة نصية.",
    ],
  },
  {
    title: "ملفات تعريف الارتباط (Cookies)",
    body: [
      "تستخدم المنصة ملفات تعريف ارتباط أساسية لضمان عمل الجلسات وتوفير تجربة استخدام سلسة، وهذه الملفات لازمة لتشغيل المنصة ولا تحتاج موافقتك.",
      "تستخدم المنصة أيضاً أدوات من Google (Google Ads وGoogle Analytics عبر Google Tag Manager) لقياس أثر حملاتنا الإعلانية ومعرفة كيف يصل الزوار إلينا. قد تضع هذه الأدوات ملفات تعريف ارتباط تحليلية وإعلانية، بما فيها ملفات إعادة الاستهداف.",
      "لا تعمل هذه الأدوات إلا بعد موافقتك الصريحة من شريط الموافقة الذي يظهر عند أول زيارة. إن اخترت «الأساسية فقط» فلن تُخزَّن أي ملفات تحليلية أو إعلانية.",
      "لا نبيع بياناتك الشخصية، ولا نشارك اسمك أو رقم جوالك مع أي معلن.",
      "يمكنك تغيير اختيارك في أي وقت بمسح بيانات الموقع من متصفحك، كما يمكنك ضبط إعدادات المتصفح لرفض ملفات تعريف الارتباط، مع الأخذ بعين الاعتبار أن ذلك قد يؤثر على بعض وظائف المنصة.",
    ],
  },
  {
    title: "الإشعار بحوادث البيانات",
    body: [
      "في حال وقوع أي حادثة تتعلق بأمن البيانات، تلتزم عِمارة بإخطار الجهات التنظيمية المختصة والمستخدمين المتأثرين وفق ما تقتضيه الأنظمة السارية.",
      "نتخذ إجراءات فورية للحد من أثر أي اختراق وإصلاح الثغرات المكتشفة.",
    ],
  },
  {
    title: "حقوقك وفق نظام PDPL",
    body: [
      "وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL) يحق لك:",
      "• الاطلاع على بياناتك الشخصية المخزَّنة لدينا.",
      "• طلب تصحيح أي بيانات غير دقيقة.",
      "• طلب حذف حسابك وبياناتك الشخصية.",
      "• الاعتراض على معالجة بياناتك في الحالات التي لا يستند فيها المعالجة إلى التزام قانوني.",
      "• طلب تقييد معالجة بياناتك في الحالات المحددة نظاماً.",
      "لممارسة أي من هذه الحقوق تواصل معنا عبر البريد الإلكتروني أدناه.",
    ],
  },
  {
    title: "تحديثات السياسة",
    body: [
      "قد نُحدِّث هذه السياسة دورياً لمواكبة التغييرات التنظيمية أو التقنية.",
      "سيتم الإعلان عن أي تغييرات جوهرية عبر المنصة أو عبر البريد الإلكتروني المسجَّل.",
      "استمرارك في استخدام المنصة بعد التحديث يُعدّ موافقةً على السياسة المحدَّثة.",
    ],
  },
  {
    title: "التواصل بشأن الخصوصية",
    body: [
      "أي استفسار أو طلب متعلق بخصوصيتك يُرسَل إلى: info@emaraa.app",
      "آخر تحديث لهذه السياسة: مايو 2026.",
    ],
  },
];

const enSections: Section[] = [
  {
    title: "Data We Collect",
    body: [
      "Mobile number: collected at registration, used for OTP verification, and shared with the service provider after their offer is accepted for direct contact.",
      "Full name: collected at account creation and displayed within the platform interface.",
      "Provider data: company name, city, email, commercial registration (PDF), company profile (PDF), FAL license (PDF).",
      "Property and request data: building details, type, address, and service requests posted by property owners.",
      "Submitted offers: PDF files uploaded by service providers.",
      "Technical data: session data stored locally in the browser (localStorage) to manage login and logout.",
    ],
  },
  {
    title: "Legal Basis for Processing",
    body: [
      "Processing of your data is based on the following legal grounds under the Saudi Personal Data Protection Law (PDPL):",
      "• Contract performance: to operate the platform and deliver the requested services.",
      "• Legal obligation: to comply with Saudi regulatory requirements when applicable.",
      "• Explicit consent: for any use beyond core platform operation.",
    ],
  },
  {
    title: "How We Use Your Data",
    body: [
      "To operate the platform and enable communication between owners and service providers.",
      "To send OTP verification codes via SMS to confirm user identity at registration and login.",
      "To allow administration to review service provider registration requests and verify their documents.",
      "To improve user experience and develop platform features based on usage patterns.",
      "Measuring how our advertising campaigns perform, using Google tools and only with your consent, based on aggregated browsing data that does not include your name or phone number (see the Cookies section for details).",
      "We do not sell your personal data, and we do not share it with third parties for their own marketing purposes.",
    ],
  },
  {
    title: "Data Sharing & Disclosure",
    body: [
      "We do not sell or rent your personal data to any third party for commercial or marketing purposes.",
      "Your mobile number is sent to the SMS provider (Authentica) solely to deliver the OTP code and is not used for any other purpose.",
      "Data may be shared with Saudi regulatory or judicial authorities when there is a clear legal obligation.",
      "Property owner data is visible only to approved service providers within the context of the relevant request and associated proposals, and does not include the owner's phone number.",
      "The owner's phone number is not shown to any service provider before their offer is accepted. Once the owner accepts a provider's offer, phone numbers are exchanged between both parties (the owner and the accepted provider) for direct contact and to complete the contract.",
      "A provider whose offer was not accepted (whether still under review or rejected) never receives the owner's phone number, under any circumstances.",
      "Provider proposals are visible only to the relevant property owners.",
    ],
  },
  {
    title: "Data Storage & Retention",
    body: [
      "Data is stored in Supabase databases on cloud servers in the Seoul, South Korea region (ap-northeast-2), and travels between your device and those servers over an encrypted connection.",
      "PDF files are stored in Supabase Storage and accessed via temporary signed URLs (1-hour validity).",
      "OTP codes are temporary and expire within 5 minutes.",
      "Login sessions expire automatically after 30 days.",
      "We retain your data for as long as your account is active; upon a deletion request, personal data is removed within a reasonable period in accordance with PDPL.",
    ],
  },
  {
    title: "SMS Service (OTP)",
    body: [
      "Verification codes are delivered via Authentica (portal.authentica.sa), a licensed Saudi-native SMS provider.",
      "Your mobile number is sent to Authentica solely for the purpose of delivering the code and is not used for any marketing or commercial purpose.",
      "Creating an account constitutes consent to receiving a one-time SMS verification code (OTP).",
    ],
  },
  {
    title: "Cookies",
    body: [
      "The platform uses essential cookies to maintain sessions and provide a smooth user experience. These are required to run the platform and do not need your consent.",
      "The platform also uses Google tools (Google Ads and Google Analytics, via Google Tag Manager) to measure how our advertising campaigns perform and how visitors reach us. These tools may set analytics and advertising cookies, including remarketing cookies.",
      "None of these tools run until you give explicit consent through the banner shown on your first visit. If you choose \"Essential only\", no analytics or advertising cookies are stored.",
      "We do not sell your personal data, and we never share your name or phone number with any advertiser.",
      "You can change your choice at any time by clearing this site's data in your browser. You can also configure your browser to reject cookies, though doing so may affect some platform functionality.",
    ],
  },
  {
    title: "Data Breach Notification",
    body: [
      "In the event of any data security incident, EMARAA is committed to notifying the relevant regulatory authorities and affected users as required by applicable law.",
      "We take immediate action to contain the impact of any breach and address discovered vulnerabilities.",
    ],
  },
  {
    title: "Your Rights under PDPL",
    body: [
      "Under the Saudi Personal Data Protection Law (PDPL) you have the right to:",
      "• Access your personal data stored with us.",
      "• Request correction of any inaccurate data.",
      "• Request deletion of your account and personal data.",
      "• Object to the processing of your data in cases where processing is not based on a legal obligation.",
      "• Request restriction of your data processing in legally specified cases.",
      "To exercise any of these rights, contact us via the email address below.",
    ],
  },
  {
    title: "Policy Updates",
    body: [
      "We may update this policy periodically to keep pace with regulatory or technical changes.",
      "Any material changes will be announced on the platform or via the registered email address.",
      "Continued use of the platform after an update constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "Privacy Contact",
    body: [
      "Any privacy-related inquiries or requests should be sent to: info@emaraa.app",
      "Last updated: May 2026.",
    ],
  },
];

export default function PrivacyPage() {
  const { lang, setLang } = useLang();
  const isRTL = lang === "ar";
  const sections = isRTL ? arSections : enSections;
  useSeo({
    title: "سياسة الخصوصية | عِمارة",
    description: "كيف تتعامل منصة عِمارة مع بياناتك وخصوصيتك: رقمك لا يظهر لأي جهة إلا بعد موافقتك.",
    path: "/privacy",
  });
  useReveal([lang]);

  const labels = {
    ar: {
      title: "سياسة الخصوصية",
      subtitle: "نلتزم بحماية بياناتك الشخصية وفق نظام PDPL السعودي.",
      back: "العودة للرئيسية",
    },
    en: {
      title: "Privacy Policy",
      subtitle: "We are committed to protecting your personal data in accordance with Saudi PDPL.",
      back: "Back to Home",
    },
  };
  const l = labels[lang];

  return (
    <div className="page-enter min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <AmbientBackground />
      {/* Header strip */}
      <div
        style={{ background: "linear-gradient(135deg, #0f3a47, #193546)", borderBottom: "2px solid var(--owner)" }}
        className="text-white py-6 px-4 flex items-center justify-between"
        dir="rtl"
      >
        <p className="font-bold text-xl">عِمارة</p>
        <div className="text-start">
          <p className="text-xl font-bold">{isRTL ? "سياسة الخصوصية" : "Privacy Policy"}</p>
          <p className="text-sm opacity-75">Privacy Policy</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0DB8D3] transition-colors">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {l.back}
            </button>
          </Link>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="text-sm px-3 py-1 rounded-full border border-[#0DB8D3] text-[#0DB8D3] hover:bg-[#0DB8D3] hover:text-[#04222c] transition-colors"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
        </div>

        <h1 className="text-3xl font-extrabold text-foreground mb-2">{l.title}</h1>
        <p className="text-muted-foreground mb-10 text-sm">{l.subtitle}</p>

        <div className="space-y-8">
          {sections.map((sec, i) => (
            <div key={i} className="border-b border-border pb-8 last:border-0" data-reveal>
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--owner)" }}>
                {i + 1}. {sec.title}
              </h2>
              <div className="space-y-2">
                {sec.body.map((para, j) => (
                  <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          {isRTL ? "للاستفسار: " : "Inquiries: "}
          <a href="mailto:info@emaraa.app" className="hover:text-[#0DB8D3] transition-colors">
            info@emaraa.app
          </a>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
