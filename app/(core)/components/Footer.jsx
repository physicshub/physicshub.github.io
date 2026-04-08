"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faGithub,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import BackToTopButton from "./BackToTop";
import { useFeedback } from "../context/FeedbackProvider";
import { faBug } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../hooks/useTranslation";

const links = [
  { label: "Home", to: "/", exact: true },
  { label: "Simulations", to: "/simulations" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contribute", to: "/contribute" },
];

function Footer() {
  const year = new Date().getFullYear();

  // 2. Inizializza l'hook per ottenere la funzione openFeedback
  const { openFeedback } = useFeedback();

  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const version = process.env.NEXT_PUBLIC_APP_VERSION
    ? `v${process.env.NEXT_PUBLIC_APP_VERSION}`
    : "Loading...";

  return (
    <footer className={isCompleted ? "notranslate" : ""}>
      <div className="footer-content">
        <div className="footer-section footer-about">
          <h3>
            PhysicsHub{" "}
            <a
              className="ph-btn ph-btn--ghost footer-version"
              href="https://github.com/physicshub/physicshub.github.io/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              {version}
            </a>
          </h3>
          <p>
            {t(
              "A small web application to help student understand physics with cool interactive simulations and easily understandable theory."
            )}
          </p>
        </div>
        <div className="footer-section footer-links">
          <h3 className="footer-center">{t("Quick Links")}</h3>
          <ul>
            {links.map(({ to, label }) => (
              <li key={to}>
                <div className="footer-links-dot" />
                <Link href={to}>{t(label)}</Link>
              </li>
            ))}
            <li>
              <div className="footer-links-dot" />
              <a onClick={openFeedback} style={{ cursor: "pointer" }}>
                {t("Leave Feedback")}
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-section footer-socials">
          <h3 className="footer-center">{t("Connect")}</h3>
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
            <a
              aria-label="Report Bug"
              onClick={openFeedback}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faBug} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {year} @mattqdev. {t("Released under the")}{" "}
          <a href="https://opensource.org/licenses/MIT">{t("MIT License")}</a>.{" "}
          {t("Credits to")} <a href="https://p5js.org/">p5.js</a> {t("and")}{" "}
          <a href="https://natureofcode.com/">Nature of Code</a>{" "}
          {t("for some simulations concepts.")}
        </p>
        <BackToTopButton />
      </div>
    </footer>
  );
}

export default Footer;
