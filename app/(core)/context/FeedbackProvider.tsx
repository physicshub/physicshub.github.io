// app/(core)/context/FeedbackProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Popup from "../components/Popup";
import { sendFeedbackToDiscord } from "../utils/sendFeedback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faCommentDots,
  faPaperPlane,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../hooks/useTranslation";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

interface FeedbackContextType {
  openFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

export const FeedbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const { t } = useTranslation();
  const pathname = usePathname();

  const openFeedback = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const shouldShow = Math.random() < 0.5; // 50%
    const hasSeenThisSession = sessionStorage.getItem("feedback_shown");

    if (shouldShow && !hasSeenThisSession) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("feedback_shown", "true");
      }, 120000); // 120000ms = 2 minutes
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleSubmit = async () => {
    setStatus("sending");
    const isSuccess = await sendFeedbackToDiscord(rating, comment, pathname);

    if (isSuccess) {
      setStatus("idle");
      setIsOpen(false);
      setRating(0);
      setComment("");
    } else {
      setStatus("error");
    }
  };

  const shown = hover || rating;
  // A rating is required: the Discord embed rejects an empty "Rating" field.
  const canSend = rating > 0 && status !== "sending";

  return (
    <FeedbackContext.Provider value={{ openFeedback }}>
      {children}
      <Popup
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          if (status === "error") setStatus("idle");
        }}
        icon={faCommentDots}
        popupContent={{
          title: "How is PhysicsHub working for you?",
          description:
            "Rate your experience and tell us what to improve — or report a bug.",
          buttons: [
            {
              label: status === "sending" ? "Sending…" : "Send feedback",
              icon: faPaperPlane,
              onClick: handleSubmit,
              type: "primary",
              disabled: !canSend,
            },
          ],
        }}
      >
        <div className="popup-stack">
          <div className="feedback-rating">
            <div
              className="feedback-rating__stars"
              role="radiogroup"
              aria-label={t("Rating")}
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} / 5 — ${t(RATING_LABELS[star - 1])}`}
                  className={`feedback-rating__star ${star <= shown ? "is-on" : ""}`}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onMouseEnter={() => setHover(star)}
                  onFocus={() => setHover(star)}
                  onBlur={() => setHover(0)}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              ))}
            </div>
            <p className="feedback-rating__caption" aria-live="polite">
              {shown ? t(RATING_LABELS[shown - 1]) : t("Tap a star to rate")}
            </p>
          </div>

          <label className="popup-field">
            <span className="popup-field__label">
              {t("Your thoughts")}
              <span className="popup-field__optional">({t("optional")})</span>
            </span>
            <textarea
              className="popup-input"
              rows={5}
              placeholder={t(
                "What did you like? What was confusing or broken?"
              )}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>

          {status === "error" && (
            <p className="popup-alert popup-alert--error" role="alert">
              <FontAwesomeIcon icon={faCircleExclamation} />
              {t("Could not send feedback. Please try again later.")}
            </p>
          )}
        </div>
      </Popup>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};
