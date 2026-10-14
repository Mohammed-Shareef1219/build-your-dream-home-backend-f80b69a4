import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Translation resources.
 * Every file under src/i18n/locales/{en,ar}/<namespace>.json is registered
 * automatically as the namespace named after the file.
 */
const modules = import.meta.glob("./locales/*/*.json", { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;

const resources: Record<string, Record<string, Record<string, unknown>>> = {};
const namespaces = new Set<string>();

for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, lng, ns] = match;
  resources[lng] = resources[lng] ?? {};
  resources[lng][ns] = mod.default;
  namespaces.add(ns);
}

export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: supportedLanguages as unknown as string[],
    ns: Array.from(namespaces),
    defaultNS: "common",
    fallbackNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export const LANGUAGE_STORAGE_KEY = "lang";

export default i18n;
