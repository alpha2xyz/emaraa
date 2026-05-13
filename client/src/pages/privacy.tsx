import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useLang } from '../hooks/use-lang';

type Section = { title: string; body: string[] };

const arSections: Section[] = [
  {
    title: 'البيانات التي نجمعها',
    body: [
      'رقم الجوال: يُجمع عند التسجيل ويُستخدم للتحقق عبر رمز OTP وللتواصل داخل المنصة.',
      'الاسم الكامل: يُجمع عند إنشاء الحساب لعرضه في واجهة المنصة.',
      'بيانات مزود الخدمة: اسم الشركة، المدينة، البريد الإلكتروني، السجل التجاري، ملف الشركة (PDF).',
      'بيانات العقار والطلبات: تفاصيل المبنى ونوعه وطلبات الخدمة التي ينشرها مالك العقار.',
      'العروض المقدمة: ملفات PDF للعروض التي يرفعها مزودو الخدمة.',
    ],
  },
  {
    title: 'كيف نستخدم بياناتك',
    body: [
      'تشغيل المنصة وتمكين التواصل بين الملاك ومزودي الخدمة.',
      'إرسال رمز التحقق (OTP) عبر الرسائل النصية لتأكيد هوية المستخدم.',
      'مراجعة طلبات تسجيل مزودي الخدمة من قِبل الإدارة.',
      'لا نبيع بياناتك لأطراف ثالثة ولا نستخدمها لأغراض تسويقية دون موافقتك.',
    ],
  },
  {
    title: 'تخزين البيانات',
    body: [
      'تُخزَّن البيانات في قواعد بيانات Supabase (خوادم سحابية — منطقة الشرق الأوسط أو أوروبا حسب إعدادات المشروع).',
      'ملفات PDF تُخزَّن في Supabase Storage وتُتاح عبر روابط موقتة (مدة صلاحيتها ساعة واحدة).',
      'رموز OTP مؤقتة وتنتهي صلاحيتها خلال 5 دقائق.',
      'جلسات تسجيل الدخول تنتهي تلقائيًا بعد 30 يومًا.',
    ],
  },
  {
    title: 'خدمة الرسائل النصية (OTP)',
    body: [
      'يُرسَل رمز التحقق عبر شركة Authentica (portal.authentica.sa) وهي مزود سعودي للرسائل النصية.',
      'رقم جوالك يُرسَل إلى Authentica حصرًا لغرض إيصال الرمز ولا يُستخدم لأي غرض آخر.',
    ],
  },
  {
    title: 'حقوقك وفق نظام PDPL',
    body: [
      'وفقًا لنظام حماية البيانات الشخصية السعودي (PDPL) يحق لك:',
      '• الاطلاع على بياناتك الشخصية المخزّنة لدينا.',
      '• طلب تصحيح أي بيانات غير دقيقة.',
      '• طلب حذف حسابك وبياناتك الشخصية.',
      'لممارسة أي من هذه الحقوق تواصل معنا عبر البريد الإلكتروني أدناه.',
    ],
  },
  {
    title: 'التواصل بشأن الخصوصية',
    body: [
      'أي استفسار أو طلب متعلق بخصوصيتك يُرسَل إلى: aallfaraidi@gmail.com',
      'آخر تحديث لهذه السياسة: مايو 2026.',
    ],
  },
];

const enSections: Section[] = [
  {
    title: 'Data We Collect',
    body: [
      'Mobile number: collected at registration, used for OTP verification and in-platform communication.',
      'Full name: collected at account creation and displayed within the platform interface.',
      'Provider data: company name, city, email, commercial registration, company profile (PDF).',
      'Property and request data: building details, type, and service requests posted by property owners.',
      'Submitted offers: PDF files uploaded by service providers.',
    ],
  },
  {
    title: 'How We Use Your Data',
    body: [
      'To operate the platform and enable communication between owners and service providers.',
      'To send OTP verification codes via SMS to confirm user identity.',
      'To allow administration to review service provider registration requests.',
      'We do not sell your data to third parties or use it for marketing purposes without your consent.',
    ],
  },
  {
    title: 'Data Storage',
    body: [
      'Data is stored in Supabase databases (cloud servers — Middle East or Europe region depending on project settings).',
      'PDF files are stored in Supabase Storage and accessed via temporary signed URLs (1-hour validity).',
      'OTP codes are temporary and expire within 5 minutes.',
      'Login sessions expire automatically after 30 days.',
    ],
  },
  {
    title: 'SMS Service (OTP)',
    body: [
      'Verification codes are delivered via Authentica (portal.authentica.sa), a Saudi-native SMS provider.',
      'Your mobile number is sent to Authentica solely for the purpose of delivering the code and is not used for any other purpose.',
    ],
  },
  {
    title: 'Your Rights under PDPL',
    body: [
      'Under the Saudi Personal Data Protection Law (PDPL) you have the right to:',
      '• Access your personal data stored with us.',
      '• Request correction of any inaccurate data.',
      '• Request deletion of your account and personal data.',
      'To exercise any of these rights, contact us via the email address below.',
    ],
  },
  {
    title: 'Privacy Contact',
    body: [
      'Any privacy-related inquiries or requests should be sent to: aallfaraidi@gmail.com',
      'Last updated: May 2026.',
    ],
  },
];

export default function PrivacyPage() {
  const { lang } = useLang();
  const isRTL = lang === 'ar';
  const sections = isRTL ? arSections : enSections;

  const labels = {
    ar: { title: 'سياسة الخصوصية', subtitle: 'نلتزم بحماية بياناتك الشخصية وفق نظام PDPL السعودي.', back: 'العودة للرئيسية' },
    en: { title: 'Privacy Policy', subtitle: 'We are committed to protecting your personal data in accordance with Saudi PDPL.', back: 'Back to Home' },
  };
  const l = labels[lang];

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E4A6B] mb-6 transition-colors">
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {l.back}
          </button>
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{l.title}</h1>
        <p className="text-gray-500 mb-10 text-sm">{l.subtitle}</p>

        <div className="space-y-8">
          {sections.map((sec, i) => (
            <div key={i} className="border-b border-gray-100 pb-8 last:border-0">
              <h2 className="text-base font-bold text-[#2E4A6B] mb-3">
                {i + 1}. {sec.title}
              </h2>
              <div className="space-y-2">
                {sec.body.map((para, j) => (
                  <p key={j} className="text-sm text-gray-600 leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-gray-400">
          {isRTL ? 'للاستفسار: ' : 'Inquiries: '}
          <a href="mailto:aallfaraidi@gmail.com" className="hover:text-[#2E4A6B] transition-colors">
            aallfaraidi@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
