"use client";

import { useState, useEffect } from "react";
import useTranslation from "../../hooks/useTranslation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes, faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faWhatsapp,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import BackToTopButton from "../BackToTop";

interface BlogInteractionsProps {
  title: string;
}

export default function BlogInteractions({ title }: BlogInteractionsProps) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // ✅ SSR-safe, lint-safe, no hydration mismatch
  const [shareUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReady = shareUrl !== "";

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      {/* 1. PROGRESS BAR */}
      <div
        className="reading-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <BackToTopButton onlyMobile={false} />

      {/* 2. SHARE BUTTONS SECTION */}
      <div className="share-section">
        <span className="share-label">{t("Share:")}</span>

        <a
          href={
            isReady
              ? `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn linkedin"
          aria-label={t("Share on LinkedIn")}
        >
          <FontAwesomeIcon icon={faLinkedin} />
        </a>

        <a
          href={
            isReady
              ? `https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn twitter"
          aria-label={t("Share on Twitter")}
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>

        <a
          href={
            isReady
              ? `https://api.whatsapp.com/send?text=${title} ${shareUrl}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn whatsapp"
          aria-label={t("Share on WhatsApp")}
        >
          <FontAwesomeIcon icon={faWhatsapp} />
        </a>

        <button
          onClick={copyLink}
          className="share-btn copy"
          aria-label={t("Copy Link")}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faShareNodes} />
          {copied && <span className="copy-feedback">{t("Copied!")}</span>}
        </button>
      </div>
    </div>
  );
}
