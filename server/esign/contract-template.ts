import { scopePart1 } from "../../shared/scope-of-work.js";

// Repo-local copy of _work/owner-provider-service-contract-v1.md, rendered from real field
// values instead of {PLACEHOLDER} text. The canonical markdown lives outside this git repo
// (Emaraa/CLAUDE.md: nothing non-code belongs in this repo) and can't be read at Vercel
// runtime, so this file is the source code reads from; keep §10's vendor wording and the
// signature-line anchor text in sync with that markdown by hand when either changes.
//
// Does NOT touch §9 (governing law) — it stays the lawyer's job, tracked separately. This
// template renders the placeholder text verbatim, wrapped in the DEMO banner so nobody mistakes
// unreviewed legal language for something binding.

export type LineItem = { service: string; price_per_unit: number };

export type ContractFields = {
  contractDate: string; // already formatted for display, e.g. "15 سبتمبر 2026"
  ownerName: string;
  propertyName: string;
  propertyAddress: string;
  propertyCity: string;
  buildingType: "residential" | "commercial";
  unitsCount: number | null;
  providerCompanyName: string;
  providerCrNumber: string | null;
  providerFalLicenseNumber: string | null;
  providerRepresentativeName: string | null;
  contractValue: number | null;
  lineItems: LineItem[];
  signitRequestId: string | null; // null before the signature request exists
};

const OWNER_ANCHOR_TAG = "توقيع المالك";
const PROVIDER_ANCHOR_TAG = "توقيع مقدم الخدمة";

export { OWNER_ANCHOR_TAG, PROVIDER_ANCHOR_TAG };

function unitsOrArea(buildingType: "residential" | "commercial", unitsCount: number | null): {
  ar: string;
  en: string;
} {
  if (unitsCount == null) return { ar: "غير محدد", en: "not specified" };
  return buildingType === "commercial"
    ? { ar: `${unitsCount} م²`, en: `${unitsCount} m²` }
    : { ar: `${unitsCount} وحدة`, en: `${unitsCount} units` };
}

function buildingTypeLabel(buildingType: "residential" | "commercial"): { ar: string; en: string } {
  return buildingType === "commercial"
    ? { ar: "تجاري", en: "commercial" }
    : { ar: "سكني", en: "residential" };
}

