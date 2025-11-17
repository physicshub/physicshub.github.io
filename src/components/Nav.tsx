import { NavLink, useNavigate } from 'react-router-dom';
import React from 'react';

const menuItems = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Simulations', to: '/simulations', portal: true },
  { label: 'About', to: '/about' },
  { label: 'Contribute', to: '/contribute' }
];

interface NavMenuProps {
  isOpen: boolean;
  triggerPortal: (cb: () => void) => void;
}

export async function handleSimulationsNav(
  e: React.MouseEvent,
  triggerPortal: (cb: () => void) => void,
  navigate: (path: string) => void
) {
  e.preventDefault();

  await new Promise<void>((resolve) => {
    triggerPortal(() => resolve());
  });
  navigate('/simulations');
}

export function NavMenu({ isOpen, triggerPortal }: NavMenuProps) {
  const navigate = useNavigate();
  const navClassName = `nav${isOpen ? ' open' : ''}`;

  return (
    <nav className={navClassName.trim()}>
      <ul>
        {menuItems.map(({ to, label, exact, portal }) => (
          <li key={to}>
            {portal ? (
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) => (isActive ? 'active navlink' : 'navlink')}
                onClick={(e) => handleSimulationsNav(e, triggerPortal, navigate)}
              >
                {label}
              </NavLink>
            ) : (
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) => (isActive ? 'active navlink' : 'navlink')}
              >
                {label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
