// src/components/Header.jsx
import { useState, useCallback } from 'react';
import { Logo } from './Logo';
import { NavMenu } from './Nav';
import { Theme } from './Theme';
import { Search } from './Search';
import { useSticky } from '../hooks/useSticky';
import { useTheme } from '../hooks/useTheme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHamburger } from '@fortawesome/free-solid-svg-icons';
import GoogleTranslator from './GoogleTranslator.jsx';

export default function Header({ onSearch }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isSticky = useSticky(50);
  const { mode, toggleMode } = useTheme();

  const handleMenuToggle = useCallback(
    () => setMenuOpen((open) => !open),
    []
  );

  return (
    <header
      className={`header ${isSticky ? 'sticky' : ''} ${isMenuOpen ? 'open' : ''}`.trim()}
    >
      <div className="header-inner">
        <Logo />

        <button
          className="menu-toggle"
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-label="Open/close menu"
        >
          <FontAwesomeIcon icon={faHamburger} />
        </button>

        <NavMenu isOpen={isMenuOpen} />

        <div className="controls">
          <GoogleTranslator/>
          <Theme mode={mode} onToggle={toggleMode} />
          {/* {onSearch && <Search onSearch={onSearch} />} */}
          <Search onSearch={onSearch} />
        </div>
      </div>
    </header>
  );
}

