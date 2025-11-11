"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation"; // ✅ sostituisce useLocation
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
  it: "Italian",
  fr: "French",
  de: "German",
  es: "Spanish",
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
  default: faGlobeEurope,
};

export default function GoogleTranslator() {
  const pathname = usePathname(); // ✅
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [icon, setIcon] = useState(LANGUAGE_ICONS["en"]);
  const translateElementRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (
      !scriptLoaded.current &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      scriptLoaded.current = true;

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,it,fr,de,es",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };
    }
  }, []);

  const changeLanguage = (languageCode) => {
    if (languageCode === currentLanguage) return;
    setCurrentLanguage(languageCode);

    let frame = 0;
    const interval = setInterval(() => {
      setIcon(ICON_FRAMES[frame % ICON_FRAMES.length]);
      frame++;
      if (frame > ICON_FRAMES.length) {
        clearInterval(interval);
        setIcon(LANGUAGE_ICONS[languageCode] || LANGUAGE_ICONS.default);
      }
    }, 100);

    const selectElement = document.querySelector(".goog-te-combo");
    if (selectElement) {
      selectElement.value = languageCode;
      selectElement.dispatchEvent(new Event("change"));
    }
    document.cookie = `googtrans=/en/${languageCode}; path=/; domain=${window.location.hostname}`;
  };

  // Reset translation when route changes
  useEffect(() => {
    if (currentLanguage !== "en") {
      setTimeout(() => {
        changeLanguage(currentLanguage);
      }, 300);
    }
  }, [pathname, currentLanguage]); // ✅ usa pathname invece di location.pathname

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
            <option key={code} value={code}>
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
