import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useLang } from '../hooks/use-lang';

type Section = { title: string; body: string[] };

const arSections: Section[] = [
  {
    title: 'التعريفات',
    body: [
      '"المنصة / عِمارة / نحن / لنا" — تعني منصة عِمارة الإلكترونية المملوكة والمُدارة من قِبل فريق عِمارة داخل المملكة العربية السعودية.',
      '"المستخدم / أنت / حسابك" — يعني أي شخص طبيعي أو كيان يصل إلى المنصة أو يستخدمها سواء بصفة مالك عقار أو مزود خدمة.',
      '"مالك العقار" — المستخدم المسجّل الذي ينشر طلبات الخدمة لعقاراته السكنية أو التجارية.',
      '"مزود الخدمة" — الشركة أو المؤسسة المُعتمدة من الإدارة التي تقدّم عروضها للخدمات المطلوبة.',
      '"الخدمة" — ربط أصحاب العقارات بمزودي خدمات إدارة المرافق والنظافة داخل المملكة العربية السعودية عبر المنصة الرقمية.',
    ],
  },
  {
    title: 'ملاحظات عامة',
    body: [
      'باستخدامك للمنصة فأنت توافق صراحةً على جميع الشروط الواردة في هذه الوثيقة. في حال عدم الموافقة يجب التوقف عن الاستخدام فوراً.',
      'المنصة مخصصة للاستخدام المشروع داخل المملكة العربية السعودية فقط. يُحظر استخدامها لأي غرض تجاري خارج نطاق الخدمة المعرّفة أعلاه.',
      'يجب على المستخدمين تقديم معلومات دقيقة وكاملة؛ فالبيانات المنقوصة أو الخاطئة قد تؤثر على صحة الطلبات والعروض.',
    ],
  },
  {
    title: 'نطاق الخدمة',
    body: [
      'عِمارة منصة إلكترونية سعودية تربط بين أصحاب العقارات السكنية والتجارية ومزودي خدمات إدارة المرافق والنظافة داخل المملكة العربية السعودية.',
      'تتيح المنصة لأصحاب العقارات نشر طلبات الخدمة، ولمزودي الخدمة تقديم عروضهم بصيغة PDF، ويتم انتقاء مزودي الخدمة وفق معايير الموافقة الإدارية.',
      'عِمارة وسيط رقمي فقط — العقد النهائي يُبرم مباشرةً بين مالك العقار ومزود الخدمة، ولا تكون المنصة طرفاً في أي علاقة تعاقدية بينهما.',
    ],
  },
  {
    title: 'استخدام المنصة',
    body: [
      'يُحظر على المستخدمين القيام بأي نشاط يُخلّ بأمن المنصة أو سلامتها أو يستهدف الوصول غير المصرّح إلى خوادمها أو بيانات المستخدمين الآخرين — وهذا يُعدّ انتهاكاً صريحاً لنظام مكافحة الجرائم المعلوماتية السعودي.',
      'يُحظر نسخ أو تنزيل أو إعادة نشر أي محتوى من المنصة دون إذن خطي مسبق.',
      'المنصة مقيّدة للمستخدمين البالغين (18 عاماً فأكثر).',
      'المستخدم مسؤول مسؤولية كاملة عن سرية بيانات حسابه وكلمة المرور وعن أي نشاط يجري من خلال حسابه.',
      'يُحظر استخدام المنصة كوسيط أو سمسار لصالح طرف ثالث دون موافقة صريحة من الإدارة.',
    ],
  },
  {
    title: 'الأهلية',
    body: [
      'يجب أن يكون المستخدم شخصاً طبيعياً بالغاً أو مؤسسة مسجّلة داخل المملكة العربية السعودية.',
      'بتسجيلك في المنصة تُقرّ بأن المعلومات التي تقدمها صحيحة ودقيقة وتتحمل مسؤولية الحفاظ على سرية بيانات حسابك.',
      'تحتفظ الإدارة بحق إلغاء الحسابات التي تنتهك شرط الأهلية في أي وقت.',
    ],
  },
  {
    title: 'حسابات المستخدمين',
    body: [
      'يُنشأ الحساب عبر رقم جوال سعودي يُتحقق منه برمز OTP مؤقت مُرسَل عبر مزود الرسائل النصية المعتمد.',
      'حساب مالك العقار مقيّد بعقار واحد وطلب نشط واحد في المرحلة الحالية.',
      'يحق لإدارة المنصة تعليق الحسابات المخالفة لهذه الشروط أو إلغاؤها دون إشعار مسبق.',
      'تسجيل الدخول من خلال حسابك يُعدّ موافقةً على تلقّي رسائل نصية تتعلق بالخدمة كجزء من عمل المنصة.',
    ],
  },
  {
    title: 'التزامات مالك العقار',
    body: [
      'تقديم معلومات دقيقة ومحدَّثة عن العقار والخدمة المطلوبة.',
      'بعد قبول عرض من مزود خدمة، لا يحق لصاحب الحساب نشر طلبات جديدة حتى إغلاق الطلب الحالي رسمياً.',
      'الالتزام بالتواصل المهني مع مزودي الخدمة واستخدام المنصة للأغراض المشروعة فقط.',
      'المنصة وسيط فقط — العقد النهائي يُبرم مباشرةً بين مالك العقار ومزود الخدمة.',
    ],
  },
  {
    title: 'التزامات مزود الخدمة',
    body: [
      'تقديم مستندات صحيحة وسارية المفعول عند التسجيل (سجل تجاري، ملف الشركة بصيغة PDF).',
      'يسري الحساب على منصة عِمارة فقط بعد الحصول على موافقة إدارية صريحة.',
      'يلتزم مزود الخدمة بتنفيذ الخدمة وفق العرض المقدَّم وفي الوقت المحدد.',
      'يُحظر على مزود الخدمة التواصل مع الملاك خارج إطار المنصة بهدف تجاوز آلية العروض الرسمية.',
      'أي تغيير جوهري في بيانات الشركة (السجل التجاري، الرخص) يجب إبلاغ الإدارة به فوراً.',
    ],
  },
  {
    title: 'الموافقة الإدارية',
    body: [
      'تحتفظ عِمارة بحق مراجعة طلبات تسجيل مزودي الخدمة ورفض أو قبول أي طلب دون إبداء الأسباب.',
      'الموافقة ليست ضماناً لجودة الخدمة المقدَّمة من مزود الخدمة — المنصة وسيط وليست طرفاً في العقد.',
      'تحتفظ الإدارة بحق سحب الموافقة وتعليق حساب مزود الخدمة عند ثبوت انتهاك هذه الشروط.',
    ],
  },
  {
    title: 'الملكية الفكرية',
    body: [
      'جميع محتويات المنصة من نصوص وتصميمات وشعارات وواجهات وأكواد برمجية هي ملك حصري لعِمارة.',
      'يُحظر استخدام أي محتوى من المنصة أو إعادة نشره أو الاستفادة منه تجارياً دون إذن خطي مسبق.',
      'اسم "عِمارة" والشعار المرتبط به علامات تجارية محمية؛ لا يُصرح لأي طرف باستخدامها دون ترخيص.',
    ],
  },
  {
    title: 'حدود المسؤولية',
    body: [
      'لا تتحمل عِمارة أي مسؤولية عن أضرار مباشرة أو غير مباشرة ناجمة عن الخدمات المقدَّمة من مزودي الخدمة.',
      'تُقدَّم المنصة "كما هي" دون ضمانات صريحة أو ضمنية بشأن الاستمرارية أو الخلو من الأخطاء.',
      'لا تتحمل المنصة أي مسؤولية عن انقطاع الخدمة بسبب أعطال تقنية أو قوة قاهرة خارجة عن سيطرتها.',
      'المنصة غير مسؤولة عن محتوى المواقع الخارجية التي قد ترتبط بها.',
    ],
  },
  {
    title: 'الروابط الخارجية',
    body: [
      'قد تحتوي المنصة على روابط لمواقع خارجية لأغراض إعلامية فقط — عِمارة لا تتحمل مسؤولية محتواها.',
      'الوصول إلى أي رابط خارجي يكون على مسؤولية المستخدم الكامل.',
      'يُحظر ربط أي موقع آخر بمنصة عِمارة دون إذن خطي مسبق من الإدارة.',
    ],
  },
  {
    title: 'إنهاء الخدمة',
    body: [
      'تحتفظ عِمارة بحق إيقاف أو إنهاء حساب أي مستخدم في الحالات التالية:',
      '• انتهاك جوهري لأي بند من بنود هذه الشروط.',
      '• التعدي على حقوق المستخدمين الآخرين أو أطراف ثالثة.',
      '• محاولة اختراق المنصة أو الوصول غير المصرح إلى أنظمتها.',
      '• تقديم بيانات مزيفة أو مضللة عند التسجيل أو خلال الاستخدام.',
      'قد يُنهى الحساب فوراً ودون إشعار مسبق في الحالات الجسيمة.',
    ],
  },
  {
    title: 'القانون الحاكم والاختصاص القضائي',
    body: [
      'تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية.',
      'في حال أي نزاع تكون المحاكم السعودية المختصة هي الجهة الفاصلة، بصرف النظر عن موقع المستخدم الجغرافي.',
      'يُعدّ استخدامك للمنصة قبولاً صريحاً لاختصاص القانون السعودي والمحاكم السعودية.',
    ],
  },
  {
    title: 'التعديلات',
    body: [
      'تحتفظ عِمارة بحق تعديل هذه الشروط في أي وقت. تسري التعديلات فور نشرها على المنصة.',
      'استمرارك في استخدام المنصة بعد نشر أي تعديل يُعدّ موافقةً ضمنية على الشروط المحدَّثة.',
      'يُنصح بمراجعة هذه الشروط بصفة دورية للاطلاع على أحدث نسخة. آخر تحديث: مايو 2026.',
    ],
  },
  {
    title: 'التواصل والشكاوى',
    body: [
      'تلتزم عِمارة بمعالجة الشكاوى بسرعة ونزاهة.',
      'لأي استفسار أو شكوى تواصل معنا عبر البريد الإلكتروني: aallfaraidi@gmail.com',
    ],
  },
];

