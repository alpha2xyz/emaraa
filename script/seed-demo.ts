/**
 * Seed the investor DEMO database with fabricated data.
 *
 * Run:  npx tsx --env-file=.env.demo script/seed-demo.ts
 *       (or `npm run demo:seed`, which does the same)
 *
 * WHY THIS EXISTS
 * Walking an investor through emaraa.app means either exposing a real owner's
 * phone number and building, or showing an almost-empty marketplace. This script
 * fills a SEPARATE Supabase project with invented owners, providers, requests and
 * offers so neither has to happen.
 *
 * ── SAFETY ─────────────────────────────────────────────────────────────────────
 * This script TRUNCATES every business table before inserting. It therefore
 * refuses to run unless SUPABASE_URL points at the demo project. The check is a
 * hardcoded constant, not an env var and not a flag: a script that can wipe a
 * database must be unable to point at the wrong one. Do not add an override.
 *
 * Every name, company, phone number, address and price below is INVENTED.
 * Company names in particular must never be replaced with real FM companies --
 * putting a real licensed company's name next to a fabricated offer is a live
 * reputational problem, not a cosmetic one. Nothing here comes from the REGA FAL
 * dataset.
 */
import { createClient } from "@supabase/supabase-js";

// ── Guards ─────────────────────────────────────────────────────────────────────

/** The demo Supabase project. Set this once, when the demo project is created. */
const DEMO_PROJECT_REF = process.env.DEMO_PROJECT_REF ?? "";

/** Production. Named explicitly so the refusal below can be unambiguous. */
const PRODUCTION_PROJECT_REF = "txzbzpnrclkdodosbndy";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function refuse(reason: string): never {
  console.error(`\n  REFUSING TO RUN: ${reason}\n`);
  process.exit(1);
}

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  refuse("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is empty. Did you pass --env-file=.env.demo?");
}
if (SUPABASE_URL.includes(PRODUCTION_PROJECT_REF)) {
  refuse(`SUPABASE_URL points at PRODUCTION (${PRODUCTION_PROJECT_REF}). This script deletes data.`);
}
if (!DEMO_PROJECT_REF) {
  refuse("DEMO_PROJECT_REF is not set. Set it in .env.demo to the demo project's ref.");
}
if (!SUPABASE_URL.includes(DEMO_PROJECT_REF)) {
  refuse(`SUPABASE_URL does not point at the demo project (${DEMO_PROJECT_REF}).`);
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Fabricated data ────────────────────────────────────────────────────────────
//
// Phone numbers use the 05000000xx block so they read as obviously fake and can
// never collide with a real Saudi mobile. These same numbers go into
// OTP_TEST_NUMBERS on the demo deployment, which is what makes login work
// without SMS (server/routes.ts:52-59).
//
// Volume is deliberately small and plausible. No aggregate counters, no "deals
// closed" figures -- PRODUCT-FACTS.md §8 forbids publishing platform counts, and
// implying traction Emaraa does not have would be a misrepresentation to an
// investor, not a demo polish decision.

type SeedOwner = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  property: { id: string; name: string; type: "residential" | "commercial"; district: string; units: number };
  request: { id: string; description: string; startDate: string | null; status: string } | null;
};

