"use client";
import { useState, useEffect, useCallback } from "react";

// Default language if no preference is set
const DEFAULT_LANG = "en";

// Define the shape
type Translations = Record<string, string>;

interface LanguageMeta {
  name: string;
  completed: boolean;
}

type MetaConfig = Record<string, LanguageMeta>;

interface UseTranslationResult {
  t: (key: string) => string;
  ready: boolean;
  language: string;
  meta: LanguageMeta | null;
}

const LOCALE_LOADERS: Record<string, () => Promise<{ default: Translations }>> =
  {
    en: () => import("../locales/en.json"),
    ru: () => import("../locales/ru.json"),
    it: () => import("../locales/it.json"),
    es: () => import("../locales/es.json"),
    fr: () => import("../locales/fr.json"),
    de: () => import("../locales/de.json"),
    ar: () => import("../locales/ar.json"),
  };

const loadLocale = async (lang: string): Promise<Translations> => {
  const loader = LOCALE_LOADERS[lang] ?? LOCALE_LOADERS.en;
  const localeModule = await loader();
  return localeModule.default;
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

const getGoogleTransLang = () => {
  const cookie = getCookie("googtrans");
  if (cookie) {
    const parts = cookie.split("/");
    if (parts.length >= 3) {
      const code = parts[2];
      if (code && code !== "en") return code;
    }
  }
  return DEFAULT_LANG;
};

export const useTranslation = (lang?: string): UseTranslationResult => {
  const [translations, setTranslations] = useState<Translations>({});
  const [metaConfig, setMetaConfig] = useState<MetaConfig | null>(null);
  const [language, setLanguage] = useState(lang || DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  // Sync language via custom event from LanguageSwitcher.
  useEffect(() => {
    if (lang) {
      setLanguage(lang);
      return;
    }

    setLanguage(getGoogleTransLang());

    const handler = (e: Event) => {
      setLanguage((e as CustomEvent<{ lang: string }>).detail.lang);
    };

    window.addEventListener("gtrans:languagechange", handler);
    return () => window.removeEventListener("gtrans:languagechange", handler);
  }, [lang]);

  useEffect(() => {
    const loadData = async () => {
      setReady(false);
      try {
        const metaModule = await import("../locales/meta.json");
        const meta = metaModule.default as MetaConfig;
        setMetaConfig(meta);

        const currentMeta = meta[language];
        const langToLoad = currentMeta?.completed ? language : DEFAULT_LANG;

        const loadedTranslations = await loadLocale(langToLoad);
        setTranslations({ ...loadedTranslations });
        setReady(true);
      } catch (error) {
        console.error(`Error loading translations for ${language}`, error);

        try {
          const loadedTranslations = await loadLocale(DEFAULT_LANG);
          setTranslations({ ...loadedTranslations });
          setReady(true);
        } catch (e) {
          console.error(
            "Critical error: Could not even load fallback translations",
            e
          );
        }
      }
    };

    loadData();
  }, [language]);

  useEffect(() => {
    if (!ready || !metaConfig) return;

    const currentMeta = metaConfig[language];
    if (currentMeta?.completed) return;

    const id = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("gtrans:retranslate", { detail: { lang: language } })
      );
    }, 50);

    return () => clearTimeout(id);
  }, [ready, language, metaConfig]);

  const t = useCallback(
    (key: string): string => {
      return translations[key] || key;
    },
    [translations]
  );

  return {
    t,
    ready,
    language,
    meta: metaConfig ? metaConfig[language] : null,
  };
};

export default useTranslation;
