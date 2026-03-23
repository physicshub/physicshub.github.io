"use client";
import { useState, useEffect, useCallback } from "react";

// Default language if no preference is set
const DEFAULT_LANG = "en";

// Define the shape of your translations JSON
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
      return parts[2]; // e.g., /en/it -> it
    }
  }
  return DEFAULT_LANG;
};

export const useTranslation = (lang?: string): UseTranslationResult => {
  const [translations, setTranslations] = useState<Translations>({});
  const [metaConfig, setMetaConfig] = useState<MetaConfig | null>(null);
  const [language, setLanguage] = useState(lang || DEFAULT_LANG);
  const [ready, setReady] = useState(false);

  // Sync language via custom event instead of polling, so the switch is
  // always synchronous with what GoogleTranslator dispatches.
  useEffect(() => {
    if (lang) {
      setLanguage(lang);
      return;
    }

    // Initial sync on mount
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
        // Load meta.json
        const metaModule = await import("../locales/meta.json");
        const meta = metaModule.default as MetaConfig;
        setMetaConfig(meta);

        const currentMeta = meta[language];
        // so that Google Translate can translate it normally.
        const langToLoad = currentMeta?.completed ? language : DEFAULT_LANG;

        const transModule = await import(`../locales/${langToLoad}.json`);
        // Spread into a new object so React always sees a new reference,
        // even when two different languages resolve to the same cached module
        // (e.g. en → es both load en.json).
        setTranslations({ ...transModule.default });
        setReady(true);
      } catch (error) {
        console.error(`Error loading translations for ${language}`, error);

        // Fallback to English
        try {
          const fallbackModule = await import(
            `../locales/${DEFAULT_LANG}.json`
          );
          setTranslations({ ...fallbackModule.default });
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

  // After React commits fresh English strings to the DOM for fallback languages,
  // re-trigger Google Translate so t()-wrapped text gets translated too.
  useEffect(() => {
    if (!ready || !metaConfig) return;

    const currentMeta = metaConfig[language];
    if (currentMeta?.completed) return; // hand-translated, Google Translate not needed

    // Wait one frame to ensure React has committed the new DOM nodes
    // before asking Google Translate to do its pass.
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
