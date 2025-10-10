import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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

// Sequence of icons to simulate rotation
const ICON_FRAMES = [
  faGlobeAfrica,
  faGlobeAsia,
  faGlobeOceania,
  faGlobeAmericas,
  faGlobeEurope,
];

// Final icon for each language
const LANGUAGE_ICONS = {
  en: faGlobeAmericas,
  it: faGlobeEurope,
  fr: faGlobeEurope,
  de: faGlobeEurope,
  es: faGlobeAmericas,
  default: faGlobeEurope,
};

export default function GoogleTranslator() {
  const location = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [icon, setIcon] = useState(LANGUAGE_ICONS["en"]);
  const translateElementRef = useRef(null);
  const scriptLoaded = useRef(false);

  // Load Google Translate script
  useEffect(() => {
    if (!scriptLoaded.current) {
      const addScript = () => {
        const script = document.createElement("script");
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
        scriptLoaded.current = true;
      };

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

      addScript();
    }
  }, []);

  // Language change function + globe animation
  const changeLanguage = (languageCode) => {
    if (languageCode === currentLanguage) return;

    setCurrentLanguage(languageCode);

    // Animation: cycle through icons
    let frame = 0;
    const interval = setInterval(() => {
      setIcon(ICON_FRAMES[frame % ICON_FRAMES.length]);
      frame++;
      if (frame > ICON_FRAMES.length) {
        clearInterval(interval);
        // At the end show the final icon of the language
        setIcon(LANGUAGE_ICONS[languageCode] || LANGUAGE_ICONS.default);
      }
    }, 100); // frame speed (100ms → 0.6s total)

    // Change Google Translate language
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
  }, [location.pathname, currentLanguage]);

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
