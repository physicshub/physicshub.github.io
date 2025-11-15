// app/components/controls/ShareLinkControl.jsx
"use client";
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMailBulk, faMailForward, faShare } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faWhatsapp,
  faTelegram,
  faReddit,
  faInstagram,
  faPinterest,
  faTumblr,
} from "@fortawesome/free-brands-svg-icons";
import Popup from "../Popup";


export default function ShareLinkControl({ simulation, inputs }) {
  const [open, setOpen] = useState(false);
  const DEFAULT_SHARE_MESSAGE = `Check out this simulation on PhysicsHub, it's ${simulation}! `;

  // Build URL with query parameters
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(inputs).toString();
    console.log(simulation)
    return `${window.location.origin}/${simulation}?${params}`;
  }, [simulation, inputs]);

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
    }
  ];

  return (
    <>
      <button
        onClick={handleCopy}
        className="btn-glow"
        title="Copy shareable link to clipboard"
      >
        <FontAwesomeIcon icon={faShare} />
      </button>

      <Popup
        isOpen={open}
        onClose={() => setOpen(false)}
        popupContent={{
          title: "Link Copied!",
          description:
            "The shareable link has been copied to your clipboard.\n Share it now on Social Media:",
          buttons: [
            ...shareLinks.map((social) => ({
              label: social.label,
              onClick: () => {
                window.open(social.href, "_blank", "noopener,noreferrer");
              },
              type: social.type,
            }))
          ],
        }}
      />
    </>
  );
}
