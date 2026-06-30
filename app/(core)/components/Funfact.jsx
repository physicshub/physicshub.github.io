import React from "react";
import funFacts from "../data/facts";

function SparkleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4M12 17v4M5 12H1M23 12h-4M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M18.4 18.4l-2.8-2.8M8.4 8.4 5.6 5.6" />
    </svg>
  );
}

function Funfact({ chapterId, setshow }) {
  const facts = funFacts.find((item) => item.id === chapterId);

  if (!facts) return null;

  return (
    <div className="fun-fact">
      <div className="fun-fact-close">
        <button
          className="btn-close"
          onClick={() => {
            setshow(false);
          }}
        >
          ✕
        </button>
      </div>

      <div className="fun-fact-header">
        <span className="fun-fact-icon">
          <SparkleIcon />
        </span>
        <span className="fun-fact-label">Did you know</span>
      </div>

      <p className="fun-fact-text">{facts.fact}</p>
    </div>
  );
}

export default Funfact;
