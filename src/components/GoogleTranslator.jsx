import React, { useEffect } from "react";
import "../styles/translator.css";


const GoogleTranslator = () => {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "it,fr,de,es",
          layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
          autoDisplay: false,
        },
        "google_translate_element" 
      );
    };

    const addScript = document.createElement("script");
    addScript.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    addScript.async = true;
    document.body.appendChild(addScript);
  }, []);

  return <div id="google_translate_element"></div>;
};

export default GoogleTranslator;
