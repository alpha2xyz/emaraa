import { scopePart1 } from "../../shared/scope-of-work.js";

// Repo-local copy of _work/owner-provider-service-contract-v2.md (formal Arabic + gap clauses,
// 2026-09-25), rendered from real field values instead of {PLACEHOLDER} text. The canonical
// markdown lives outside this git repo (Emaraa/CLAUDE.md: nothing non-code belongs in this repo)
// and can't be read at Vercel runtime, so this file is the source code reads from; keep the
// clause text, §13's vendor wording and the signature-line anchor text in sync with that markdown
// by hand when either changes.
//
// Not legally reviewed yet: §12 (governing law) and the questions listed in the v2 markdown header
// are the lawyer's job. The whole text stays wrapped in the DEMO banner until then. No em dash
// anywhere in the Arabic (brand rule, covers contracts); empty fields print "غير محدد".
//
// Annex B (the provider's own proposal PDF) is appended after this document by the PDF step, not
// rendered here; this template only prints the Annex B cover line.

export type LineItem = { service: string; price_per_unit: number };

export type ContractFields = {
  contractNumber: string; // Emaraa's own reference, stable per deal, e.g. "EMR-2026-3F9A1C2B"
  contractDate: string; // already formatted for display, e.g. "15 سبتمبر 2026"
  contractDateEn: string; // the same date for the English half, e.g. "15 September 2026"
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string | null; // optional for owners; many have none on file
  propertyName: string;
  propertyAddress: string;
  propertyCity: string;
  buildingType: "residential" | "commercial";
  unitsCount: number | null;
  ownerNotes: string | null; // the owner's notes on the service request (requests.description)
  providerCompanyName: string;
  providerCrNumber: string | null;
  providerFalLicenseNumber: string | null;
  providerRepresentativeName: string | null;
  providerPhone: string | null;
  providerEmail: string | null;
  contractValue: number | null;
  lineItems: LineItem[];
  signatureVendor: "sadq" | "signit";
  signatureRequestId: string | null; // null before the signature request exists
};

// Latin, not Arabic, deliberately. Verified empirically 2026-09-15: Signit's anchor-tag search
// returned "not found" for "توقيع المالك" even on the page it's actually printed on (confirmed
// by downloading and reading the uploaded PDF directly) — consistent with the anchor search
// reading the PDF's text layer in visual/bidi-reordered order rather than logical Unicode order,
// which is a known failure mode for RTL text extraction. A plain Latin marker on the same page
// resolved on the first try. The visible cell text stays Arabic (see the signature table below);
// only this invisible-to-anchor-purpose marker string is Latin.
const OWNER_ANCHOR_TAG = "OWNER_SIGNATURE_ANCHOR";
const PROVIDER_ANCHOR_TAG = "PROVIDER_SIGNATURE_ANCHOR";

export { OWNER_ANCHOR_TAG, PROVIDER_ANCHOR_TAG };

export const NOT_SPECIFIED_AR = "غير محدد";
export const NOT_SPECIFIED_EN = "not specified";

/** Emaraa's own contract number: stable for a deal across regenerations, readable on the phone. */
export function contractNumberFor(dealId: string, date: Date): string {
  return `EMR-${date.getFullYear()}-${dealId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function unitsOrArea(buildingType: "residential" | "commercial", unitsCount: number | null): {
  ar: string;
  en: string;
} {
  if (unitsCount == null) return { ar: NOT_SPECIFIED_AR, en: NOT_SPECIFIED_EN };
  return buildingType === "commercial"
    ? { ar: `${unitsCount} م²`, en: `${unitsCount} m²` }
    : { ar: `${unitsCount} وحدة`, en: `${unitsCount} units` };
}

function buildingTypeLabel(buildingType: "residential" | "commercial"): { ar: string; en: string } {
  return buildingType === "commercial"
    ? { ar: "تجاري", en: "commercial" }
    : { ar: "سكني", en: "residential" };
}

// line_items is provider-controlled jsonb, so a price can arrive as a string. Only a number, or a
// plain decimal string like "1500", is formatted; anything else ("1e3", "0x10", markup) prints the
// "not specified" fallback rather than reaching a legal document or the HTML as-is.
function money(n: unknown, fallback: string = NOT_SPECIFIED_AR): string {
  const v = typeof n === "number" ? n : typeof n === "string" && /^\s*\d+(\.\d+)?\s*$/.test(n) ? Number(n) : NaN;
  return Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : fallback;
}

// Everything that reaches this template comes from owner/provider-entered text or jsonb, and the
// result is rendered by Chrome, so it is escaped and never trusted.
function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escapes every string field once, up front, so the template body below cannot forget one — a
// field added to ContractFields later is covered without touching the template.
function escapeStringFields(fields: ContractFields): ContractFields {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = typeof value === "string" ? escapeHtml(value) : value;
  }
  return out as ContractFields;
}

// One bilingual row: Arabic on the right, English on the left (the grid runs right-to-left).
function row(ar: string, en: string, extraClass = ""): string {
  return `<div class="row ${extraClass}"><div class="ar">${ar}</div><div class="en">${en}</div></div>`;
}

function clause(ar: string, en: string, bodyAr: string, bodyEn: string): string {
  return `<section class="clause">${row(`<h2>${ar}</h2>`, `<h2>${en}</h2>`)}${row(bodyAr, bodyEn)}</section>`;
}

function list(items: string[]): string {
  return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
}

// Latin runs (phones, emails, ids) inside Arabic text are wrapped LTR so bidi can't reorder them.
function ltr(s: string): string {
  return `<span dir="ltr">${s}</span>`;
}

// The Arch mark, redrawn as a black monoline outline for print (the brand gradient does not
// survive black-and-white printing or scanning). Same geometry as the approved Arch logo.
const ARCH_LOGO_BW = `<svg class="logo" width="46" height="46" viewBox="0 0 160 160" fill="none" aria-label="Emaraa">
  <path d="M22 142 V78 a58 58 0 0 1 116 0 V142" stroke="#111" stroke-width="11" stroke-linecap="round"/>
  <path d="M52 142 V82 a28 28 0 0 1 56 0 V142" stroke="#111" stroke-width="9" stroke-linecap="round"/>
  <circle cx="80" cy="84" r="8" fill="#111"/>
</svg>`;

function renderLineItemsTable(lineItems: LineItem[]): string {
  const items = Array.isArray(lineItems) ? lineItems : [];
  const rows = items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item?.service)}</td><td class="num">${money(item?.price_per_unit)}</td></tr>`,
    )
    .join("");
  const body = rows || `<tr><td colspan="2">${NOT_SPECIFIED_AR} / ${NOT_SPECIFIED_EN}</td></tr>`;
  return `
    ${row(`<h2>الملحق (أ): تفصيل الأسعار</h2>`, `<h2>Annex A: Price Breakdown</h2>`)}
    <table class="line-items">
      <thead><tr><th>الخدمة / Service</th><th>السعر بالريال / Price (SAR)</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

export function renderContractHtml(fields: ContractFields): string {
  const f = escapeStringFields(fields);
  const units = unitsOrArea(f.buildingType, f.unitsCount);
  const btype = buildingTypeLabel(f.buildingType);
  const scopeAr = scopePart1(f.buildingType, "ar");
  const scopeEn = scopePart1(f.buildingType, "en");
  const or = (v: string | null, fallback: string) => v ?? fallback;
  const requestIdAr = or(f.signatureRequestId, NOT_SPECIFIED_AR);
  const requestIdEn = or(f.signatureRequestId, NOT_SPECIFIED_EN);
  const vendorLabel = f.signatureVendor === "sadq" ? "SADQ®" : "Signit";
  const providerRepAr = or(f.providerRepresentativeName, NOT_SPECIFIED_AR);
  const providerRepEn = or(f.providerRepresentativeName, NOT_SPECIFIED_EN);
  const valueAr = money(f.contractValue, NOT_SPECIFIED_AR);
  const valueEn = money(f.contractValue, NOT_SPECIFIED_EN);
  // Per-unit (or per m² for commercial) annual price, the same division the owner dashboard shows.
  const perUnitValue =
    typeof f.contractValue === "number" && f.contractValue > 0 && f.unitsCount && f.unitsCount > 0
      ? money(Math.round(f.contractValue / f.unitsCount))
      : null;
  const perUnitAr = perUnitValue
    ? `، أي ما يعادل (${perUnitValue}) ريال سعودي سنوياً ${f.buildingType === "commercial" ? "لكل متر مربع" : "لكل وحدة"}`
    : "";
  const perUnitEn = perUnitValue
    ? `, equivalent to (${perUnitValue}) SAR per year ${f.buildingType === "commercial" ? "per square metre" : "per unit"}`
    : "";
  const notesAr = f.ownerNotes
    ? `<p>ويراعي الطرف الثاني في تنفيذ الخدمات ملاحظات الطرف الأول الواردة في طلب الخدمة، ونصّها: «${f.ownerNotes}».</p>`
    : "";
  const notesEn = f.ownerNotes
    ? `<p>In performing the services, the Provider shall take into account the Owner's notes stated in the service request, which read: <bdi dir="rtl">«${f.ownerNotes}»</bdi>.</p>`
    : "";
  // FAL is not yet mandatory for FM companies (Abdallah, 2026-09-25): printed only when the provider has one.
  const falAr = f.providerFalLicenseNumber
    ? `، ورخصة فال رقم (${ltr(f.providerFalLicenseNumber)}) الصادرة عن الهيئة العامة للعقار`
    : "";
  const falEn = f.providerFalLicenseNumber ? `, REGA FAL License No. (${f.providerFalLicenseNumber})` : "";
  const latinOr = (v: string | null, fallback: string) => (v ? ltr(v) : fallback);
  // Many registered names already start with "شركة"; only add the word when it is missing.
  const companyAr = /^\s*شركة/.test(f.providerCompanyName) ? f.providerCompanyName : `شركة ${f.providerCompanyName}`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
  @page { size: A4; margin: 16mm 13mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Cairo', Arial, sans-serif;
    margin: 0;
    color: #12242c;
    font-size: 11px;
    line-height: 1.75;
  }
  .row { display: grid; grid-template-columns: 1fr 1fr; column-gap: 22px; direction: rtl; }
  .row > .ar { direction: rtl; text-align: right; }
  .row > .en { direction: ltr; text-align: left; color: #2f3e45; font-size: 10.5px; }
  .clause { break-inside: avoid; page-break-inside: avoid; margin-top: 12px; }
  h1 { font-size: 16px; color: #065B98; margin: 0; }
  h2 { font-size: 12.5px; color: #065B98; margin: 0 0 4px; }
  .en h2 { font-size: 12px; }
  hr { border: none; border-top: 1px solid #d7e2e6; margin: 14px 0; }
  p { margin: 4px 0; }
  ol { margin: 2px 0; padding-inline-start: 18px; }
  li { margin: 2px 0; }
  .masthead {
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; column-gap: 16px;
    direction: rtl; border-bottom: 2px solid #065B98; padding-bottom: 10px;
  }
  .masthead .ar { text-align: right; }
  .masthead .en { direction: ltr; text-align: left; }
  .masthead .mid { text-align: center; }
  .logo { display: block; margin: 0 auto; }
  .meta { margin-top: 8px; font-size: 10.5px; }
  .meta .en { font-size: 10px; }
  .party { background: #f4f8fa; border: 1px solid #dbe6ea; border-radius: 6px; padding: 6px 10px; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10.5px; }
  table.signatures th, table.signatures td,
  table.line-items th, table.line-items td {
    border: 1px solid #cfd9dd; padding: 7px; text-align: center;
  }
  table.signatures, table.line-items { direction: rtl; break-inside: avoid; }
  table.line-items thead, table.signatures th { background: #eef5f8; color: #065B98; }
  table.line-items td.num { direction: ltr; }
  .signature-cell { height: 46px; }
  /* Small and muted, not hidden — a genuine technical reference, not concealed text. Signit's
     anchor search needs Latin text at this exact spot (Arabic anchor search is unreliable, see
     the constant declarations above); the visible signing instruction stays Arabic. */
  .signature-marker { display: block; font-size: 7px; color: #c3ced1; line-height: 1.4; }
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
    DEMO: NOT LEGALLY BINDING
    <span class="demo-banner-sub">عرض تجريبي، غير ملزم نظاماً</span>
  </div>

  <header class="masthead">
    <div class="ar"><h1>عقد خدمات تشغيل وصيانة مرافق</h1></div>
    <div class="mid">${ARCH_LOGO_BW}</div>
    <div class="en"><h1>Facility Operation &amp; Maintenance Services Agreement</h1></div>
  </header>

  ${row(
    `<strong>رقم العقد:</strong> ${ltr(f.contractNumber)}<br /><strong>تاريخ التحرير:</strong> ${f.contractDate}`,
    `<strong>Contract No.:</strong> ${f.contractNumber}<br /><strong>Date:</strong> ${f.contractDateEn}`,
    "meta",
  )}

  ${row(`<p>حُرِّر هذا العقد بين كل من:</p>`, `<p>This Agreement is made between:</p>`)}

  <div class="party">${row(
    `<strong>الطرف الأول (المالك):</strong> ${f.ownerName}، بصفته مالك العقار المعروف باسم "${f.propertyName}"،
      الكائن في ${f.propertyAddress}، ${f.propertyCity} (${btype.ar}، ${units.ar}).<br />
      <strong>الجوال:</strong> ${latinOr(f.ownerPhone, NOT_SPECIFIED_AR)} &nbsp;|&nbsp;
      <strong>البريد الإلكتروني:</strong> ${latinOr(f.ownerEmail, NOT_SPECIFIED_AR)}`,
    `<strong>First Party (Owner):</strong> ${f.ownerName}, as owner of the property known as "${f.propertyName}",
      located at ${f.propertyAddress}, ${f.propertyCity} (${btype.en}, ${units.en}).<br />
      <strong>Mobile:</strong> ${or(f.ownerPhone, NOT_SPECIFIED_EN)} &nbsp;|&nbsp;
      <strong>Email:</strong> ${or(f.ownerEmail, NOT_SPECIFIED_EN)}`,
  )}</div>

  <div class="party">${row(
    `<strong>الطرف الثاني (مقدم الخدمة):</strong> ${companyAr}، سجل تجاري رقم
      (${latinOr(f.providerCrNumber, NOT_SPECIFIED_AR)})${falAr}، ويمثلها في التوقيع على هذا العقد ${providerRepAr}.<br />
      <strong>الجوال:</strong> ${latinOr(f.providerPhone, NOT_SPECIFIED_AR)} &nbsp;|&nbsp;
      <strong>البريد الإلكتروني:</strong> ${latinOr(f.providerEmail, NOT_SPECIFIED_AR)}`,
    `<strong>Second Party (Provider):</strong> ${f.providerCompanyName}, Commercial Registration No.
      (${or(f.providerCrNumber, NOT_SPECIFIED_EN)})${falEn},
      represented in signing this Agreement by ${providerRepEn}.<br />
      <strong>Mobile:</strong> ${or(f.providerPhone, NOT_SPECIFIED_EN)} &nbsp;|&nbsp;
      <strong>Email:</strong> ${or(f.providerEmail, NOT_SPECIFIED_EN)}`,
  )}</div>

  ${row(`<p>ويُشار إليهما فيما بعد مجتمعَين بـ"الطرفين".</p>`, `<p>Collectively "the Parties".</p>`)}

  ${clause(
    "التمهيد",
    "Preamble",
    `<p>حيث إن الطرف الأول يملك العقار الموصوف أعلاه، ويرغب في التعاقد مع منشأة متخصصة لتشغيله وصيانته؛ وحيث إن
      الطرف الثاني منشأة متخصصة في إدارة المرافق، مسجّلة نظاماً لمزاولة هذا النشاط في المملكة العربية السعودية؛ وحيث إن
      الطرف الثاني تقدّم بعرض سعر قَبِله الطرف الأول عبر منصة عِمارة الإلكترونية (${ltr("emaraa.app")})، التي اقتصر
      دورها على تيسير التعارف والتواصل بين الطرفين دون أن تكون طرفاً في هذا العقد (البند 9)؛</p>
    <p>فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على ما يلي، ويُعدّ هذا التمهيد جزءاً لا يتجزأ
      من العقد، ومكمّلاً لأحكامه ومفسّراً لها.</p>`,
    `<p>Whereas the Owner owns the property described above and wishes to engage a specialized entity to operate
      and maintain it; whereas the Provider is a facility-management company duly registered to carry out this activity
      in the Kingdom of Saudi Arabia; and whereas the Provider submitted a price quotation which the Owner accepted
      through the Emaraa online platform (emaraa.app), whose role was limited to facilitating the introduction and
      communication between the Parties and which is not a party to this Agreement (Section 9);</p>
    <p>The Parties, having full legal capacity, have agreed as follows. This Preamble forms an integral part of
      this Agreement and shall be read together with it.</p>`,
  )}

  ${clause(
    "البند 1: نطاق الخدمات",
    "1. Scope of Services",
    `<p>يلتزم الطرف الثاني بتقديم الخدمات الآتية للعقار محل هذا العقد: ${scopeAr}</p>${notesAr}`,
    `<p>The Provider shall provide the following services for the property subject to this Agreement:
      ${scopeEn}</p>${notesEn}`,
  )}

  ${clause(
    "البند 2: مدة العقد",
    "2. Term",
    `<p>مدة هذا العقد سنة ميلادية واحدة تبدأ من تاريخ ${f.contractDate}، وتتجدد تلقائياً لمدة أو مدد مماثلة، ما لم
      يُخطر أحد الطرفين الطرفَ الآخر كتابياً برغبته في عدم التجديد قبل انتهاء المدة الأصلية أو المدة المجدَّدة
      بثلاثين (30) يوماً على الأقل.</p>`,
    `<p>This Agreement has a term of one (1) Gregorian year starting on ${f.contractDateEn}, and renews
      automatically for one or more equal terms unless either Party notifies the other in writing of its wish not
      to renew at least thirty (30) days before the end of the initial or renewed term.</p>`,
  )}

  ${clause(
    "البند 3: قيمة العقد وطريقة السداد",
    "3. Contract Value and Payment",
    list([
      `القيمة الإجمالية لهذا العقد (${valueAr}) ريال سعودي سنوياً، شاملة ضريبة القيمة المضافة${perUnitAr}، وفق
        تفصيل الأسعار الوارد في الملحق (أ).`,
      `يُعدّ عرض السعر الفني والمالي المقدَّم من الطرف الثاني، والمقبول من الطرف الأول عبر منصة عِمارة، الملحقَ (ب)
        لهذا العقد، ويُرفق به كما هو دون تعديل.`,
      `يُعدّ الملحقان (أ) و(ب) جزءاً لا يتجزأ من هذا العقد، وفي حال التعارض بين أحكام العقد وأيٍّ من الملحقين تُقدَّم
        أحكام العقد.`,
      `تُسدَّد القيمة وفق جدول الدفعات المبيَّن في الملحق (ب)، مقابل فاتورة ضريبية نظامية يُصدرها الطرف الثاني عن كل
        دفعة.`,
    ]),
    list([
      `The total value of this Agreement is (${valueEn}) SAR per year, inclusive of VAT${perUnitEn}, as itemized in
        Annex A.`,
      `The Provider's technical and financial proposal, as accepted by the Owner through the Emaraa platform, is
        Annex B to this Agreement and is attached to it unchanged.`,
      `Annexes A and B form an integral part of this Agreement. If the terms of this Agreement conflict with either
        Annex, the terms of this Agreement prevail.`,
      `The value is payable according to the payment schedule set out in Annex B, against a valid tax invoice
        issued by the Provider for each payment.`,
    ]),
  )}

  ${clause(
    "البند 4: التزامات الطرف الثاني",
    "4. Provider Obligations",
    `<p>يلتزم الطرف الثاني بما يلي:</p>
    <p>أ. تنفيذ الخدمات المتفق عليها وفق الأصول المهنية المتعارف عليها في القطاع، وبما يتفق مع الأنظمة واللوائح
      المعمول بها في المملكة.</p>
    <p>ب. المحافظة على سريان سجله التجاري وسائر التراخيص النظامية اللازمة لمزاولة نشاطه طوال مدة العقد، وإخطار
      الطرف الأول كتابياً وعلى الفور في حال تعليق أيٍّ منها أو إلغائه.</p>
    <p>ج. توفير كوادر مؤهلة ومدرَّبة على اشتراطات السلامة والصحة المهنية.</p>
    <p>د. الاستجابة لبلاغات الأعطال والحالات الطارئة على مدار الساعة، وفق ما هو محدد في نطاق الخدمات.</p>`,
    `<p>The Provider shall:</p>
    <p>(a) perform the agreed services to the professional standards recognized in the sector and in compliance
      with the laws and regulations in force in the Kingdom;</p>
    <p>(b) keep its Commercial Registration and all other statutory licences required for its activity valid
      throughout the term, and notify the Owner in writing immediately if any of them is suspended or
      cancelled;</p>
    <p>(c) provide qualified staff trained in occupational health and safety requirements;</p>
    <p>(d) respond to fault reports and emergencies 24/7, as specified in the Scope of Services.</p>`,
  )}

  ${clause(
    "البند 5: التزامات الطرف الأول",
    "5. Owner Obligations",
    `<p>يلتزم الطرف الأول بما يلي:</p>
    <p>أ. تمكين الطرف الثاني وكوادره من الوصول إلى العقار ومرافقه في الأوقات اللازمة لأداء الخدمات.</p>
    <p>ب. سداد المستحقات المالية في مواعيدها وفق البند 3.</p>
    <p>ج. إبلاغ الطرف الثاني بأي أعطال أو ملاحظات على الخدمة خلال مدة معقولة من علمه بها.</p>`,
    `<p>The Owner shall:</p>
    <p>(a) give the Provider and its staff access to the property and its facilities at the times needed to
      perform the services;</p>
    <p>(b) pay amounts due on time in accordance with Section 3;</p>
    <p>(c) report any faults or service issues to the Provider within a reasonable time of becoming aware of
      them.</p>`,
  )}

  ${clause(
    "البند 6: المسؤولية والتأمين",
    "6. Liability and Insurance",
    list([
      `يكون الطرف الثاني مسؤولاً عن أي ضرر يلحق بالعقار أو بالطرف الأول أو بالغير، متى نتج عن خطئه أو إهماله، أو خطأ
        تابعيه أو إهمالهم، أثناء تنفيذ هذا العقد، ويلتزم بإصلاح الضرر أو التعويض عنه وفقاً للأنظمة المعمول بها.`,
      `يلتزم الطرف الثاني بالحصول على وثيقة تأمين سارية ضد المسؤولية تجاه الغير، والمحافظة على سريانها طوال مدة
        العقد، وتقديم ما يثبت ذلك إلى الطرف الأول عند طلبه.`,
      `يلتزم الطرف الثاني بتسجيل عماله لدى المؤسسة العامة للتأمينات الاجتماعية وفق الأنظمة، ويتحمّل وحده جميع
        الالتزامات النظامية المتعلقة بهم.`,
    ]),
    list([
      `The Provider is liable for any damage to the property, the Owner, or third parties caused by its fault or
        negligence, or that of its staff, in performing this Agreement, and shall repair or compensate for such
        damage in accordance with applicable laws.`,
      `The Provider shall obtain and maintain valid third-party liability insurance throughout the term, and
        provide proof of it to the Owner on request.`,
      `The Provider shall register its workers with the General Organization for Social Insurance as required by
        law, and shall bear sole responsibility for all statutory obligations relating to them.`,
    ]),
  )}

  ${clause(
    "البند 7: القوة القاهرة",
    "7. Force Majeure",
    list([
      `لا يُعدّ أي من الطرفين مخلاً بالتزاماته إذا تعذّر عليه تنفيذها كلياً أو جزئياً بسبب قوة قاهرة خارجة عن إرادته،
        لا يمكن توقعها ولا دفعها، كالكوارث الطبيعية والأوبئة والقرارات الحكومية الملزمة.`,
      `يلتزم الطرف المتأثر بإخطار الطرف الآخر كتابياً خلال سبعة (7) أيام من وقوع القوة القاهرة، ويُوقَف تنفيذ
        الالتزامات المتأثرة بها طوال مدة قيامها.`,
      `إذا استمرت القوة القاهرة أكثر من ستين (60) يوماً متصلة، جاز لأي من الطرفين إنهاء العقد بإشعار كتابي دون
        تعويض، مع سداد مستحقات الخدمات المنفَّذة فعلياً حتى تاريخ الإنهاء.`,
    ]),
    list([
      `Neither Party is in breach if it is wholly or partly unable to perform its obligations due to a force
        majeure event beyond its control that could not be foreseen or prevented, such as natural disasters,
        epidemics, or binding government decisions.`,
      `The affected Party shall notify the other in writing within seven (7) days of the event, and performance
        of the affected obligations is suspended for as long as the event continues.`,
      `If the force majeure event continues for more than sixty (60) consecutive days, either Party may terminate
        this Agreement by written notice without compensation, subject to payment for services actually
        performed up to the termination date.`,
    ]),
  )}

  ${clause(
    "البند 8: إنهاء العقد",
    "8. Termination",
    list([
      `يجوز لأي من الطرفين إنهاء هذا العقد بموجب إشعار كتابي يوجّهه إلى الطرف الآخر قبل التاريخ المحدد للإنهاء
        بثلاثين (30) يوماً على الأقل.`,
      `يجوز لأي من الطرفين إنهاء العقد فوراً إذا أخلّ الطرف الآخر إخلالاً جوهرياً بأيٍّ من التزاماته، ولم يعالج
        الإخلال خلال خمسة عشر (15) يوماً من تاريخ إنذاره كتابياً.`,
      `لا يُخلّ إنهاء العقد لأي سبب بالحقوق والالتزامات المستحقة لأي من الطرفين قبل تاريخ الإنهاء.`,
    ]),
    list([
      `Either Party may terminate this Agreement by written notice to the other at least thirty (30) days before
        the intended termination date.`,
      `Either Party may terminate this Agreement immediately if the other Party materially breaches any of its
        obligations and fails to remedy the breach within fifteen (15) days of written notice.`,
      `Termination for any reason does not affect rights and obligations that accrued to either Party before the
        termination date.`,
    ]),
  )}

  ${clause(
    "البند 9: دور منصة عِمارة",
    "9. Role of the Emaraa Platform",
    `<p>تعمل منصة عِمارة وسيطاً إلكترونياً يقتصر دوره على تيسير التعارف والتعاقد بين ملاك العقارات ومقدمي خدمات
      إدارة المرافق، وليست طرفاً في هذا العقد. ولا تتحمل عِمارة أي مسؤولية عن تنفيذ الخدمات محل العقد أو جودتها،
      ولا عن أي التزام مالي بين الطرفين، ويكون أي نزاع ينشأ عن هذا العقد أو يتعلق به بين الطرفين مباشرة، دون أن
      تكون عِمارة طرفاً فيه.</p>`,
    `<p>Emaraa acts as an online intermediary whose role is limited to facilitating introductions and contracting
      between property owners and facility-management providers, and is not a party to this Agreement. Emaraa
      bears no responsibility for the performance or quality of the services under this Agreement, or for any
      financial obligation between the Parties. Any dispute arising from or relating to this Agreement is between
      the Parties directly, and Emaraa is not a party to it.</p>`,
  )}

  ${clause(
    "البند 10: السرية",
    "10. Confidentiality",
    `<p>يلتزم كل طرف بالمحافظة على سرية المعلومات التي يطّلع عليها بسبب هذا العقد أو بمناسبة تنفيذه، وبعدم
      إفشائها لأي طرف ثالث إلا بموافقة كتابية مسبقة من الطرف الآخر، أو متى كان الإفصاح مطلوباً بموجب نظام أو أمر
      صادر من جهة مختصة. ويظل هذا الالتزام قائماً بعد انتهاء العقد لأي سبب.</p>`,
    `<p>Each Party shall keep confidential any information it obtains because of or in the course of performing
      this Agreement, and shall not disclose it to any third party without the other Party's prior written
      consent, unless disclosure is required by law or by order of a competent authority. This obligation
      survives the end of this Agreement for any reason.</p>`,
  )}

  ${clause(
    "البند 11: الإشعارات",
    "11. Notices",
    `<p>تكون جميع الإشعارات والمراسلات المتعلقة بهذا العقد مكتوبة، وتُرسَل إلى عنوان البريد الإلكتروني أو رقم الجوال
      المبيَّنَين لكل طرف في صدر هذا العقد، أو إلى أي عنوان آخر يُخطر به أحد الطرفين الطرفَ الآخر كتابياً، ويُعدّ
      الإشعار نافذاً من تاريخ إرساله.</p>`,
    `<p>All notices and correspondence relating to this Agreement shall be in writing and sent to the email
      address or mobile number stated for each Party at the head of this Agreement, or to any other address either
      Party notifies to the other in writing. A notice takes effect on the date it is sent.</p>`,
  )}

  ${clause(
    "البند 12: النظام الواجب التطبيق وتسوية النزاعات",
    "12. Governing Law and Dispute Resolution",
    `<p>يخضع هذا العقد لأنظمة المملكة العربية السعودية، ويُفسَّر وفقاً لها. ويسعى الطرفان إلى تسوية أي خلاف ينشأ
      عنه أو يتعلق به تسويةً ودية، فإن تعذّر ذلك أُحيل النزاع إلى الجهة المختصة في المملكة العربية السعودية.</p>`,
    `<p>This Agreement is governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.
      The Parties shall seek to settle any dispute arising from or relating to it amicably, failing which the
      dispute shall be referred to the competent authority in the Kingdom of Saudi Arabia.</p>`,
  )}

  ${clause(
    "البند 13: التوقيع الإلكتروني",
    "13. Electronic Signature",
    `<p>يقرّ الطرفان بأن هذا العقد وُقِّع إلكترونياً عبر منصة "${vendorLabel}"، بعد التحقق من كل طرف وفق وسيلة
      التحقق المعتمدة لديها، وبأن هذا التوقيع معتبر شرعاً ونظاماً، وله حجية التوقيع الخطي وآثاره، وفقاً لنظام
      التعاملات الإلكترونية الصادر بالمرسوم الملكي رقم (م/18) وتاريخ 8/3/1428هـ. الرقم المرجعي للمعاملة لدى
      ${vendorLabel}: ${f.signatureRequestId ? ltr(f.signatureRequestId) : requestIdAr}.</p>`,
    `<p>The Parties acknowledge that this Agreement was signed electronically via the "${vendorLabel}" platform,
      after each Party was verified through the verification method that platform applies, and that this
      signature is valid under Sharia and law and carries the legal effect of a handwritten signature, in
      accordance with the Electronic Transactions Law issued by Royal Decree No. (M/18) dated 8/3/1428H.
      ${vendorLabel} transaction reference number: ${requestIdEn}.</p>`,
  )}

  ${clause(
    "البند 14: أحكام ختامية",
    "14. Final Provisions",
    list([
      `يمثّل هذا العقد وملحقاه الاتفاق الكامل بين الطرفين بشأن موضوعه، ويحل محل أي تفاهمات أو مراسلات سابقة عليه،
        شفهية كانت أو مكتوبة.`,
      `لا يُعتدّ بأي تعديل على هذا العقد إلا إذا كان مكتوباً وموقّعاً من الطرفين.`,
      `حُرِّر هذا العقد باللغتين العربية والإنجليزية، وفي حال وجود أي اختلاف أو تعارض بين النصين يُعتمد النص
        العربي.`,
      `وُقِّع هذا العقد إلكترونياً، ويحتفظ كل طرف بنسخة إلكترونية منه لها الحجية ذاتها.`,
    ]),
    list([
      `This Agreement and its two Annexes constitute the entire agreement between the Parties on its subject
        matter and supersede any prior understandings or correspondence, whether oral or written.`,
      `No amendment to this Agreement is valid unless made in writing and signed by both Parties.`,
      `This Agreement is made in Arabic and English. In case of any difference or conflict between the two texts,
        the Arabic text prevails.`,
      `This Agreement is signed electronically, and each Party keeps an electronic copy of it with the same legal
        effect.`,
    ]),
  )}

  <hr />
  ${row(`<h2>التوقيعات</h2>`, `<h2>Signatures</h2>`)}
  <table class="signatures">
    <tr>
      <th></th>
      <th>الطرف الأول (المالك)<br />First Party (Owner)</th>
      <th>الطرف الثاني (مقدم الخدمة)<br />Second Party (Provider)</th>
    </tr>
    <tr>
      <td>الاسم / Name</td>
      <td>${f.ownerName}</td>
      <td>${f.providerCompanyName}، ويمثلها ${providerRepAr}</td>
    </tr>
    <tr>
      <td>التوقيع / Signature</td>
      <td class="signature-cell">التوقيع هنا<span class="signature-marker">${OWNER_ANCHOR_TAG}</span></td>
      <td class="signature-cell">التوقيع هنا<span class="signature-marker">${PROVIDER_ANCHOR_TAG}</span></td>
    </tr>
    <tr>
      <td>التاريخ / Date</td>
      <td>${f.contractDate}</td>
      <td>${f.contractDate}</td>
    </tr>
  </table>

  ${renderLineItemsTable(f.lineItems)}

  ${row(
    `<h2>الملحق (ب): عرض السعر الفني والمالي المقدَّم من الطرف الثاني</h2>
      <p>مرفق في الصفحات التالية كما قدّمه الطرف الثاني عبر منصة عِمارة، دون تعديل.</p>`,
    `<h2>Annex B: The Provider's Technical and Financial Proposal</h2>
      <p>Attached on the following pages as submitted by the Provider through the Emaraa platform, unchanged.</p>`,
  )}
</body>
</html>`;
}