const OWNERS: SeedOwner[] = [
  {
    id: "11111111-0000-4000-8000-000000000001",
    phone: "0500000001",
    name: "نورة العتيبي",
    email: "demo.owner1@example.com",
    property: { id: "22222222-0000-4000-8000-000000000001", name: "عمارة الياسمين", type: "residential", district: "الياسمين", units: 24 },
    request: {
      id: "33333333-0000-4000-8000-000000000001",
      description: "عمارة سكنية من 24 وحدة، نبحث عن عقد تشغيل وصيانة سنوي شامل يغطي المصاعد والتكييف والنظافة العامة للمواقف والسلالم.",
      startDate: "2026-10-01",
      status: "pending",
    },
  },
  {
    id: "11111111-0000-4000-8000-000000000002",
    phone: "0500000002",
    name: "سعد القحطاني",
    email: null,
    property: { id: "22222222-0000-4000-8000-000000000002", name: "برج قرطبة التجاري", type: "commercial", district: "قرطبة", units: 18 },
    request: {
      id: "33333333-0000-4000-8000-000000000002",
      description: "برج مكاتب من 18 وحدة. المطلوب عقد تشغيل وصيانة يشمل التكييف المركزي وأنظمة الإطفاء والنظافة اليومية للمداخل.",
      startDate: "2026-11-01",
      status: "pending",
    },
  },
  {
    id: "11111111-0000-4000-8000-000000000003",
    phone: "0500000003",
    name: "منيرة الدوسري",
    email: "demo.owner3@example.com",
    property: { id: "22222222-0000-4000-8000-000000000003", name: "مجمع النرجس السكني", type: "residential", district: "النرجس", units: 32 },
    request: {
      id: "33333333-0000-4000-8000-000000000003",
      description: "مجمع سكني 32 وحدة، اتحاد الملاك يبحث عن شركة إدارة مرافق لعقد سنوي يشمل الصيانة الوقائية والنظافة والحراسة.",
      startDate: "2026-10-15",
      status: "pending",
    },
  },
  {
    id: "11111111-0000-4000-8000-000000000004",
    phone: "0500000004",
    name: "فيصل الشمري",
    email: null,
    property: { id: "22222222-0000-4000-8000-000000000004", name: "عمارة الملقا", type: "residential", district: "الملقا", units: 12 },
    request: {
      id: "33333333-0000-4000-8000-000000000004",
      description: "عمارة 12 وحدة، نحتاج عرض سعر لعقد صيانة سنوي يشمل المصاعد والسباكة والكهرباء.",
      startDate: null,
      status: "pending",
    },
  },
  {
    // An owner who registered and never listed a property -- the real drop-off
    // point (10 of 16 owners). Kept in the demo because the honest funnel is a
    // better story to an investor than a fake-perfect one.
    id: "11111111-0000-4000-8000-000000000005",
    phone: "0500000005",
    name: "عبدالعزيز الحربي",
    email: null,
    property: { id: "", name: "", type: "residential", district: "", units: 0 },
    request: null,
  },
];

type SeedProvider = {
  userId: string;
  providerId: string;
  phone: string;
  contactName: string;
  company: string;
  email: string;
  description: string;
  approved: boolean;
};

// Invented company names. See the header note -- do not swap these for real companies.
const PROVIDERS: SeedProvider[] = [
  {
    userId: "44444444-0000-4000-8000-000000000001",
    providerId: "55555555-0000-4000-8000-000000000001",
    phone: "0500000011",
    contactName: "ماجد السبيعي",
    company: "أفق الشمال لإدارة المرافق",
    email: "demo.provider1@example.com",
    description: "شركة إدارة مرافق تعمل في الرياض، متخصصة في عقود التشغيل والصيانة للمباني السكنية والتجارية.",
    approved: true,
  },
  {
    userId: "44444444-0000-4000-8000-000000000002",
    providerId: "55555555-0000-4000-8000-000000000002",
    phone: "0500000012",
    contactName: "هيا المطيري",
    company: "ركائز التشغيل والصيانة",
    email: "demo.provider2@example.com",
    description: "خدمات صيانة وقائية وتشغيل شامل، مع فرق ميدانية تغطي شمال وشرق الرياض.",
    approved: true,
  },
  {
    userId: "44444444-0000-4000-8000-000000000003",
    providerId: "55555555-0000-4000-8000-000000000003",
    phone: "0500000013",
    contactName: "طلال العنزي",
    company: "واحة المرافق المتكاملة",
    email: "demo.provider3@example.com",
    description: "إدارة مرافق متكاملة تشمل النظافة والحراسة وصيانة الأنظمة الميكانيكية.",
    approved: true,
  },
  {
    userId: "44444444-0000-4000-8000-000000000004",
    providerId: "55555555-0000-4000-8000-000000000004",
    phone: "0500000014",
    contactName: "ريم الزهراني",
    company: "سواعد الرياض للتشغيل",
    email: "demo.provider4@example.com",
    description: "عقود تشغيل وصيانة سنوية للمجمعات السكنية واتحادات الملاك.",
    approved: true,
  },
  {
    userId: "44444444-0000-4000-8000-000000000005",
    providerId: "55555555-0000-4000-8000-000000000005",
    phone: "0500000015",
    contactName: "خالد الغامدي",
    company: "مسار الصيانة الشاملة",
    email: "demo.provider5@example.com",
    description: "صيانة مصاعد وأنظمة تكييف مركزي، مع عقود استجابة طارئة.",
    approved: true,
  },
  {
    userId: "44444444-0000-4000-8000-000000000006",
    providerId: "55555555-0000-4000-8000-000000000006",
    phone: "0500000016",
    contactName: "بدر الحميد",
    company: "درع المنشآت للتشغيل",
    email: "demo.provider6@example.com",
    description: "أنظمة السلامة والإطفاء والحراسة للمباني التجارية.",
    approved: true,
  },
  {
    // Pending review -- shows the verification step, which is the product's
    // core claim (PRODUCT-FACTS.md §4) and worth having visible in a demo.
    userId: "44444444-0000-4000-8000-000000000007",
    providerId: "55555555-0000-4000-8000-000000000007",
    phone: "0500000017",
    contactName: "سلمان الرشيد",
    company: "نماء المرافق الحديثة",
    email: "demo.provider7@example.com",
    description: "شركة تشغيل وصيانة حديثة التأسيس، تقدم عقودًا مرنة للمباني الصغيرة.",
    approved: false,
  },
];

