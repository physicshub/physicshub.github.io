// app/components/Header.jsx
"use client";
import { useState, useCallback } from "react";
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

  // Close menu when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isMenuOpen) setMenuOpen(false);
  }

  const handleMenuToggle = useCallback(() => setMenuOpen((open) => !open), []);

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

        <NavMenu isOpen={isMenuOpen} />

        <div className="controls">
          <GoogleTranslator />
          <GitHubHeaderBadge mode={mode} />
          <Theme mode={mode} onToggle={toggleMode} />
        </div>
      </div>
    </header>
  );
}
