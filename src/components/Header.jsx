import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun, faMagnifyingGlass, faHamburger} from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom"

function Header(){
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${sticky?'sticky':''} ${open?'open':''}`}>
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="Home">
          <img src="../public/icon.png" alt="Logo" draggable="false" />
        </Link>
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        ><FontAwesomeIcon icon={faHamburger}/></button>
        <nav>
          <ul>
            <li><a href="#home" className="active">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        <div className="controls">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme==='dark'?'light':'dark')}
            aria-label="Toggle theme"
          >{theme==='dark'?<FontAwesomeIcon icon={faSun}/>:<FontAwesomeIcon icon={faMoon}/>}</button>
          <div className="search-container">
            <input type="search" placeholder="Search..." aria-label="Search"/>
            <button type="submit" aria-label="Submit search"><FontAwesomeIcon icon={faMagnifyingGlass}/></button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