function money(n: number | null): string {
  return n == null ? "—" : n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderLineItemsTable(lineItems: LineItem[]): string {
  if (lineItems.length === 0) return "";
  const rows = lineItems
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.service)}</td><td class="num">${money(item.price_per_unit)}</td></tr>`,
    )
    .join("");
  return `
    <h3 class="ar">ملحق أ — تفصيل الأسعار</h3>
    <h3 class="en">Annex A — Price Breakdown</h3>
    <table class="line-items">
      <thead><tr><th>الخدمة — Service</th><th>السعر — Price (SAR)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function renderContractHtml(f: ContractFields): string {
  const units = unitsOrArea(f.buildingType, f.unitsCount);
  const btype = buildingTypeLabel(f.buildingType);
  const scopeAr = scopePart1(f.buildingType, "ar");
  const scopeEn = scopePart1(f.buildingType, "en");
  const requestIdLine = f.signitRequestId ?? "—";
  const providerCr = f.providerCrNumber ?? "—";
  const providerFal = f.providerFalLicenseNumber ?? "—";
  const providerRep = f.providerRepresentativeName ?? "—";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
  * { box-sizing: border-box; }
  body {
    font-family: 'Cairo', Arial, sans-serif;
    margin: 0;
    padding: 48px 40px;
    color: #12242c;
    font-size: 13px;
    line-height: 1.9;
  }
  .ar { direction: rtl; text-align: right; }
  .en { direction: ltr; text-align: left; color: #3a4a52; }
  h1 { font-size: 20px; color: #065B98; text-align: center; margin: 4px 0; }
  h2 { font-size: 14px; color: #065B98; margin: 20px 0 8px; }
  h3 { font-size: 13px; color: #065B98; margin: 16px 0 6px; }
  hr { border: none; border-top: 1px solid #d7e2e6; margin: 18px 0; }
  p { margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
  table.signatures th, table.signatures td,
  table.line-items th, table.line-items td {
    border: 1px solid #cfd9dd; padding: 8px; text-align: center;
  }
  table.line-items thead { background: #eef5f8; }
  table.line-items td.num { direction: ltr; }
  .signature-cell { font-weight: 600; }
  .demo-banner {
    position: fixed;
    top: 40%;
    left: -20%;
    width: 140%;
    text-align: center;
    transform: rotate(-28deg);
    font-size: 46px;
    font-weight: 700;
    color: rgba(220, 38, 38, 0.16);
    letter-spacing: 4px;
    z-index: 1000;
    pointer-events: none;
  }
  .demo-banner-sub {
    display: block;
    font-size: 20px;
    letter-spacing: 2px;
    margin-top: 6px;
  }
</style>
</head>
<body>
  <div class="demo-banner">
    DEMO — NOT LEGALLY BINDING
    <span class="demo-banner-sub">عرض تجريبي — غير ملزم قانونياً</span>
  </div>

  <h1 class="ar">عقد خدمات تشغيل وصيانة مرافق</h1>
  <h1 class="en">Facility Operation &amp; Maintenance Services Agreement</h1>

  <p class="ar">تم إبرام هذا العقد بتاريخ <strong>${f.contractDate}</strong> بين:</p>
  <p class="ar"><strong>الطرف الأول (المالك):</strong> ${f.ownerName}، مالك العقار المعروف بـ"${f.propertyName}"
    الكائن في ${f.propertyAddress}، ${f.propertyCity} (${btype.ar} — ${units.ar}).</p>
  <p class="ar"><strong>الطرف الثاني (مقدم الخدمة):</strong> شركة ${f.providerCompanyName}، سجل تجاري رقم
    ${providerCr}، رخصة فال (الهيئة العامة للعقار) رقم ${providerFal}، ويمثلها في هذا العقد ${providerRep}.</p>
  <p class="ar">ويشار إليهما فيما يلي مجتمعين بـ"الطرفين" ومنفردين بـ"الطرف".</p>

  <p class="en">This Agreement is made on <strong>${f.contractDate}</strong> between:</p>
  <p class="en"><strong>First Party (Owner):</strong> ${f.ownerName}, owner of the property known as
    "${f.propertyName}" located at ${f.propertyAddress}, ${f.propertyCity} (${btype.en} — ${units.en}).</p>
  <p class="en"><strong>Second Party (Provider):</strong> ${f.providerCompanyName}, Commercial Registration
    No. ${providerCr}, REGA FAL License No. ${providerFal}, represented by ${providerRep}.</p>
  <p class="en">Collectively "the Parties," each individually "a Party."</p>

  <hr />
  <p class="ar"><strong>تمهيد:</strong> تم التعارف والتواصل بين الطرفين عبر منصة "عِمارة" الإلكترونية
    (emaraa.app)، والتي اقتصر دورها على تسهيل التعارف والتواصل التقني بين الطرفين، دون أن تكون طرفاً في هذا
    العقد (انظر البند 7).</p>
  <p class="en"><strong>Preamble:</strong> the Parties were introduced through the "Emaraa" online platform
    (emaraa.app), whose role was limited to facilitating the technical introduction between the Parties.
    Emaraa is not a party to this Agreement (see Section 7).</p>
  <hr />

  <h2 class="ar">1. نطاق الخدمات — Scope of Services</h2>
  <p class="ar">${scopeAr}</p>
  <p class="en">${scopeEn}</p>

  <h2 class="ar">2. مدة العقد — Term</h2>
  <p class="ar">مدة هذا العقد سنة ميلادية واحدة تبدأ من ${f.contractDate}، وتتجدد تلقائياً لمدد مماثلة ما لم
    يُخطر أحد الطرفين الآخر كتابياً برغبته في عدم التجديد قبل 30 يوماً على الأقل من تاريخ انتهاء المدة
    الأصلية أو أي مدة تجديد.</p>
  <p class="en">This Agreement has an initial term of one (1) year from ${f.contractDate}, automatically
    renewing for successive equal terms unless either Party gives the other written notice of non-renewal
    at least 30 days before the end of the then-current term.</p>

  <h2 class="ar">3. قيمة العقد وشروط الدفع — Contract Value &amp; Payment Terms</h2>
  <p class="ar">القيمة الإجمالية لهذا العقد ${money(f.contractValue)} ريال سعودي سنوياً، شاملة ضريبة القيمة
    المضافة، وفق التفصيل الوارد في عرض السعر المقدَّم من الطرف الثاني والمرفق بهذا العقد (ملحق أ).</p>
  <p class="en">The total value of this Agreement is ${money(f.contractValue)} SAR annually, inclusive of
    VAT, as itemized in the Provider's price quotation attached to this Agreement (Annex A).</p>

  ${renderLineItemsTable(f.lineItems)}

  <h2 class="ar">4. التزامات مقدم الخدمة — Provider Obligations</h2>
  <p class="ar">تنفيذ الخدمات المتفق عليها وفق أفضل المعايير المهنية المتعارف عليها في القطاع، الحفاظ على
    سريان رخصة فال والسجل التجاري طوال مدة العقد وإخطار الطرف الأول فوراً في حال تعليق أو إلغاء أيٍّ منهما،
    توفير كوادر مؤهلة ومدرَّبة على معايير السلامة المهنية، والاستجابة لبلاغات الأعطال والطوارئ على مدار
    الساعة كما هو محدد في نطاق الخدمات.</p>
  <p class="en">Perform the agreed services to prevailing professional standards in the sector; keep its
    FAL license and Commercial Registration valid throughout the term and notify the Owner immediately if
    either is suspended or cancelled; provide qualified staff trained on occupational safety standards; and
    respond to fault reports and emergencies 24/7 as specified in the Scope of Services.</p>

  <h2 class="ar">5. التزامات المالك — Owner Obligations</h2>
  <p class="ar">تمكين مقدم الخدمة من الوصول إلى العقار لأداء الخدمات المتفق عليها، سداد المستحقات المالية في
    مواعيدها المحددة في البند 3، والإبلاغ عن أي أعطال أو ملاحظات تخص الخدمة في وقت مناسب.</p>
  <p class="en">Provide the Provider access to the property to perform the agreed services; pay amounts due
    on the schedule set out in Section 3; and report any faults or service issues in a timely manner.</p>

  <h2 class="ar">6. الإنهاء — Termination</h2>
  <p class="ar">لأي من الطرفين إنهاء هذا العقد بإشعار كتابي مدته 30 يوماً. يجوز لأي من الطرفين إنهاء العقد
    فوراً في حال إخلال الطرف الآخر الجوهري بالتزاماته، بعد توجيه إنذار كتابي ومنح مهلة معالجة لا تقل عن 15
    يوماً دون معالجة الإخلال.</p>
  <p class="en">Either Party may terminate this Agreement with 30 days' written notice. Either Party may
    terminate immediately for the other's material breach, following written notice and a cure period of at
    least 15 days that goes unremedied.</p>

  <h2 class="ar">7. دور منصة عِمارة — Role of the Emaraa Platform</h2>
  <p class="ar">تعمل منصة عِمارة بصفتها وسيطاً إلكترونياً هدفه تسهيل التعارف والتعاقد بين الملاك ومقدمي
    الخدمة، وليست طرفاً في هذا العقد. لا تتحمل عِمارة أي مسؤولية عن تنفيذ الخدمات المتفق عليها أو جودتها أو
    عن أي التزام مالي بين الطرفين. أي نزاع ينشأ عن هذا العقد يكون بين الطرفين مباشرة دون أن تكون عِمارة
    طرفاً فيه.</p>
  <p class="en">Emaraa operates solely as an online intermediary facilitating the introduction and
    contracting between Owners and Providers, and is not a party to this Agreement. Emaraa bears no
    responsibility for the performance or quality of the agreed services, or for any financial obligation
    between the Parties. Any dispute arising from this Agreement is between the Parties directly, with
    Emaraa not a party to it.</p>

  <h2 class="ar">8. السرية — Confidentiality</h2>
  <p class="ar">يلتزم كل طرف بالحفاظ على سرية أي معلومات يطّلع عليها بسبب هذا العقد، وعدم إفشائها لأي طرف
    ثالث إلا بموافقة كتابية من الطرف الآخر أو بمقتضى نظام.</p>
  <p class="en">Each Party shall keep confidential any information it obtains as a result of this Agreement
    and shall not disclose it to any third party except with the other Party's written consent or as
    required by law.</p>

  <h2 class="ar">9. القانون الواجب التطبيق وتسوية النزاعات — Governing Law &amp; Dispute Resolution</h2>
  <p class="ar">يخضع هذا العقد لأنظمة المملكة العربية السعودية. يسعى الطرفان أولاً لتسوية أي خلاف ودياً،
    وفي حال تعذر ذلك يُحال النزاع إلى الجهة المختصة في المملكة.</p>
  <p class="en">This Agreement is governed by the laws and regulations of the Kingdom of Saudi Arabia. The
    Parties will first attempt an amicable resolution, failing which the matter is referred to the
    competent authority in the Kingdom.</p>

  <h2 class="ar">10. التوقيع الإلكتروني — Electronic Signature</h2>
  <p class="ar">يقرّ الطرفان بأن التوقيع على هذا العقد يتم إلكترونياً عبر منصة "Signit" المرخصة من هيئة
    الحكومة الرقمية، بعد التحقق من هوية كل طرف، وأن هذا التوقيع معتبر شرعاً ونظاماً بمثابة توقيع خطي ملزم
    للطرفين. رقم المعاملة المرجعي لدى Signit: ${requestIdLine}.</p>
  <p class="en">The Parties acknowledge that this Agreement is signed electronically via the "Signit"
    platform (licensed by the Digital Government Authority), following identity verification of each
    Party, and that this signature is legally binding as a written signature. Signit reference number:
    ${requestIdLine}.</p>

  <hr />
  <p class="ar" style="text-align:center;"><strong>التوقيعات — Signatures</strong></p>
  <table class="signatures">
    <tr>
      <th></th>
      <th>الطرف الأول (المالك) — First Party (Owner)</th>
      <th>الطرف الثاني (مقدم الخدمة) — Second Party (Provider)</th>
    </tr>
    <tr>
      <td>الاسم — Name</td>
      <td>${f.ownerName}</td>
      <td>${f.providerCompanyName} — ${providerRep}</td>
    </tr>
    <tr>
      <td>التوقيع — Signature</td>
      <td class="signature-cell">${OWNER_ANCHOR_TAG}</td>
      <td class="signature-cell">${PROVIDER_ANCHOR_TAG}</td>
    </tr>
    <tr>
      <td>التاريخ — Date</td>
      <td>${f.contractDate}</td>
      <td>${f.contractDate}</td>
    </tr>
  </table>
</body>
</html>`;
}
