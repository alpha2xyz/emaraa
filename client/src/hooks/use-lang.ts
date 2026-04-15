import { useState } from "react";

type Lang = "ar" | "en";

let globalLang: Lang = "ar";
const listeners: Array<(l: Lang) => void> = [];

export function useLang() {
  const [lang, setLangState] = useState<Lang>(globalLang);

  const setLang = (l: Lang) => {
    globalLang = l;
    listeners.forEach((fn) => fn(l));
  };

  useState(() => {
    const fn = (l: Lang) => setLangState(l);
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); };
  });

  return { lang, setLang };
}
