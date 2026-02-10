// LearningObjectives.tsx
"use client";
import React from "react";

interface LearningObjectivesProps {
  goals: string[];
  variables: string[];
}

export default function LearningObjectives({
  goals,
  variables,
}: LearningObjectivesProps) {
  return (
    <div className="learning-objectives">
      <div className="learning-section">
        <h3 className="learning-section-title">Learning Goals</h3>
        <ul className="learning-list">
          {goals.map((goal, i) => (
            <li key={i}>{goal}</li>
          ))}
        </ul>
      </div>

      <div className="learning-section">
        <h3 className="learning-section-title">Key Variables</h3>
        <ul className="learning-list">
          {variables.map((variable, i) => (
            <li key={`variable-${i}`}>{variable}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
