"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import useTranslation from "../../(core)/hooks/useTranslation";
import useRepoStats from "../../(core)/hooks/useRepoStats";

const REPO_URL = "https://github.com/physicshub/physicshub.github.io";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/simulations", label: "Simulations" },
  { href: "/blog", label: "Blog" },
  { href: "/formulas", label: /* i18n */ "Formulas" },
  { href: "/about", label: "About" },
  { href: "/contribute", label: "Contribute" },
];

type NavMenuProps = {
  id?: string;
  onNavigate?: () => void;
};

export default function NavMenu({ id, onNavigate }: NavMenuProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const { t, meta } = useTranslation();
  const { stars } = useRepoStats();
  const isCompleted = meta?.completed || false;

  const updateUnderline = useCallback(() => {
    if (!listRef.current) return;

    const activeLink = listRef.current.querySelector<HTMLAnchorElement>(
      `.nav-link[href="${pathname}"]`
    );

    if (activeLink) {
      const rect = activeLink.getBoundingClientRect();
      const parentRect = listRef.current.getBoundingClientRect();

      setUnderlineStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    } else {
      setUnderlineStyle({ left: 0, width: 0 });
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
    <nav
      id={id}
      className={`nav-menu ${isCompleted ? "notranslate" : ""}`.trim()}
    >
      <button
        className="nav-close"
        type="button"
        aria-label={t("Close menu")}
        onClick={handleNavigate}
      >
        <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
      </button>

      <ul className="nav-list" ref={listRef}>
        {menuItems.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`.trim()}
                aria-current={isActive ? "page" : undefined}
                onClick={handleNavigate}
              >
                {t(label)}
              </Link>
            </li>
          );
        })}

        {/* Sliding indicator under the active link (desktop only). */}
        <span
          className="nav-underline"
          style={{ left: underlineStyle.left, width: underlineStyle.width }}
        />
      </ul>

      {/* Drawer only: the header's GitHub badge is hidden below 1080px. */}
      <a
        className="nav-drawer-github"
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon icon={faGithub} aria-hidden="true" />
        <span>{t("Star the repo")}</span>
        {stars != null ? (
          <span className="nav-drawer-github__count">★ {stars}</span>
        ) : null}
      </a>
    </nav>
  );
}
