import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faXTwitter, faGithub, faDiscord} from '@fortawesome/free-brands-svg-icons' 

function Footer() {
  const year = new Date().getFullYear();
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer>
      <div className="footer-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,100 900,0 1200,80 L1200,120 L0,120 Z" opacity="0.6"/>
          <path d="M0,20 C300,120 900,20 1200,100 L1200,120 L0,120 Z" opacity="0.4"/>
          <path d="M0,40 C300,140 900,40 1200,120 L1200,120 L0,120 Z"/>
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer-section footer-about">
          <h3>About the website</h3>
          <p>Website descrizione.</p>
        </div>
        <div className="footer-section footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section footer-socials">
          <h3>Connect</h3>
          <div>
            <a href="https://twitter.com/mattqdev" aria-label="Twitter"><FontAwesomeIcon icon={faXTwitter}/></a>
            <a href="https://github.com/mattqdev" aria-label="GitHub"><FontAwesomeIcon icon={faGithub}/></a>
            <a href="https://linkedin.com/in/mattqdev" aria-label="LinkedIn"><FontAwesomeIcon icon={faDiscord}/></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {year} @mattqdev. All rights reserved.</p>
        <button
          onClick={scrollToTop}
          className="back-to-top"
          aria-label="Back to top"
        >↑</button>
      </div>
    </footer>
  );
}

export default Footer;
