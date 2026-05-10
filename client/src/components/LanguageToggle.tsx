import { useLang } from "@/hooks/use-lang";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className={`text-sm px-4 py-1.5 rounded-full font-medium border-[1.5px] border-current/25 hover:border-current/50 hover:bg-current/5 transition-all ${className}`}
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}
