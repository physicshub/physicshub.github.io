//This component is currently disabled due to issues with Google Translate integration.
//Problems: 
//1. The Google Translate script make the website lag a lot and it spam in the console errors.
//2. The component is rendered only the first time, then if you change page it disappears.
//3. In the homepage is rendered in the root, under the page.


/* import React, { useEffect } from "react";
import "../styles/translator.css";

const GoogleTranslator = () => {
  useEffect(() => {
    // Funzione globale di init
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "it,fr,de,es",
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Carica script solo se non esiste già
    if (!document.querySelector("#google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      document.body.appendChild(addScript);
    } else {
      // Se già caricato, reinizializza
      if (window.google && window.google.translate) {
        window.googleTranslateElementInit();
      }
    }
  }, []); // solo al primo mount

  return (
    <div className="select-container translator-container">
      <div className="select-wrapper">
        <div id="google_translate_element">
          <span className="translator-arrow">▼</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleTranslator; */

export default null;