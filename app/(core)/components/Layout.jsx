"use client";
import Header from "./Header";
import Footer from "./Footer";
import Stars from "./Stars";
import GradientBackground from "./GradientBackground";
import useTranslation from "../hooks/useTranslation.ts";

export default function Layout({
  children,
  showStars = false,
  showGradient = false,
  starColor = "AEE3FF",
  starOpacity = 0.4,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
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
        className={isCompleted ? "notranslate" : ""}
      >
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </div>
    </>
  );
}
