// app/(core)/components/Header.jsx
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
import { faBars } from "@fortawesome/free-solid-svg-icons";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { usePathname } from "next/navigation.js";

const NAV_ID = "site-nav";
const DRAWER_QUERY = "(max-width: 840px)";

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isSticky = useSticky(50);
  const { mode, toggleMode } = useTheme();
  const pathname = usePathname();
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const headerRef = useRef(null);
  const bodyStylesRef = useRef({ overflow: "", paddingRight: "" });
  const previousActiveRef = useRef(null);

  // Close the drawer when the route changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isMenuOpen) setMenuOpen(false);
  }

  const handleMenuToggle = useCallback(() => setMenuOpen((open) => !open), []);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  // The drawer only exists below 840px. If the viewport grows past that while
  // it is open, close it so body scroll isn't left locked.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia(DRAWER_QUERY);
    const handleChange = (event) => {
      if (!event.matches) setMenuOpen(false);
    };

    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Lock body scroll while the drawer is open, compensating for the
  // scrollbar so the page doesn't shift.
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

  // Trap focus inside the open drawer, close on Escape, restore focus on close.
  useEffect(() => {
    if (!isMenuOpen || typeof document === "undefined") return;

    const nav = headerRef.current?.querySelector(".nav-menu");
    if (!nav) return;

    const focusableSelector =
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    const focusable = Array.from(nav.querySelectorAll(focusableSelector));

    previousActiveRef.current = document.activeElement;

    requestAnimationFrame(() => {
      focusable[0]?.focus();
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
      previousActiveRef.current?.focus?.();
    };
  }, [isMenuOpen, handleMenuClose]);

  return (
    <>
      <header
        ref={headerRef}
        className={`header ${isSticky ? "sticky" : ""} ${isMenuOpen ? "open" : ""} ${isCompleted ? "notranslate" : ""}`.trim()}
      >
        <div className="header-inner">
          <Logo />

          <button
            className="menu-toggle"
            type="button"
            onClick={handleMenuToggle}
            aria-expanded={isMenuOpen}
            aria-controls={NAV_ID}
            aria-label={t("Open/close menu")}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <NavMenu id={NAV_ID} onNavigate={handleMenuClose} />

          <div className="controls">
            <GitHubHeaderBadge mode={mode} />
            <LanguageSwitcher />
            <Theme mode={mode} onToggle={toggleMode} />
          </div>
        </div>
      </header>

      {/* Sibling of <header> so it isn't clipped by the bar's
          backdrop-filter containing block. */}
      <button
        className={`nav-backdrop ${isMenuOpen ? "open" : ""}`.trim()}
        type="button"
        aria-label={t("Close menu")}
        tabIndex={isMenuOpen ? 0 : -1}
        onClick={handleMenuClose}
      />
    </>
  );
}
