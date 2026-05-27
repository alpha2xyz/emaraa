import { useState, useEffect } from "react";

export type Lang = "ar" | "en";

const stored = (
  typeof localStorage !== "undefined" ? localStorage.getItem("lang") : null
) as Lang | null;
let globalLang: Lang = stored ?? "ar";
const listeners: Array<(l: Lang) => void> = [];

export function useLang() {
  const [lang, setLangState] = useState<Lang>(globalLang);

  useEffect(() => {
    const fn = (l: Lang) => setLangState(l);
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }, []);

  const setLang = (l: Lang) => {
    globalLang = l;
    localStorage.setItem("lang", l);
    listeners.forEach((fn) => fn(l));
  };

  const toggleLang = () => setLang(globalLang === "ar" ? "en" : "ar");

  return { lang, setLang, toggleLang };
}