const enSections: Section[] = [
  {
    title: 'Definitions',
    body: [
      '"Platform / EMARAA / We / Us" — refers to the EMARAA digital platform owned and operated by the EMARAA team within the Kingdom of Saudi Arabia.',
      '"User / You / Your Account" — means any natural person or entity accessing or using the platform, whether as a property owner or service provider.',
      '"Property Owner" — the registered user who posts service requests for their residential or commercial properties.',
      '"Service Provider" — a company or entity approved by administration that submits proposals for requested services.',
      '"Service" — connecting property owners with facility management and cleaning service providers within the Kingdom of Saudi Arabia via the digital platform.',
    ],
  },
  {
    title: 'General Notes',
    body: [
      'By using the platform you explicitly agree to all terms stated in this document. If you do not agree, you must stop using the platform immediately.',
      'The platform is intended for lawful use within the Kingdom of Saudi Arabia only. Use for any commercial purpose outside the defined Service scope is prohibited.',
      'Users must provide accurate and complete information; incomplete or incorrect data may affect the validity of requests and proposals.',
    ],
  },
  {
    title: 'Scope of Service',
    body: [
      'EMARAA is a Saudi digital marketplace connecting residential and commercial property owners with qualified facility management and cleaning service providers within the Kingdom of Saudi Arabia.',
      'The platform enables owners to post service requests, providers to submit PDF proposals, and providers are onboarded subject to administrative approval.',
      'EMARAA is a digital intermediary only — the final contract is concluded directly between the property owner and the service provider. EMARAA is not a party to any contractual relationship between them.',
    ],
  },
  {
    title: 'Platform Usage',
    body: [
      'Users are prohibited from conducting any activity that compromises the security or integrity of the platform, or from attempting unauthorized access to its servers or other users\' data — this constitutes a direct violation of the Saudi Anti-Cybercrime Law.',
      'Copying, downloading, or republishing any platform content without prior written permission is strictly prohibited.',
      'The platform is restricted to adult users (18 years and above).',
      'Users are fully responsible for maintaining the confidentiality of their account credentials and for all activity conducted through their accounts.',
      'Using the platform as a broker or intermediary for a third party without explicit written approval from administration is prohibited.',
    ],
  },
  {
    title: 'Eligibility',
    body: [
      'You must be an adult natural person or a registered entity within the Kingdom of Saudi Arabia.',
      'By registering you confirm that all information provided is accurate and complete. You are responsible for maintaining the confidentiality of your account credentials.',
      'Administration reserves the right to terminate accounts that violate the eligibility requirement at any time.',
    ],
  },
  {
    title: 'User Accounts',
    body: [
      'Accounts are created via a Saudi mobile number verified by a one-time OTP sent through the approved SMS provider.',
      'Owner accounts are restricted to one property and one active service request in the current phase.',
      'EMARAA reserves the right to suspend or terminate accounts that violate these Terms without prior notice.',
      'Logging into your account constitutes consent to receiving service-related SMS messages as part of normal platform operation.',
    ],
  },
  {
    title: 'Owner Obligations',
    body: [
      'Provide accurate and current information about the property and service required.',
      'Once an offer is accepted, the account cannot post new requests until the current request is formally closed.',
      'Maintain professional communication with service providers and use the platform for legitimate purposes only.',
      'EMARAA is an intermediary only — the final contract is concluded directly between the property owner and the service provider.',
    ],
  },
  {
    title: 'Provider Obligations',
    body: [
      'Submit valid and current documents upon registration (commercial registration, company profile in PDF format).',
      'Provider accounts are only activated after receiving explicit administrative approval.',
      'Providers are committed to delivering the service as proposed and within the agreed timeline.',
      'Providers are prohibited from contacting owners outside the platform in order to bypass the official proposal mechanism.',
      'Any material change to company information (commercial registration, licenses) must be reported to administration immediately.',
    ],
  },
  {
    title: 'Administrative Approval',
    body: [
      'EMARAA reserves the right to review, approve, or reject provider registration requests without providing reasons.',
      'Approval is not a guarantee of service quality — EMARAA is an intermediary and not a party to the contract.',
      'Administration reserves the right to revoke approval and suspend a provider account upon verified violation of these Terms.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      'All platform content including text, designs, logos, interfaces, and source code is the exclusive property of EMARAA.',
      'Reproducing, publishing, or commercially exploiting any platform content without prior written permission is strictly prohibited.',
      '"EMARAA" and its associated logo are protected trademarks; no party may use them without a license.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'EMARAA bears no liability for direct or indirect damages arising from services provided by service providers.',
      'The platform is provided "as is" without express or implied warranties regarding continuity or error-free operation.',
      'EMARAA is not responsible for service interruptions caused by technical failures or force majeure events beyond its control.',
      'The platform is not responsible for the content of any external websites it may link to.',
    ],
  },
  {
    title: 'External Links',
    body: [
      'The platform may contain links to external websites for informational purposes only — EMARAA bears no responsibility for their content.',
      'Accessing any external link is entirely at the user\'s own risk.',
      'Linking any other website to the EMARAA platform without prior written permission from administration is prohibited.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'EMARAA reserves the right to suspend or terminate any user account in the following cases:',
      '• Material breach of any provision of these Terms.',
      '• Infringement of other users\' or third parties\' rights.',
      '• Attempting to breach or gain unauthorized access to platform systems.',
      '• Submitting false or misleading data during registration or use.',
      'Accounts may be terminated immediately and without prior notice in serious cases.',
    ],
  },
  {
    title: 'Governing Law & Jurisdiction',
    body: [
      'These Terms are governed by the laws and regulations of the Kingdom of Saudi Arabia.',
      'Any disputes shall be subject to the exclusive jurisdiction of Saudi courts, regardless of the user\'s geographic location.',
      'Your use of the platform constitutes explicit acceptance of Saudi law and Saudi court jurisdiction.',
    ],
  },
  {
    title: 'Amendments',
    body: [
      'EMARAA reserves the right to modify these Terms at any time. Amendments take effect immediately upon publication on the platform.',
      'Continued use of the platform after any amendment is published constitutes implicit acceptance of the updated Terms.',
      'Users are advised to review these Terms periodically. Last updated: May 2026.',
    ],
  },
  {
    title: 'Contact & Complaints',
    body: [
      'EMARAA is committed to handling complaints promptly and fairly.',
      'For any inquiries or complaints contact us at: aallfaraidi@gmail.com',
    ],
  },
];

export default function TermsPage() {
  const { lang, setLang } = useLang();
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
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2E4A6B] transition-colors">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {l.back}
            </button>
          </Link>
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="text-sm px-3 py-1 rounded-full border border-[#2E4A6B] text-[#2E4A6B] hover:bg-[#2E4A6B] hover:text-white transition-colors"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>

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
