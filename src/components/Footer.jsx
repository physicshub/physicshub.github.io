import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXTwitter, faGithub, faDiscord} from '@fortawesome/free-brands-svg-icons' 
import { NavLink } from 'react-router-dom';
import BackToTopButton from './BackToTop';

const links = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Simulations', to: '/simulations' },
  { label: 'About', to: '/about' },
  { label: 'Contribute', to: '/contribute' },
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
          <h3 className='footer-center'>Quick Links</h3>
          <ul>
            {links.map(({ to, label, exact }) => (
              <li key={to}>
                <div className='footer-links-dot'/>
                <NavLink
                  to={to}
                  end={exact}
                >{label}</NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-section footer-socials">
          <h3 className='footer-center'>Connect</h3>
          <div className='footer-socials-inner'>
            <a href="https://github.com/physicshub/physicshub.github.io" aria-label="GitHub"><FontAwesomeIcon icon={faGithub}/></a>
            <a href="https://discord.gg/hT68DTcwfD" aria-label="Discord"><FontAwesomeIcon icon={faDiscord}/></a>
            <a href="https://x.com/mattqdev" aria-label="XTwitter"><FontAwesomeIcon icon={faXTwitter}/></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {year} @mattqdev. Released under the <a href="https://opensource.org/licenses/MIT">MIT License</a>. Credits to <a href="https://p5js.org/">p5.js</a> and <a href="https://natureofcode.com/">Nature of Code</a> for the simulations.</p>
        <BackToTopButton/>
      </div>
    </footer>
  );
}

export default Footer;
