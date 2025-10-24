// src/components/SimInfoPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faChevronDown, faChevronUp, faEye, faEyeSlash, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function SimInfoPanel({ data, cooldown = 100 }) {
  const [displayData, setDisplayData] = useState(data || {});
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [settingsMode, setSettingsMode] = useState(false);
  const [hiddenKeys, setHiddenKeys] = useState(new Set());

  const lastUpdateRef = useRef(Date.now());
  const dataRef = useRef(data);

  // Update dataRef whenever data changes
  useEffect(() => {
    dataRef.current = data || {};
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

  // Toggle single key visibility
  const toggleKey = (key) => {
    setHiddenKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className={`sim-info-panel ${!isPanelVisible ? "collapsed" : ""}`}>
      <div className="sim-info-header">
        {/* Button collapse/expand */}
        <button
          className="sim-info-btn"
          onClick={() => setIsPanelVisible((v) => !v)}
          title={isPanelVisible ? "Hide panel" : "Show panel"}
        >
          <FontAwesomeIcon icon={isPanelVisible ? faChevronDown : faChevronUp} />
        </button>

        {/* Button settings */}
        {isPanelVisible && <button
          className="sim-info-btn"
          onClick={() => setSettingsMode((m) => !m)}
          title="Toggle show/hide mode"
        >
          <FontAwesomeIcon icon={settingsMode ? faCheck : faGear} />
        </button>}
      </div>

      {isPanelVisible && (
        <div className="sim-info-body">
          {Object.entries(displayData).map(([key, value]) => {
            const isHidden = hiddenKeys.has(key);
            if (settingsMode) {
              // Settings mode: show all entries with toggle buttons
              return (
                <div key={key} className="sim-info-row">
                  <span className="sim-info-label">{key}:</span>
                  {isHidden ? (
                    <button
                      className="sim-info-toggle"
                      onClick={() => toggleKey(key)}
                    >
                      <FontAwesomeIcon icon={faEyeSlash} />
                    </button>
                  ) : (
                    <>
                      <span className="sim-info-value">{value}</span>
                      <button
                        className="sim-info-toggle"
                        onClick={() => toggleKey(key)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </>
                  )}
                </div>
              );
            } else {
              // Normal mode: show only non-hidden entries
              if (isHidden) return null;
              return (
                <div key={key} className="sim-info-row">
                  <span className="sim-info-label">{key}:</span>
                  <span className="sim-info-value">{value}</span>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
