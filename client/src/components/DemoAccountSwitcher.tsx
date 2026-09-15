import { useLang } from "@/hooks/use-lang";
import { IS_DEMO } from "@/components/DemoBanner";

/**
 * One-click account picker for the investor demo. Shown only when
 * VITE_DEMO_MODE=true.
 *
 * This adds NO authentication path. The demo accounts are ordinary seeded users
 * whose phone numbers are listed in OTP_TEST_NUMBERS, and the existing OTP test
 * bypass (server/routes.ts:52-59, :2036-2045) is what lets them in with a fixed
 * code and no SMS. All this component does is fill the form, so a walkthrough
 * doesn't stall on typing a phone number in front of an investor.
 *
 * Accounts must stay in sync with script/seed-demo.ts.
 */

type DemoAccount = { phone: string; label: string; labelEn: string };

const OWNERS: DemoAccount[] = [
  { phone: "0500000001", label: "نورة — عمارة الياسمين (3 عروض)", labelEn: "Noura — Al Yasmin building (3 offers)" },
  { phone: "0500000002", label: "سعد — برج قرطبة (عرضان، جاهز للقبول)", labelEn: "Saad — Qurtuba tower (2 offers, ready to accept)" },
  { phone: "0500000004", label: "فيصل — عمارة الملقا (عرض واحد)", labelEn: "Faisal — Al Malqa building (one offer)" },
];

const PROVIDERS: DemoAccount[] = [
  { phone: "0500000011", label: "أفق الشمال لإدارة المرافق", labelEn: "Ofuq Al Shamal FM" },
  { phone: "0500000013", label: "واحة المرافق المتكاملة (قدّم عرضًا على برج قرطبة)", labelEn: "Wahat Al Marafiq (bid on Qurtuba tower)" },
  { phone: "0500000017", label: "نماء المرافق — تحت المراجعة", labelEn: "Namaa FM — pending review" },
];

export default function DemoAccountSwitcher({
  role,
  onPick,
}: {
  role: string;
  onPick: (phone: string) => void;
}) {
  const { lang } = useLang();
  if (!IS_DEMO) return null;

  const accounts = role === "provider" ? PROVIDERS : OWNERS;
  const code = import.meta.env?.VITE_DEMO_OTP_HINT ?? "";

  return (
    <div
      className="rounded-lg p-3 mb-4"
      style={{
        background: "var(--warn-soft)",
        border: "1px solid rgba(251,191,36,0.28)",
      }}
    >
      <p className="text-xs mb-2" style={{ color: "var(--warn)" }}>
        {lang === "ar" ? "حسابات تجريبية — اختر واحدًا" : "Demo accounts — pick one"}
        {code ? (lang === "ar" ? ` · الرمز ${code}` : ` · code ${code}`) : ""}
      </p>
      <div className="flex flex-col gap-1.5">
        {accounts.map((a) => (
          <button
            key={a.phone}
            type="button"
            onClick={() => onPick(a.phone)}
            className="text-start text-xs rounded-md px-2.5 py-2 transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "var(--foreground, #EAF6FB)",
            }}
          >
            {lang === "ar" ? a.label : a.labelEn}
            <span className="opacity-60"> · {a.phone}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
