"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../(core)/hooks/useTranslation";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/simulations", label: "Simulations" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contribute", label: "Contribute" },
];

type NavMenuProps = {
  onNavigate?: () => void;
};

export default function NavMenu({ onNavigate }: NavMenuProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLUListElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const updateUnderline = useCallback(() => {
    if (!navRef.current) return;

    const activeLink = navRef.current.querySelector<HTMLAnchorElement>(
      `.nav-link[href="${pathname}"]`
    );

    if (activeLink) {
      const rect = activeLink.getBoundingClientRect();
      const parentRect = navRef.current.getBoundingClientRect();

      setUnderlineStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [pathname]);

  useEffect(() => {
    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [updateUnderline]);

  const handleNavigate = useCallback(() => {
    onNavigate?.();
  }, [onNavigate]);

  return (
    <nav className={`nav-menu ${isCompleted ? "notranslate" : ""}`}>
      <button
        className="nav-close"
        type="button"
        aria-label={t("Close menu")}
        onClick={handleNavigate}
      >
        <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
      </button>
      <ul className="nav-list" ref={navRef}>
        {menuItems.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              onClick={handleNavigate}
            >
              {t(label)}
            </Link>
          </li>
        ))}

        {/* Single sliding underline */}
        <span
          className="nav-underline"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
        />
      </ul>
    </nav>
  );
}
