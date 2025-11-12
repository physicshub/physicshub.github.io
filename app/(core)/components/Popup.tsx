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

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, popupContent }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!visible || !popupContent) return null;

  const { title, description, buttons = [] } = popupContent;

  const popupNode = (
    <div className={`popup-overlay ${isOpen ? "show" : "hide"}`}>
      <div className={`popup-container ${isOpen ? "popup-enter" : "popup-exit"}`}>
        <h2 className="ph-hero__title">{title}</h2>
        {description && <p className="ph-hero__subtitle">{description}</p>}
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
          <a onClick={onClose} className="ph-btn ph-btn--ghost">
            Close
          </a>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(popupNode, document.body);
};

export default Popup;
