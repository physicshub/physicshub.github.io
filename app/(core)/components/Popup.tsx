// app/(core)/components/Popup.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../styles/popup.css";

interface PopupButton {
  label: string;
  onClick: () => void;
  type?: "primary" | "secondary";
}

interface PopupContent {
  title: string;
  description?: string;
  buttons?: PopupButton[];
}

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  popupContent?: PopupContent;
}

/* Example usage:
/* import React, { useState } from "react";
import Popup from "./Popup";

const ExamplePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Apri Popup
      </button>

      <Popup
        isOpen={open}
        onClose={() => setOpen(false)}
        popupContents={[
          title: "Conferma Azione",
          description: "Sei sicuro di voler procedere con questa azione?",
          buttons: [
            {
              label: "Conferma",
              onClick: () => {
                alert("Confermato!");
                setOpen(false);
              },
              type: "primary",
            },
            {
              label: "Annulla",
              onClick: () => setOpen(false),
              type: "secondary",
            },
          ]
        ]}
      />
    </div>
  );
};

export default ExamplePage; */

const Popup: React.FC<PopupProps & { children?: React.ReactNode }> = ({
  isOpen,
  onClose,
  popupContent,
  children,
}) => {
  const [visible, setVisible] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setVisible(true);
  }

  useEffect(() => {
    if (!isOpen) {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!visible || !popupContent) return null;

  const { title, description, buttons = [] } = popupContent;

  const popupNode = (
    <div className={`popup-overlay ${isOpen ? "show" : "hide"}`}>
      <div
        className={`popup-container ${isOpen ? "popup-enter" : "popup-exit"}`}
      >
        <div className="popup-header">
          <div>
            <h2 className="ph-hero__title">{title}</h2>
            {description && <p className="ph-hero__subtitle">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="popup-close-btn ph-btn ph-btn--ghost"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
        <div className="popup-custom-content">{children}</div>

        <div className="popup-buttons">
          {buttons.map((btn, idx) => (
            <a
              key={idx}
              onClick={btn.onClick}
              className={`ph-btn ph-btn--${btn.type === "primary" ? "primary" : "ghost"}`}
            >
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(popupNode, document.body);
};

export default Popup;
