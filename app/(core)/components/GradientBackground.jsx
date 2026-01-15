// GradientBackground.jsx
import React from "react";

export default function GradientBackground() {
  return (
    <>
      <div className="ph-bg" aria-hidden="true">
        <div className="ph-radial" />
      </div>
      <div className="ph-background"></div>
    </>
  );
}
