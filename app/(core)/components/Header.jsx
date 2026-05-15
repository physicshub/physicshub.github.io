// app/components/Header.jsx
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import useTranslation from "../hooks/useTranslation.ts";
import { Logo } from "./Logo";
import NavMenu from "./Nav";
import { Theme } from "./Theme";
import GitHubHeaderBadge from "./GitHubHeaderBadge.jsx";
import { useSticky } from "../hooks/useSticky";
import { useTheme } from "../hooks/useTheme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger } from "@fortawesome/free-solid-svg-icons";
import GoogleTranslator from "./GoogleTranslator.jsx";
import { usePathname } from "next/navigation.js";

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isSticky = useSticky(50);
  const { mode, toggleMode } = useTheme();
  const pathname = usePathname();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const bodyStylesRef = useRef({ overflow: "", paddingRight: "" });
  const previousActiveRef = useRef(null);

  // Close menu when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isMenuOpen) setMenuOpen(false);
  }

  const handleMenuToggle = useCallback(() => setMenuOpen((open) => !open), []);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;
    if (isMenuOpen) {
      bodyStylesRef.current = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
      };

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      body.style.overflow = "hidden";
      body.style.paddingRight = scrollbarWidth ? `${scrollbarWidth}px` : "";
    } else {
      body.style.overflow = bodyStylesRef.current.overflow;
      body.style.paddingRight = bodyStylesRef.current.paddingRight;
    }

    return () => {
      body.style.overflow = bodyStylesRef.current.overflow;
      body.style.paddingRight = bodyStylesRef.current.paddingRight;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || typeof document === "undefined") return;

    const nav = document.querySelector(".nav-menu");
    if (!nav) return;

    const focusableSelector =
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    const focusable = Array.from(nav.querySelectorAll(focusableSelector));

    previousActiveRef.current = document.activeElement;

    requestAnimationFrame(() => {
      const firstFocusable = focusable[0];
      if (firstFocusable && typeof firstFocusable.focus === "function") {
        firstFocusable.focus();
      }
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleMenuClose();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      const previousActive = previousActiveRef.current;
      if (previousActive && typeof previousActive.focus === "function") {
        previousActive.focus();
      }
    };
  }, [isMenuOpen, handleMenuClose]);

  return (
    <header
      className={`header ${isSticky ? "sticky" : ""} ${isMenuOpen ? "open" : ""} ${isCompleted ? "notranslate" : ""}`.trim()}
    >
      <div className="header-inner">
        <Logo />

        <button
          className="menu-toggle"
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-label={t("Open/close menu")}
        >
          <FontAwesomeIcon icon={faHamburger} />
        </button>

        <NavMenu onNavigate={handleMenuClose} />

        <div className="controls">
          <GoogleTranslator />
          <GitHubHeaderBadge mode={mode} />
          <Theme mode={mode} onToggle={toggleMode} />
        </div>
      </div>

      <button
        className={`nav-backdrop ${isMenuOpen ? "open" : ""}`}
        type="button"
        aria-label={t("Close menu")}
        onClick={handleMenuClose}
      />
    </header>
  );
}
