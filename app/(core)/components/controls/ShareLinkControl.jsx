// app/components/controls/ShareLinkControl.jsx
"use client";
import { useMemo, useState } from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faShare } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faXTwitter,
  faLinkedin,
  faWhatsapp,
  faTelegram,
  faReddit,
} from "@fortawesome/free-brands-svg-icons";
import Popup from "../Popup";
import { buildSimulationUrl } from "../../utils/simulationUrl.js";

export default function ShareLinkControl({
  simulation,
  inputs,
  initialInputs = {},
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const DEFAULT_SHARE_MESSAGE = `${t("Check out this simulation on PhysicsHub, it's")} ${simulation}! `;

  // Only the inputs that differ from their defaults end up in the link.
  const url = useMemo(
    () => buildSimulationUrl(simulation, inputs, initialInputs),
    [simulation, inputs, initialInputs]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleOpen = () => {
    setCopied(false);
    setOpen(true);
    copy();
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(DEFAULT_SHARE_MESSAGE);
  const shareLinks = [
    {
      name: "WhatsApp",
      icon: faWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE + " " + url)}`,
    },
    {
      name: "Telegram",
      icon: faTelegram,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
    },
    {
      name: "X",
      icon: faXTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`,
    },
    {
      name: "Facebook",
      icon: faFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: faLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Reddit",
      icon: faReddit,
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedMessage}`,
    },
  ];

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <button
        onClick={handleOpen}
        className="btn-glow"
        title={t("Copy shareable link to clipboard")}
        aria-label={t("Copy shareable link to clipboard")}
      >
        <FontAwesomeIcon icon={faShare} />
      </button>

      <Popup
        isOpen={open}
        onClose={() => setOpen(false)}
        icon={faShare}
        popupContent={{
          title: copied ? "Link copied!" : "Share this simulation",
          description:
            "The link opens the simulation with the parameters you set.",
        }}
      >
        <div className="popup-stack">
          <div className="popup-field">
            <span className="popup-label" id="share-link-label">
              {t("Link")}
            </span>
            <div className="popup-inline">
              <input
                className="popup-input"
                type="text"
                readOnly
                value={url}
                aria-labelledby="share-link-label"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`ph-btn ph-btn--${copied ? "ghost" : "primary"} popup__action`}
                onClick={copy}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? t("Copied") : t("Copy")}
              </button>
            </div>
          </div>

          <div className="popup-field">
            <span className="popup-label">{t("Share on")}</span>
            <ul className="share-grid">
              {shareLinks.map((social) => (
                <li key={social.name}>
                  <a
                    className="share-grid__item"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon icon={social.icon} />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Popup>
    </div>
  );
}
