import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/translator.css";

// Available languages
const LANGUAGES = {
  "en": "English",
  "it": "Italian",
  "fr": "French",
  "de": "German",
  "es": "Spanish"
};

const GoogleTranslator = () => {
  const location = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const translateElementRef = useRef(null);
  const scriptLoaded = useRef(false);
  
  // Load Google Translate script
  useEffect(() => {
    if (!scriptLoaded.current) {
      // Add Google Translate script to the page
      const addScript = () => {
        const script = document.createElement("script");
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
        scriptLoaded.current = true;
      };
      
      // Initialize the translator
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: "en",
          includedLanguages: "en,it,fr,de,es",
          autoDisplay: false
        }, "google_translate_element");
      };
      
      addScript();
    }
  }, []);
  
  // Function to change the language
  const changeLanguage = (languageCode) => {
    if (languageCode === currentLanguage) return;
    
    // Update state
    setCurrentLanguage(languageCode);
    
    // Direct DOM manipulation to change language
    const selectElement = document.querySelector(".goog-te-combo");
    if (selectElement) {
      selectElement.value = languageCode;
      
      // Trigger change event
      selectElement.dispatchEvent(new Event("change"));
    }
    
    // Alternative approach using cookies
    document.cookie = `googtrans=/en/${languageCode}; path=/; domain=${window.location.hostname}`;
    
    // Force refresh translation
    if (window.google && window.google.translate) {
      if (typeof window.google.translate.TranslateElement === 'function') {
        // Try to use the API directly
        try {
          const translateInstance = window.google.translate.TranslateElement.getInstance();
          if (translateInstance) {
            translateInstance.showBanner(languageCode);
          }
        } catch (e) {
          console.error("Error using translate API:", e);
        }
      }
    }
  };
  
  // Reset translation when route changes
  useEffect(() => {
    // If we're not on English, reapply the current language
    if (currentLanguage !== "en") {
      setTimeout(() => {
        changeLanguage(currentLanguage);
      }, 300);
    }
  }, [location.pathname, currentLanguage]);
  
  return (
    <div className="select-container translator-container">
      <div className="select-wrapper">
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
        <div ref={translateElementRef} id="google_translate_element" style={{ display: "none" }}></div>
      </div>
    </div>
  );
};

export default GoogleTranslator;