// app/(core)/components/blog/BlogInteractions.tsx
"use client";

import { useState, useEffect } from "react";
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* 1. PROGRESS BAR */}
      <div
        className="reading-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <BackToTopButton onlyMobile={false} />

      {/* 3. SHARE BUTTONS SECTION */}
      <div className="share-section">
        <span className="share-label">Share:</span>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn linkedin"
          aria-label="Share on LinkedIn"
        >
          <FontAwesomeIcon icon={faLinkedin} />
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn twitter"
          aria-label="Share on Twitter"
        >
          <FontAwesomeIcon icon={faTwitter} />
        </a>

        <a
          href={`https://api.whatsapp.com/send?text=${title} ${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn whatsapp"
          aria-label="Share on WhatsApp"
        >
          <FontAwesomeIcon icon={faWhatsapp} />
        </a>

        <button
          onClick={copyLink}
          className="share-btn copy"
          aria-label="Copy Link"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faShareNodes} />
          {copied && <span className="copy-feedback">Copied!</span>}
        </button>
      </div>
    </>
  );
}
