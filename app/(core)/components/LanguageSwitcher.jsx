"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../hooks/useTranslation.ts";
import "../styles/translator.css";

const LANGUAGES = {
  en: "English",
  ru: "Русский",
  rw: "Kinyarwanda",
};

const getStoredLang = () => {
  if (typeof document === "undefined") return "en";
  const value = `; ${document.cookie}`;
  const parts = value.split("; googtrans=");
  if (parts.length === 2) {
    const cookie = parts.pop()?.split(";").shift();
    if (cookie) {
      const segments = cookie.split("/");
      if (segments.length >= 3 && LANGUAGES[segments[2]]) {
        return segments[2];
      }
    }
  }
  return "en";
};

const setLangCookie = (languageCode) => {
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const domainAttr = isLocal ? "" : `; domain=.${hostname}`;
  document.cookie = `googtrans=/en/${languageCode}; path=/${domainAttr}; SameSite=Lax`;
};

export default function LanguageSwitcher() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentLanguage(getStoredLang());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const changeLanguage = useCallback((languageCode) => {
    setCurrentLanguage(languageCode);
    setLangCookie(languageCode);
    setOpen(false);

    window.dispatchEvent(
      new CustomEvent("gtrans:languagechange", {
        detail: { lang: languageCode },
      })
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`lang-switcher ${isCompleted ? "notranslate" : ""}`.trim()}
    >
      <button
        type="button"
        className="lang-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        onClick={() => setOpen((value) => !value)}
      >
        <FontAwesomeIcon icon={faLanguage} className="lang-switcher__icon" />
        <span className="lang-switcher__code notranslate">
          {currentLanguage.toUpperCase()}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`lang-switcher__chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open ? (
        <ul className="lang-switcher__menu" role="listbox">
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <li key={code} role="none">
              <button
                type="button"
                role="option"
                aria-selected={currentLanguage === code}
                className={`lang-switcher__option ${currentLanguage === code ? "is-active" : ""}`}
                onClick={() => changeLanguage(code)}
              >
                <span className="notranslate">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