type SeedOffer = {
  id: string;
  requestId: string;
  providerId: string;
  priceTotal: number;
  durationMonths: number;
  notes: string;
  lineItems: { service: string; price_per_unit: number }[];
  status: "pending" | "accepted" | "rejected";
};

const OFFERS: SeedOffer[] = [
  // عمارة الياسمين -- three competing offers, the comparison the product exists for
  {
    id: "66666666-0000-4000-8000-000000000001",
    requestId: "33333333-0000-4000-8000-000000000001",
    providerId: "55555555-0000-4000-8000-000000000001",
    priceTotal: 96000,
    durationMonths: 12,
    notes: "يشمل العرض صيانة وقائية شهرية للمصاعد والتكييف، ونظافة يومية للمداخل والمواقف، مع فريق مقيم 5 أيام أسبوعيًا.",
    lineItems: [
      { service: "صيانة المصاعد", price_per_unit: 1200 },
      { service: "صيانة التكييف", price_per_unit: 1500 },
      { service: "النظافة العامة", price_per_unit: 1300 },
    ],
    status: "pending",
  },
  {
    id: "66666666-0000-4000-8000-000000000002",
    requestId: "33333333-0000-4000-8000-000000000001",
    providerId: "55555555-0000-4000-8000-000000000002",
    priceTotal: 88800,
    durationMonths: 12,
    notes: "عقد سنوي بزيارات صيانة نصف شهرية، واستجابة للأعطال الطارئة خلال 4 ساعات.",
    lineItems: [
      { service: "صيانة المصاعد", price_per_unit: 1100 },
      { service: "صيانة التكييف", price_per_unit: 1400 },
      { service: "النظافة العامة", price_per_unit: 1200 },
    ],
    status: "pending",
  },
  {
    id: "66666666-0000-4000-8000-000000000003",
    requestId: "33333333-0000-4000-8000-000000000001",
    providerId: "55555555-0000-4000-8000-000000000005",
    priceTotal: 104400,
    durationMonths: 12,
    notes: "عرض شامل مع قطع الغيار الأساسية للمصاعد ضمن السعر، وتقرير شهري لاتحاد الملاك.",
    lineItems: [
      { service: "صيانة المصاعد شاملة قطع الغيار", price_per_unit: 1900 },
      { service: "صيانة التكييف", price_per_unit: 1500 },
      { service: "النظافة العامة", price_per_unit: 950 },
    ],
    status: "pending",
  },

  // برج قرطبة -- two offers, both pending.
  //
  // Deliberately NOT seeded as accepted+rejected with a deal row attached. In the
  // real product, acceptance is one atomic server action (PATCH /api/offers/:id/status):
  // it auto-rejects the other offers, flips the request status, creates the deal and
  // unlocks the PDF. Hand-assembling that end state here would produce a screen that
  // the app itself can never generate, and the first thing an investor would be shown
  // is the one screen that was faked.
  //
  // So acceptance is performed LIVE during the walkthrough instead -- it takes one
  // click, the server produces a state that is correct by construction, and "watch
  // what happens when the owner accepts" is a better moment than a static result.
  // `npm run demo:reset` puts it back to pending for the next meeting.
  {
    id: "66666666-0000-4000-8000-000000000004",
    requestId: "33333333-0000-4000-8000-000000000002",
    providerId: "55555555-0000-4000-8000-000000000003",
    priceTotal: 142000,
    durationMonths: 12,
    notes: "تشغيل كامل للبرج يشمل التكييف المركزي وأنظمة الإطفاء والنظافة اليومية، مع مشرف موقع دوام كامل.",
    lineItems: [
      { service: "تشغيل التكييف المركزي", price_per_unit: 3800 },
      { service: "أنظمة الإطفاء والسلامة", price_per_unit: 2100 },
      { service: "النظافة اليومية", price_per_unit: 1990 },
    ],
    status: "pending",
  },
  {
    id: "66666666-0000-4000-8000-000000000005",
    requestId: "33333333-0000-4000-8000-000000000002",
    providerId: "55555555-0000-4000-8000-000000000006",
    priceTotal: 155000,
    durationMonths: 12,
    notes: "عرض يركز على أنظمة السلامة والإطفاء مع تدقيق ربع سنوي معتمد.",
    lineItems: [
      { service: "أنظمة الإطفاء والسلامة", price_per_unit: 3400 },
      { service: "تشغيل التكييف المركزي", price_per_unit: 3600 },
      { service: "الحراسة الأمنية", price_per_unit: 1610 },
    ],
    status: "pending",
  },

  // مجمع النرجس -- two offers
  {
    id: "66666666-0000-4000-8000-000000000006",
    requestId: "33333333-0000-4000-8000-000000000003",
    providerId: "55555555-0000-4000-8000-000000000004",
    priceTotal: 128000,
    durationMonths: 12,
    notes: "عقد إدارة مرافق لاتحاد الملاك يشمل الصيانة الوقائية والنظافة والحراسة، مع تقرير شهري.",
    lineItems: [
      { service: "الصيانة الوقائية", price_per_unit: 1700 },
      { service: "النظافة العامة", price_per_unit: 1100 },
      { service: "الحراسة الأمنية", price_per_unit: 1200 },
    ],
    status: "pending",
  },
  {
    id: "66666666-0000-4000-8000-000000000007",
    requestId: "33333333-0000-4000-8000-000000000003",
    providerId: "55555555-0000-4000-8000-000000000002",
    priceTotal: 119500,
    durationMonths: 12,
    notes: "عرض بدون حراسة أمنية، مع إمكانية إضافتها لاحقًا بملحق منفصل.",
    lineItems: [
      { service: "الصيانة الوقائية", price_per_unit: 1850 },
      { service: "النظافة العامة", price_per_unit: 1885 },
    ],
    status: "pending",
  },

  // عمارة الملقا -- one offer, so not every request looks equally busy
  {
    id: "66666666-0000-4000-8000-000000000008",
    requestId: "33333333-0000-4000-8000-000000000004",
    providerId: "55555555-0000-4000-8000-000000000001",
    priceTotal: 42000,
    durationMonths: 12,
    notes: "عقد صيانة سنوي لعمارة 12 وحدة يشمل المصاعد والسباكة والكهرباء، بزيارة شهرية.",
    lineItems: [
      { service: "صيانة المصاعد", price_per_unit: 1600 },
      { service: "السباكة والكهرباء", price_per_unit: 1900 },
    ],
    status: "pending",
  },
];

