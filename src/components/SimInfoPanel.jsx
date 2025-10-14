// src/components/SimInfoPanel.jsx
import React, { useState, useEffect, useRef } from "react";

export default function SimInfoPanel({ data, cooldown = 100 }) {
  const [displayData, setDisplayData] = useState(data);
  const lastUpdateRef = useRef(Date.now());
  const dataRef = useRef(data);

  // Aggiorna il ref quando data cambia
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Update displayData at most once every `cooldown` milliseconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= cooldown) {
        setDisplayData(dataRef.current);
        lastUpdateRef.current = now;
      }
    }, cooldown);

    return () => clearInterval(interval);
  }, [cooldown]);

  return (
    <div className="sim-info-panel">
      {Object.entries(displayData).map(([key, value]) => (
        <div key={key} className="sim-info-row">
          <span className="sim-info-label">{key}:</span>
          <span className="sim-info-value">{value}</span>
        </div>
      ))}
    </div>
  );
}