import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useLang } from "@/hooks/use-lang";

/**
 * Contract start date picker.
 *
 * Stores an ISO `YYYY-MM-DD` string, matching the DATE column, and never a
 * timezone-bearing timestamp: "the contract starts on the 1st" must not become
 * the 31st for a viewer in another timezone, which is exactly what
 * `toISOString()` on a local midnight would do. Hence the manual formatting.
 *
 * Display uses `ar-SA-u-nu-latn` so months read in Arabic while digits stay
 * Western, which is the codebase standard and the brand rule.
 */

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromISODate(s: string | null | undefined): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Formats a stored YYYY-MM-DD for display. Arabic month names, Western digits. */
export function formatContractDate(iso: string | null | undefined, lang: string): string | null {
  const d = fromISODate(iso);
  if (!d) return null;
  return d.toLocaleDateString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ContractStartDatePicker({
  value,
  onChange,
  id = "contract-start-date",
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  id?: string;
}) {
  const { lang } = useLang();
  const isRTL = lang === "ar";
  const [open, setOpen] = useState(false);

  const selected = fromISODate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const t = isRTL
    ? {
        label: "تاريخ بداية العقد",
        optional: "اختياري",
        placeholder: "اختر التاريخ",
        hint: "يساعد الشركات على تسعير عرضها بدقة. تقدر تتركه وتحدده لاحقاً.",
        clear: "مسح",
      }
    : {
        label: "Contract start date",
        optional: "optional",
        placeholder: "Pick a date",
        hint: "Helps companies price their offer accurately. You can leave it and set it later.",
        clear: "Clear",
      };

  const formatted = selected
    ? selected.toLocaleDateString(isRTL ? "ar-SA-u-nu-latn" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div>
      <Label htmlFor={id}>
        {t.label}{" "}
        <span className="text-xs font-normal text-muted-foreground">({t.optional})</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="mt-2 w-full justify-start gap-2 rounded-xl font-normal"
          >
            <CalendarDays className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className={formatted ? "" : "text-muted-foreground"}>
              {formatted ?? t.placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" dir={isRTL ? "rtl" : "ltr"}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              onChange(d ? toISODate(d) : null);
              setOpen(false);
            }}
            disabled={{ before: today }}
            defaultMonth={selected ?? today}
            dir={isRTL ? "rtl" : "ltr"}
            initialFocus
          />
          {value && (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                {t.clear}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <p className="mt-1 text-xs text-muted-foreground">{t.hint}</p>
    </div>
  );
}
