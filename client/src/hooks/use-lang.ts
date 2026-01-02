import { useState, useEffect } from "react";

type Language = "ar" | "en";

// تخزين اللغة عالمياً
let globalLang: Language = "ar";
const listeners: Array<(lang: Language) => void> = [];

function setGlobalLang(lang: Language) {
  globalLang = lang;
  localStorage.setItem("language", lang);
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  listeners.forEach((listener) => listener(lang));
}

function getInitialLang(): Language {
  const saved = localStorage.getItem("language");
  return saved === "ar" || saved === "en" ? saved : "ar";
}

// Initialize on first load
if (typeof window !== "undefined") {
  globalLang = getInitialLang();
  document.documentElement.dir = globalLang === "ar" ? "rtl" : "ltr";
}

export function useLang() {
  const [lang, setLang] = useState<Language>(getInitialLang());

  useEffect(() => {
    globalLang = getInitialLang();
    const listener = (newLang: Language) => setLang(newLang);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const changeLang = (newLang: Language) => {
    setGlobalLang(newLang);
  };

  const toggleLang = () => {
    setGlobalLang(globalLang === "ar" ? "en" : "ar");
  };

  return {
    lang,
    setLang: changeLang,
    toggleLang,
  };
}
