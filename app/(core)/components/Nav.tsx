"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import useTranslation from "../../(core)/hooks/useTranslation";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/simulations", label: "Simulations" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contribute", label: "Contribute" },
];

export default function NavMenu() {
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

  return (
    <nav className={`nav-menu ${isCompleted ? "notranslate" : ""}`}>
      <ul className="nav-list" ref={navRef}>
        {menuItems.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
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
