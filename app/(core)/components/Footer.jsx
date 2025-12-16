"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faGithub,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import BackToTopButton from "./BackToTop";

const links = [
  { label: "Home", to: "/", exact: true },
  { label: "Simulations", to: "/simulations" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contribute", to: "/contribute" },
];

function Footer() {
  const year = new Date().getFullYear();
  
  const version = process.env.NEXT_PUBLIC_APP_VERSION 
    ? `v${process.env.NEXT_PUBLIC_APP_VERSION}` 
    : "Loading..."; 

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section footer-about">
          <h3>
            PhysicsHub{" "}
            <a 
              className="ph-btn ph-btn--ghost footer-version" 
              href="https://github.com/physicshub/physicshub.github.io/releases"
              target="_blank" // È buona norma aprire i link esterni in una nuova scheda
              rel="noopener noreferrer"
            >
              {version}
            </a>
          </h3>
          <p>
            A small web application to help student understand physics with cool
            interactive simulations and easily understandable theory.
          </p>
        </div>
        <div className="footer-section footer-links">
          <h3 className="footer-center">Quick Links</h3>
          <ul>
            {links.map(({ to, label }) => (
              <li key={to}>
                <div className="footer-links-dot" />
                <Link href={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-section footer-socials">
          <h3 className="footer-center">Connect</h3>
          <div className="footer-socials-inner">
            <a
              href="https://github.com/physicshub/physicshub.github.io"
              aria-label="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a href="https://discord.gg/hT68DTcwfD" aria-label="Discord">
              <FontAwesomeIcon icon={faDiscord} />
            </a>
            <a href="https://x.com/mattqdev" aria-label="XTwitter">
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {year} @mattqdev. Released under the{" "}
          <a href="https://opensource.org/licenses/MIT">MIT License</a>. Credits
          to <a href="https://p5js.org/">p5.js</a> and{" "}
          <a href="https://natureofcode.com/">Nature of Code</a> for some
          simulations concepts.
        </p>
        <BackToTopButton />
      </div>
    </footer>
  );
}

export default Footer;