// No `deals` row is seeded. A deal is created by the server when an owner accepts
// an offer, so the demo produces its own during the walkthrough -- see the note on
// the برج قرطبة offers above. Seeding one here would also put a fabricated contract
// value in the table that powers GMV, which is the last number that should be
// invented anywhere near an investor conversation.

/** Why a provider passed -- the "why didn't you bid?" data, shown as a real signal. */
const DECLINES = [
  { requestId: "33333333-0000-4000-8000-000000000004", providerId: "55555555-0000-4000-8000-000000000003", reason: "too_small" },
  { requestId: "33333333-0000-4000-8000-000000000004", providerId: "55555555-0000-4000-8000-000000000006", reason: "scope_unclear" },
];

// ── Seed ───────────────────────────────────────────────────────────────────────

/** Delete order matters: children before parents. */
const WIPE_ORDER = [
  "deals",
  "offer_declines",
  "provider_offers",
  "requests",
  "properties",
  "providers",
  "sessions",
  "email_log",
  "email_outbox",
  "users",
];

async function wipe() {
  for (const table of WIPE_ORDER) {
    const { error } = await db.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    // sessions is keyed on `token`, not `id` -- fall back to a always-true filter.
    if (error && /column .*id.* does not exist/i.test(error.message)) {
      const { error: e2 } = await db.from(table).delete().not("token", "is", null);
      if (e2) throw new Error(`wipe ${table}: ${e2.message}`);
    } else if (error) {
      throw new Error(`wipe ${table}: ${error.message}`);
    }
    console.log(`  cleared ${table}`);
  }
}

