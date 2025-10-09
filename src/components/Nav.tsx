import { NavLink } from 'react-router-dom';
import React from 'react';

const menuItems = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Simulations', to: '/simulations' },
  { label: 'About', to: '/about' },
  { label: 'Contribute', to: '/contribute' }
];

interface NavMenuProps {
  isOpen: boolean;
}

export function NavMenu({ isOpen }: NavMenuProps) {
  const navClassName = `nav${isOpen ? ' open' : ''}`;

  return (
    <nav className={navClassName.trim()}>
      <ul>
        {menuItems.map(({ to, label, exact }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={exact}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >{label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
