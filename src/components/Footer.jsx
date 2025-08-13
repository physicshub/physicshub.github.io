import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import {faXTwitter, faGithub, faDiscord} from '@fortawesome/free-brands-svg-icons' 

function Footer() {
  const year = new Date().getFullYear();
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer>
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
            <a href="https://discord.gg/invite/Rpwbb9YMzr" aria-label="LinkedIn"><FontAwesomeIcon icon={faDiscord}/></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {year} @mattqdev. All rights reserved. Credit to <a href='https://p5js.org/'>p5.js</a> for simulations.</p>
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
