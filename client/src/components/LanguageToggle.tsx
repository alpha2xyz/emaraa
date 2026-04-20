import { useLang } from "@/hooks/use-lang";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className={`text-sm px-3 py-1 rounded border hover:bg-accent transition-colors ${className}`}
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}
