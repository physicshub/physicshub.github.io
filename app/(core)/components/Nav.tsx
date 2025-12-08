import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/simulations", label: "Simulations" },
  { href: '/blog', label: 'Blog' },
  { href: "/about", label: "About" },
  { href: '/contribute', label: 'Contribute' }
];

export default function NavMenu() {
  const pathname = usePathname();

  return (
    <nav>
      <ul>
        {menuItems.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={pathname === href ? "active" : ""}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}