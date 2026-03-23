"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import "../styles/translator.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobeAfrica,
  faGlobeAsia,
  faGlobeEurope,
  faGlobeOceania,
  faGlobeAmericas,
} from "@fortawesome/free-solid-svg-icons";

const LANGUAGES = {
  en: "English",
  it: "Italiano",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  ar: "العربية",
};

const ICON_FRAMES = [
  faGlobeAfrica,
  faGlobeAsia,
  faGlobeOceania,
  faGlobeAmericas,
  faGlobeEurope,
];

const LANGUAGE_ICONS = {
  en: faGlobeAmericas,
  it: faGlobeEurope,
  fr: faGlobeEurope,
  de: faGlobeEurope,
  es: faGlobeAmericas,
  ar: faGlobeAsia,
  default: faGlobeEurope,
};

// Helper to extract language from googtrans cookie
const getGoogleTransLang = () => {
  const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };
  const cookie = getCookie("googtrans");
  if (cookie) {
    const parts = cookie.split("/");
    if (parts.length >= 3) {
      return parts[2]; // e.g., /en/it -> it
    }
  }
  return "en";
};

export default function GoogleTranslator() {
  const pathname = usePathname();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [icon, setIcon] = useState(LANGUAGE_ICONS["en"]);
  const translateElementRef = useRef(null);
  const scriptLoaded = useRef(false);

  // State and ref for widget readiness and initial sync
  const [widgetReady, setWidgetReady] = useState(false);
  const initializedRef = useRef(false);

  // Load Google Translate script once
  useEffect(() => {
    if (!scriptLoaded.current) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,it,fr,de,es,ar",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      scriptLoaded.current = true;
    }
  }, []);

  // Detect when the Google Translate widget is ready (select element exists)
  useEffect(() => {
    let intervalId;
    const checkWidget = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        setWidgetReady(true);
        clearInterval(intervalId);
      }
    };
    intervalId = setInterval(checkWidget, 200);
    return () => clearInterval(intervalId);
  }, []);

  // Listen for retranslate requests from useTranslation
  useEffect(() => {
    const handler = (e) => {
      const select = document.querySelector(".goog-te-combo");
      if (!select) return;
      select.value = e.detail.lang;
      select.dispatchEvent(new Event("change"));
    };

    window.addEventListener("gtrans:retranslate", handler);
    return () => window.removeEventListener("gtrans:retranslate", handler);
  }, []);

  const changeLanguage = useCallback(
    (languageCode) => {
      if (languageCode === currentLanguage) return;
      setCurrentLanguage(languageCode);

      // Animate icon
      let frame = 0;
      const interval = setInterval(() => {
        setIcon(ICON_FRAMES[frame % ICON_FRAMES.length]);
        frame++;
        if (frame > ICON_FRAMES.length) {
          clearInterval(interval);
          setIcon(LANGUAGE_ICONS[languageCode] || LANGUAGE_ICONS.default);
        }
      }, 100);

      // Trigger Google Translate
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement) {
        selectElement.value = languageCode;
        selectElement.dispatchEvent(new Event("change"));
      }

      // Update cookie
      const hostname = window.location.hostname;
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
      const domainAttr = isLocal ? "" : `; domain=${hostname}`;
      document.cookie = `googtrans=/en/${languageCode}; path=/ ${domainAttr}`;

      // Notify useTranslation
      window.dispatchEvent(
        new CustomEvent("gtrans:languagechange", {
          detail: { lang: languageCode },
        })
      );
    },
    [currentLanguage]
  );

  // Sync the selector with the stored language on first widget ready
  useEffect(() => {
    if (widgetReady && !initializedRef.current) {
      initializedRef.current = true;
      const initialLang = getGoogleTransLang();
      if (initialLang !== "en") {
        changeLanguage(initialLang);
      } else {
        // For English we just set the state directly (no need to trigger widget)
        setCurrentLanguage(initialLang);
        setIcon(LANGUAGE_ICONS[initialLang] || LANGUAGE_ICONS.default);
      }
    }
  }, [widgetReady, changeLanguage]);

  // Reset translation on route change (keep the same language)
  useEffect(() => {
    if (currentLanguage !== "en") {
      const timeout = setTimeout(() => {
        changeLanguage(currentLanguage);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [pathname, currentLanguage, changeLanguage]);

  return (
    <div className="select-container translator-container">
      <div className="select-wrapper">
        <FontAwesomeIcon icon={icon} className="globe-icon rotating" />
        <select
          className="language-select"
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option
              key={code}
              value={code}
              translate="no"
              className="notranslate"
            >
              {name}
            </option>
          ))}
        </select>
        <div
          ref={translateElementRef}
          id="google_translate_element"
          style={{ display: "none" }}
        ></div>
      </div>
    </div>
  );
}
