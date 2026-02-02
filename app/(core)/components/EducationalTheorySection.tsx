// EducationalTheorySection.tsx
"use client";
import React from "react";
import LearningObjectives from "./LearningObjectives.tsx";
import PhysicsEquations from "./PhysicsEquations.tsx";
import PhysicsWarnings from "./PhysicsWarnings.tsx";
import GuidedExperiments from "./GuidedExperiments.tsx";

interface EducationalTheorySectionProps {
  learningObjectives: {
    title: string;
    goals: string[];
    variables: string[];
  };
  physicsEquations: Array<{
    name: string;
    formula: string;
    description?: string;
  }>;
  warnings: Array<{
    id: string;
    message: string;
    severity: "warning" | "error";
  }>;
  guidedExperiments: Array<{
    id: string;
    name: string;
    description: string;
    instructions: string[];
    question?: string;
    parameters: Record<string, any>;
  }>;
  onApplyExperiment: (params: Record<string, any>) => void;
}

export default function EducationalTheorySection({
  learningObjectives,
  physicsEquations,
  warnings,
  guidedExperiments,
  onApplyExperiment,
}: EducationalTheorySectionProps) {
  return (
    <div className="educational-theory-section">
      <LearningObjectives
        title={learningObjectives.title}
        goals={learningObjectives.goals}
        variables={learningObjectives.variables}
      />
      
      <PhysicsEquations equations={physicsEquations} />
      
      {warnings.length > 0 && <PhysicsWarnings warnings={warnings} />}
      
      <GuidedExperiments
        experiments={guidedExperiments}
        onApplyExperiment={onApplyExperiment}
      />
    </div>
  );
}
