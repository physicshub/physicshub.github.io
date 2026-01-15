// app/(core)/context/FeedbackProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Popup from "../components/Popup";
import { sendFeedbackToDiscord } from "../utils/sendFeedback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

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
    const isSuccess = await sendFeedbackToDiscord(rating, comment, pathname);

    if (isSuccess) {
      setIsOpen(false);
      setRating(0);
      setComment("");
    } else {
      alert("Could not send feedback. Please try again later.");
    }
  };

  return (
    <FeedbackContext.Provider value={{ openFeedback }}>
      {children}
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        popupContent={{
          title: "Feedback",
          description:
            "Help us improve PhysicsHub: rate your experience and share with us your thoughts!",
          buttons: [
            { label: "Send Feedback", onClick: handleSubmit, type: "primary" },
          ],
        }}
      >
        {/* Estendiamo il Popup per accettare figli personalizzati */}
        <div className="feedback-form">
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{
                  cursor: "pointer",
                  fontSize: "2rem",
                  color: star <= rating ? "#FFD700" : "#ccc",
                }}
              >
                <FontAwesomeIcon icon={faStar} />
              </span>
            ))}
          </div>
          <textarea
            className="feedback-textarea"
            placeholder="Write here your thoughts or report a bug..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
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
