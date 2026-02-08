// GuidedExperiments.tsx
"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faCheck } from "@fortawesome/free-solid-svg-icons";

interface Experiment {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  question?: string;
  parameters: Record<string, any>;
}

interface GuidedExperimentsProps {
  experiments: Experiment[];
  onApplyExperiment: (params: Record<string, any>) => void;
}

export default function GuidedExperiments({
  experiments,
  onApplyExperiment,
}: GuidedExperimentsProps) {
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);

  const handleApply = (experiment: Experiment) => {
    onApplyExperiment(experiment.parameters);
    setActiveExperiment(experiment.id);
  };

  return (
    <div className="guided-experiments">
      <div className="experiments-list">
        {experiments.map((experiment) => (
          <div
            key={experiment.id}
            className={`experiment-card ${
              activeExperiment === experiment.id ? "active" : ""
            }`}
          >
            <div className="experiment-header">
              <h4>{experiment.name}</h4>
              <button
                className="experiment-apply-btn"
                onClick={() => handleApply(experiment)}
                title="Apply this experiment"
              >
                <FontAwesomeIcon icon={faCheck} />
                Apply
              </button>
            </div>
            <p className="experiment-description">{experiment.description}</p>
            <div className="experiment-instructions">
              <strong>Instructions:</strong>
              <ol>
                {experiment.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ol>
            </div>
            {experiment.question && (
              <div className="experiment-question">
                <strong>Question:</strong> {experiment.question}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