async function insertAll() {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

  // Users -- owners then provider contacts
  const users = [
    ...OWNERS.map((o, i) => ({
      id: o.id,
      phone: o.phone,
      name: o.name,
      email: o.email,
      role: "owner",
      created_at: daysAgo(40 - i * 5),
      last_login_at: daysAgo(3 + i),
    })),
    ...PROVIDERS.map((p, i) => ({
      id: p.userId,
      phone: p.phone,
      name: p.contactName,
      email: p.email,
      role: "provider",
      created_at: daysAgo(50 - i * 4),
      last_login_at: daysAgo(2 + i),
    })),
  ];
  let { error } = await db.from("users").insert(users);
  if (error) throw new Error(`users: ${error.message}`);
  console.log(`  ${users.length} users`);

  // Properties -- one per owner (the product's current limit, PRODUCT-FACTS §2)
  const properties = OWNERS.filter((o) => o.property.id).map((o) => ({
    id: o.property.id,
    name: o.property.name,
    building_type: o.property.type,
    address: o.property.district,
    city: "الرياض",
    units_count: o.property.units,
    owner_id: o.id,
    created_at: daysAgo(30),
  }));
  ({ error } = await db.from("properties").insert(properties));
  if (error) throw new Error(`properties: ${error.message}`);
  console.log(`  ${properties.length} properties`);

  // Requests -- one comprehensive O&M request each, no per-service picker
  const requests = OWNERS.filter((o) => o.request).map((o) => ({
    id: o.request!.id,
    owner_id: o.id,
    property_id: o.property.id,
    service_category: "standard",
    description: o.request!.description,
    contract_start_date: o.request!.startDate,
    status: o.request!.status,
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
  }));
  ({ error } = await db.from("requests").insert(requests));
  if (error) throw new Error(`requests: ${error.message}`);
  console.log(`  ${requests.length} requests`);

  // E-signature (2026-09-15): plausible but clearly fictitious signatory fields, so the
  // contract-generation route (POST /api/deals/:id/contract) has real values to render instead
  // of blank placeholders — cycled by index rather than adding a field to SeedProvider and its
  // seven literal entries for what's cosmetic per-provider variation, not real seed data.
  const DEMO_SIGNATORY_NAMES = [
    "محمد العتيبي", "سارة القحطاني", "فيصل الدوسري", "نورة الشهري",
    "عبدالعزيز الحربي", "ريم المطيري", "خالد الزهراني",
  ];

  // Providers -- document URLs point nowhere real; the demo never opens them
  const providers = PROVIDERS.map((p, i) => ({
    id: p.providerId,
    user_id: p.userId,
    company_name: p.company,
    email: p.email,
    city: "الرياض",
    description: p.description,
    commercial_register_url: `demo/${p.providerId}/commercial-register.pdf`,
    company_profile_url: `demo/${p.providerId}/company-profile.pdf`,
    fal_license_url: `demo/${p.providerId}/fal-license.pdf`,
    approved: p.approved,
    created_at: daysAgo(45),
    updated_at: daysAgo(45),
    cr_number: `10101${String(20000 + i).padStart(5, "0")}`,
    fal_license_number: `FAL-2026-${String(100 + i).padStart(5, "0")}`,
    signatory_name: DEMO_SIGNATORY_NAMES[i % DEMO_SIGNATORY_NAMES.length],
  }));
  ({ error } = await db.from("providers").insert(providers));
  if (error) throw new Error(`providers: ${error.message}`);
  console.log(`  ${providers.length} providers`);

  const offers = OFFERS.map((o, i) => ({
    id: o.id,
    request_id: o.requestId,
    provider_id: o.providerId,
    offer_file_url: null,
    notes: o.notes,
    price_total: o.priceTotal,
    line_items: o.lineItems,
    duration_months: o.durationMonths,
    status: o.status,
    created_at: daysAgo(15 - i),
  }));
  ({ error } = await db.from("provider_offers").insert(offers));
  if (error) throw new Error(`provider_offers: ${error.message}`);
  console.log(`  ${offers.length} offers`);

  ({ error } = await db.from("offer_declines").insert(
    DECLINES.map((d) => ({
      request_id: d.requestId,
      provider_id: d.providerId,
      reason: d.reason,
      created_at: daysAgo(10),
    })),
  ));
  if (error) throw new Error(`offer_declines: ${error.message}`);
  console.log(`  ${DECLINES.length} declines`);

  console.log("  0 deals (created live when an offer is accepted during the demo)");
}

async function main() {
  console.log(`\nSeeding DEMO project ${DEMO_PROJECT_REF}\n`);
  await wipe();
  await insertAll();
  console.log("\nDone. Demo login numbers:");
  for (const o of OWNERS) console.log(`  owner    ${o.phone}  ${o.name}`);
  for (const p of PROVIDERS) console.log(`  provider ${p.phone}  ${p.company}`);
  console.log("\nAll of these must be listed in OTP_TEST_NUMBERS on the demo deployment.\n");
}

main().catch((err) => {
  console.error(`\n  SEED FAILED: ${err.message}\n`);
  process.exit(1);
});
