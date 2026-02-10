// CollapsibleSection.tsx
"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  icon,
  className = "",
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`collapsible-section ${className} ${isExpanded ? "expanded" : "collapsed"}`}
    >
      <button
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="collapsible-header-content">
          {icon && <span className="collapsible-icon">{icon}</span>}
          <h3 className="collapsible-title">{title}</h3>
        </div>
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="collapsible-arrow"
        />
      </button>
      {isExpanded && <div className="collapsible-content">{children}</div>}
    </div>
  );
}
