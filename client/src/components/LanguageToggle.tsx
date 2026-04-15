import { useLang } from "@/hooks/use-lang";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="text-sm px-3 py-1 rounded border hover:bg-accent transition-colors"
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}
