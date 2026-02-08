// PhysicsEquations.tsx
"use client";
import React from "react";

interface PhysicsEquationsProps {
  equations: Array<{
    name: string;
    formula: string;
    description?: string;
  }>;
}

export default function PhysicsEquations({ equations }: PhysicsEquationsProps) {
  return (
    <div className="physics-equations">
      <div className="equations-list">
        {equations.map((eq, i) => (
          <div key={i} className="equation-item">
            <div className="equation-formula">{eq.formula}</div>
            {eq.description && (
              <div className="equation-description">{eq.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
