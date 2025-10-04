// src/components/ContributorsSectionSkeleton.jsx
import React, { useEffect, useState } from "react";

export default function Skeleton() {
  return (
    <div className="contributors-section" id="contributors">
      <h2 className="title">Project Contributors</h2>
      <div className="contributors-grid">
        <div className="contributor-card-skeleton"/>
        <div className="contributor-card-skeleton"/>
        <div className="contributor-card-skeleton"/>
        <div className="contributor-card-skeleton"/>
        <div className="contributor-card-skeleton"/>
        <div className="contributor-card-skeleton"/>
      </div>
    </div>
  );
}
