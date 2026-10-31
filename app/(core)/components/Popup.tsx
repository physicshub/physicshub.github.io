"use client";
// app/(core)/components/Popup.tsx
//
// The site's one modal dialog: feedback, share link, download, sign-in,
// publish preset, landing CTAs. Portaled to <body>.
//
//   header  → optional icon badge, title, description, close button
//   body    → `children`, scrolls on its own when the dialog hits max height
//   footer  → `popupContent.buttons`, always visible
//
// Behaviour every consumer gets for free: Escape and backdrop click close it,
// Tab is trapped inside, focus moves in on open and back to the trigger on
// close, the page behind stops scrolling, and under 640px it docks to the
// bottom as a sheet. Styles: styles/components/popup.css.

import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import useTranslation from "../hooks/useTranslation";

export interface PopupButton {
  /** A string is translated; a node is rendered as given. */
  label: ReactNode;
  onClick?: () => void;
  /** Renders a real link instead of a button (opened in a new tab). */
  href?: string;
  type?: "primary" | "secondary";
  icon?: IconDefinition;
  disabled?: boolean;
  /** Submits the form with this id, so a form's action can live in the footer. */
  form?: string;
}

export interface PopupContent {
  title: string;
  description?: string;
  buttons?: PopupButton[];
}

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  popupContent?: PopupContent;
  /** Shown in an accent badge beside the title. */
  icon?: IconDefinition;
  /** sm ≈ 26rem (confirmations), md ≈ 32rem (forms, the default). */
  size?: "sm" | "md";
  children?: ReactNode;
}

const EXIT_MS = 200;

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

// Locks page scroll without the layout jumping by the scrollbar's width.
function lockScroll() {
  const { body, documentElement } = document;
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  const previous = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };
  body.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  return () => {
    body.style.overflow = previous.overflow;
    body.style.paddingRight = previous.paddingRight;
  };
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  popupContent,
  icon,
  size = "md",
  children,
}) => {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const pressedOnBackdrop = useRef(false);

  // Stay mounted through the exit transition.
  const [mounted, setMounted] = useState(isOpen);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setMounted(true);
  }

  useEffect(() => {
    if (isOpen) return;
    const timeout = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Open: lock scroll, move focus in, restore it on close.
  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    const unlock = lockScroll();
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      // Prefer the first field in the body (not on touch screens, where it
      // would throw the keyboard up); fall back to the dialog itself so the
      // close button doesn't greet the reader with a focus ring.
      const field = window.matchMedia("(pointer: fine)").matches
        ? dialog.querySelector<HTMLElement>(
            ".popup__body input, .popup__body textarea, .popup__body select"
          )
        : null;
      (field ?? dialog).focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      unlock();
      if (trigger && document.contains(trigger)) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  // Escape on the document, so it still works after a click on the backdrop
  // has moved focus to <body>.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Tab cycles inside the dialog.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!mounted || !popupContent || typeof document === "undefined") {
    return null;
  }

  const { title, description, buttons = [] } = popupContent;
  const label = (value: ReactNode) =>
    typeof value === "string" ? t(value) : value;

  const popupNode = (
    <div
      className={`popup-overlay ${isCompleted ? "notranslate" : ""}`}
      data-state={isOpen ? "open" : "closed"}
      // Close only when the press both starts and ends on the backdrop, so
      // selecting text in a field and releasing outside doesn't dismiss it.
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pressedOnBackdrop.current && e.target === e.currentTarget) {
          onClose();
        }
        pressedOnBackdrop.current = false;
      }}
    >
      <div
        ref={dialogRef}
        className={`popup popup--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className="popup__header">
          {icon && (
            <span className="popup__icon" aria-hidden="true">
              <FontAwesomeIcon icon={icon} />
            </span>
          )}
          <div className="popup__heading">
            <h2 id={titleId} className="popup__title">
              {t(title)}
            </h2>
            {description && (
              <p id={descriptionId} className="popup__description">
                {t(description)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="popup__close"
            aria-label={t("Close")}
            title={t("Close")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        {children && <div className="popup__body">{children}</div>}

        {buttons.length > 0 && (
          <footer className="popup__footer">
            {buttons.map((btn, idx) => {
              const className = `ph-btn ph-btn--${
                btn.type === "primary" ? "primary" : "ghost"
              } popup__action`;
              const content = (
                <>
                  {btn.icon && <FontAwesomeIcon icon={btn.icon} />}
                  {label(btn.label)}
                </>
              );
              return btn.href ? (
                <a
                  key={idx}
                  href={btn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  onClick={btn.onClick}
                >
                  {content}
                </a>
              ) : (
                <button
                  key={idx}
                  type={btn.form ? "submit" : "button"}
                  form={btn.form}
                  className={className}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                >
                  {content}
                </button>
              );
            })}
          </footer>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(popupNode, document.body);
};

export default Popup;
