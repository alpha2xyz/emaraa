import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useLang } from '../hooks/use-lang';

type Section = { title: string; body: string[] };

const arSections: Section[] = [
  {
    title: 'نطاق الخدمة',
    body: [
      'عِمارة منصة إلكترونية سعودية تربط بين أصحاب العقارات السكنية والتجارية ومزودي خدمات إدارة المرافق والنظافة داخل المملكة العربية السعودية.',
      'تتيح المنصة لأصحاب العقارات نشر طلبات الخدمة، ولمزودي الخدمة تقديم عروضهم، ويتم انتقاء مزودي الخدمة وفق معايير الموافقة الإدارية.',
    ],
  },
  {
    title: 'الأهلية',
    body: [
      'يجب أن يكون المستخدم شخصًا طبيعيًا بالغًا أو مؤسسة مسجلة داخل المملكة العربية السعودية.',
      'بتسجيلك في المنصة تقر بأن المعلومات التي تقدمها صحيحة ودقيقة، وتتحمل مسؤولية الحفاظ على سرية بيانات حسابك.',
    ],
  },
  {
    title: 'حسابات المستخدمين',
    body: [
      'يُنشئ الحساب عبر رقم جوال سعودي يُتحقق منه برمز OTP مؤقت.',
      'حساب مالك العقار مقيّد بعقار واحد وطلب نشط واحد في المرحلة الحالية.',
      'يحق لإدارة المنصة تعليق الحسابات المخالفة لهذه الشروط أو إلغاؤها دون إشعار مسبق.',
    ],
  },
  {
    title: 'التزامات مالك العقار',
    body: [
      'تقديم معلومات دقيقة ومحدّثة عن العقار والخدمة المطلوبة.',
      'بعد قبول عرض من مزود خدمة، لا يحق لصاحب الحساب نشر طلبات جديدة حتى إغلاق الطلب الحالي.',
      'المنصة وسيط فقط — العقد النهائي يبرم مباشرةً بين مالك العقار ومزود الخدمة.',
    ],
  },
  {
    title: 'التزامات مزود الخدمة',
    body: [
      'تقديم مستندات صحيحة وسارية المفعول عند التسجيل (سجل تجاري، ملف الشركة).',
      'يسري الحساب على منصة عِمارة فقط بعد الحصول على موافقة الإدارة.',
      'يلتزم مزود الخدمة بتنفيذ الخدمة وفق العرض المقدّم وفي الوقت المحدد.',
    ],
  },
  {
    title: 'الموافقة الإدارية',
    body: [
      'تحتفظ عِمارة بحق مراجعة طلبات تسجيل مزودي الخدمة ورفض أو قبول أي طلب دون إبداء الأسباب.',
      'الموافقة ليست ضمانًا لجودة الخدمة المقدمة من مزود الخدمة — المنصة وسيط وليست طرفًا في العقد.',
    ],
  },
  {
    title: 'حدود المسؤولية',
    body: [
      'لا تتحمل عِمارة أي مسؤولية عن أضرار مباشرة أو غير مباشرة ناجمة عن الخدمات المقدمة من مزودي الخدمة.',
      'تُقدَّم المنصة "كما هي" دون ضمانات صريحة أو ضمنية بشأن الاستمرارية أو الخلو من الأخطاء.',
    ],
  },
  {
    title: 'القانون الحاكم',
    body: [
      'تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية. في حال أي نزاع تكون المحاكم السعودية ذات الاختصاص هي الجهة المختصة.',
      'يُعدّ استخدامك للمنصة قبولًا صريحًا لهذه الشروط. آخر تحديث: مايو 2026.',
    ],
  },
];

const enSections: Section[] = [
  {
    title: 'Scope of Service',
    body: [
      'EMARAA is a Saudi digital marketplace connecting residential and commercial property owners with qualified facility management and cleaning service providers within the Kingdom of Saudi Arabia.',
      'The platform enables owners to post service requests, providers to submit proposals, and providers are onboarded subject to administrative approval.',
    ],
  },
  {
    title: 'Eligibility',
    body: [
      'You must be an adult natural person or a registered entity within the Kingdom of Saudi Arabia.',
      'By registering you confirm that all information provided is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials.',
    ],
  },
  {
    title: 'User Accounts',
    body: [
      'Accounts are created via a Saudi mobile number verified by a one-time OTP.',
      'Owner accounts are restricted to one property and one active service request in the current phase.',
      'EMARAA reserves the right to suspend or terminate accounts that violate these Terms without prior notice.',
    ],
  },
  {
    title: 'Owner Obligations',
    body: [
      'Provide accurate and current information about the property and service required.',
      'Once an offer is accepted, the account cannot post new requests until the current request is closed.',
      'EMARAA is an intermediary only — the final contract is concluded directly between the property owner and the service provider.',
    ],
  },
  {
    title: 'Provider Obligations',
    body: [
      'Submit valid and current documents upon registration (commercial registration, company profile).',
      'Provider accounts are only activated after receiving administrative approval.',
      'Providers are committed to delivering the service as proposed and within the agreed timeline.',
    ],
  },
  {
    title: 'Administrative Approval',
    body: [
      'EMARAA reserves the right to review, approve, or reject provider registration requests without providing reasons.',
      'Approval is not a guarantee of service quality — EMARAA is an intermediary and not a party to the contract.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'EMARAA bears no liability for direct or indirect damages arising from services provided by service providers.',
      'The platform is provided "as is" without express or implied warranties regarding continuity or error-free operation.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These Terms are governed by the laws and regulations of the Kingdom of Saudi Arabia. Any disputes shall be subject to the jurisdiction of Saudi courts.',
      'Your continued use of the platform constitutes explicit acceptance of these Terms. Last updated: May 2026.',
    ],
  },
];

export default function TermsPage() {
  const { lang } = useLang();
  const isRTL = lang === 'ar';
  const sections = isRTL ? arSections : enSections;

  const labels = {
    ar: { title: 'شروط الاستخدام', subtitle: 'يُرجى قراءة هذه الشروط بعناية قبل استخدام منصة عِمارة.', back: 'العودة للرئيسية' },
    en: { title: 'Terms of Use', subtitle: 'Please read these terms carefully before using the EMARAA platform.', back: 'Back to Home' },
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
