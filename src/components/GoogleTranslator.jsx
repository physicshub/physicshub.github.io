import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../styles/translator.css";

// Global state to track script loading and initialization
let isScriptLoaded = false;
let isTranslatorInitialized = false;
let hiddenContainerId = "hidden-google-translate-container";

const GoogleTranslator = () => {
  const location = useLocation();
  const translateElementRef = useRef(null);
  
  // Create a hidden container that persists across route changes
  useEffect(() => {
    // Create hidden container if it doesn't exist
    if (!document.getElementById(hiddenContainerId)) {
      const hiddenContainer = document.createElement("div");
      hiddenContainer.id = hiddenContainerId;
      hiddenContainer.style.position = "absolute";
      hiddenContainer.style.top = "-9999px";
      hiddenContainer.style.left = "-9999px";
      hiddenContainer.style.visibility = "hidden";
      
      const hiddenTranslateElement = document.createElement("div");
      hiddenTranslateElement.id = "google_translate_element_hidden";
      hiddenContainer.appendChild(hiddenTranslateElement);
      
      document.body.appendChild(hiddenContainer);
    }
    
    // Initialize Google Translate only once
    if (!isScriptLoaded) {
      // Define global initialization function
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "it,fr,de,es",
              layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
              autoDisplay: false,
            },
            "google_translate_element_hidden"
          );
          isTranslatorInitialized = true;
          
          // After initialization, clone elements to the visible component
          setTimeout(cloneTranslatorToVisibleComponent, 500);
        }
      };
      
      // Load the Google Translate script
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      
      // Add event listener to track when script is loaded
      script.addEventListener("load", () => {
        isScriptLoaded = true;
      });
      
      document.body.appendChild(script);
    } else if (isTranslatorInitialized) {
      // If script is already loaded and translator initialized, just clone elements
      setTimeout(cloneTranslatorToVisibleComponent, 300);
    }
  }, []);
  
  // Function to clone translator elements from hidden container to visible component
  const cloneTranslatorToVisibleComponent = () => {
    if (!translateElementRef.current) return;
    
    const hiddenTranslateElement = document.getElementById("google_translate_element_hidden");
    if (!hiddenTranslateElement) return;
    
    // Clear the visible container first
    while (translateElementRef.current.firstChild) {
      translateElementRef.current.removeChild(translateElementRef.current.firstChild);
    }
    
    // Clone only the select element from hidden container to visible component
     const selectElement = hiddenTranslateElement.querySelector("select.goog-te-combo");
     if (selectElement) {
       const clone = selectElement.cloneNode(true);
       translateElementRef.current.appendChild(clone);
       
       // Sync the event listeners
       clone.addEventListener("change", (e) => {
         selectElement.value = e.target.value;
         
         // Create and dispatch a change event on the original select
         const changeEvent = new Event("change", { bubbles: true });
         selectElement.dispatchEvent(changeEvent);
       });
     }
    
    // Add the arrow if no elements were found (fallback)
    if (translateElementRef.current.children.length === 0) {
      const arrow = document.createElement("span");
      arrow.className = "translator-arrow";
      arrow.textContent = "▼";
      translateElementRef.current.appendChild(arrow);
    }
  };
  
  // Re-clone elements when route changes
  useEffect(() => {
    if (isTranslatorInitialized) {
      setTimeout(cloneTranslatorToVisibleComponent, 300);
    }
  }, [location.pathname]);
  
  return (
    <div className="select-container translator-container">
      <div className="select-wrapper">
        <div ref={translateElementRef} id="google_translate_element">
          <span className="translator-arrow">▼</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleTranslator;