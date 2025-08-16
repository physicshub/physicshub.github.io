import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import {faXTwitter, faGithub, faDiscord} from '@fortawesome/free-brands-svg-icons' 
import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/', exact: true },
  { label: 'About', to: '/about' },
  { label: 'Contribute', to: '/contribute' },
  { label: 'Contact', to: '/contact' },
];

function Footer() {
  const year = new Date().getFullYear();
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section footer-about">
          <h3>PhysicsHub</h3>
          <p>A small web application to help student understand physics with cool interactive simulations and easily understandable theory.</p>
        </div>
        <div className="footer-section footer-links">
          <h3>Quick Links</h3>
          <ul>
            {links.map(({ to, label, exact }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={exact}
                >{label}</NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-section footer-socials">
          <h3>Connect</h3>
          <div>
            <a href="https://x.com/mattqdev" aria-label="XTwitter"><FontAwesomeIcon icon={faXTwitter}/></a>
            <a href="https://github.com/physicshub/physicshub.github.io" aria-label="GitHub"><FontAwesomeIcon icon={faGithub}/></a>
            <a href="https://discord.gg/hT68DTcwfD" aria-label="Discord"><FontAwesomeIcon icon={faDiscord}/></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {year} @mattqdev. Released under the <a href="https://opensource.org/licenses/MIT">MIT License</a>. Thanks to <a href="https://p5js.org/">p5.js</a> for the simulations.</p>
        <button
          onClick={scrollToTop}
          className="back-to-top"
          aria-label="Back to top"
        ><FontAwesomeIcon icon={faArrowUp}/></button>
      </div>
    </footer>
  );
}

export default Footer;
