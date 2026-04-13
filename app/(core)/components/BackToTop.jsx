"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../hooks/useTranslation.ts";

export default function BackToTopButton({ onlyMobile = true }) {
  const [isVisible, setIsVisible] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && (!onlyMobile || window.innerWidth <= 600)) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onlyMobile]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top ${isVisible ? "visible" : ""} ${
        isCompleted ? "notranslate" : ""
      }`}
      aria-label={t("Back to top")}
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>
  );
}
