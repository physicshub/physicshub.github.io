"use client";
import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Stars from "./Stars";
import GradientBackground from "./GradientBackground";

export default function Layout({
  children,
  showStars = false,
  showGradient = false,
  starColor = "AEE3FF",
  starOpacity = 0.4,
}) {
  return (
    <>
      <Header />
      {showStars && (
        <Stars
          color={starColor}
          opacity={starOpacity}
          zIndex={1}
          starDensity={0.005}
        />
      )}
      {showGradient && <GradientBackground />}
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </div>
    </>
  );
}
