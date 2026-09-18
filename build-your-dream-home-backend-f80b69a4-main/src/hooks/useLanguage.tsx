import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n, { LANGUAGE_STORAGE_KEY, type SupportedLanguage } from "@/i18n/config";

type Lang = SupportedLanguage;
type Ctx = { lang: Lang; toggle: () => void; setLang: (l: Lang) => void; dir: "ltr" | "rtl" };
const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  // Keep the provider subscribed to i18next updates.
  useTranslation();

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "ar") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir: lang === "ar" ? "rtl" : "ltr",
        toggle: () => setLangState((p) => (p === "en" ? "ar" : "en")),
        setLang: setLangState,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
