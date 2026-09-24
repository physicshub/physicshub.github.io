// app/components/controls/ShareLinkControl.jsx
"use client";
import { useMemo, useState } from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faWhatsapp,
  faTelegram,
  faReddit,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import Popup from "../Popup";
import { buildSimulationUrl } from "../../utils/simulationUrl.js";

export default function ShareLinkControl({
  simulation,
  inputs,
  initialInputs = {},
}) {
  const [open, setOpen] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const DEFAULT_SHARE_MESSAGE = `${t("Check out this simulation on PhysicsHub, it's")} ${simulation}! `;

  // Only the inputs that differ from their defaults end up in the link.
  const url = useMemo(
    () => buildSimulationUrl(simulation, inputs, initialInputs),
    [simulation, inputs, initialInputs]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setOpen(true);
  };

  // Funzioni di condivisione per i vari social
  const shareLinks = [
    {
      label: <FontAwesomeIcon icon={faFacebook} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      type: "primary",
    },
    {
      label: <FontAwesomeIcon icon={faTwitter} />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE)}`,
      type: "primary",
    },
    {
      label: <FontAwesomeIcon icon={faLinkedin} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      type: "primary",
    },
    {
      label: <FontAwesomeIcon icon={faWhatsapp} />,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE + " " + url)}`,
      type: "primary",
    },
    {
      label: <FontAwesomeIcon icon={faTelegram} />,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(DEFAULT_SHARE_MESSAGE)}`,
      type: "primary",
    },
    {
      label: <FontAwesomeIcon icon={faReddit} />,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(DEFAULT_SHARE_MESSAGE)}`,
      type: "primary",
    },
    {
      label: <FontAwesomeIcon icon={faInstagram} />,
      href: `https://www.instagram.com/`, // Instagram non ha un vero sharer URL, si apre la homepage
      type: "primary",
    },
  ];

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <button
        onClick={handleCopy}
        className="btn-glow"
        title={t("Copy shareable link to clipboard")}
      >
        <FontAwesomeIcon icon={faShare} />
      </button>

      <Popup
        isOpen={open}
        onClose={() => setOpen(false)}
        popupContent={{
          title: t("Link Copied!"),
          description: t(
            "The shareable link has been copied to your clipboard.\n Share it now on Social Media:"
          ),
          buttons: [
            ...shareLinks.map((social) => ({
              label: social.label,
              onClick: () => {
                window.open(social.href, "_blank", "noopener,noreferrer");
              },
              type: social.type,
            })),
          ],
        }}
      />
    </div>
  );
}
