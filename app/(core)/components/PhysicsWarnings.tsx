// PhysicsWarnings.tsx
"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface Warning {
  id: string;
  message: string;
  severity: "warning" | "error";
}

interface PhysicsWarningsProps {
  warnings: Warning[];
}

export default function PhysicsWarnings({ warnings }: PhysicsWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="physics-warnings">
      {warnings.map((warning) => (
        <div
          key={warning.id}
          className={`warning-item warning-${warning.severity}`}
        >
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  );
}
