"use client";
import React from "react";
import { Hero } from "./Hero.jsx";
import Comets from "./Comets.jsx";
import { LandingPart } from "./LandingPart";
import HeroBackground from "./HeroBackground";
import ScrollDown from "./ScrollDown";
import HowItWorks from "./HowItWorks.jsx";
import FeaturedSimulations from "./FeaturedSimulations.jsx";
import TrustStrip from "./TrustStrip.jsx";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import useTranslation from "../hooks/useTranslation.ts";

export default function FullLandingPage() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <section className="ph-hero" aria-label={t("Introduction")}>
        <Comets
          count={6}
          speed={1}
          direction="down-right"
          color="#AEE3FF"
          opacity={0.25}
          zIndex={1}
        />
        <HeroBackground />
        <Hero />
        <ScrollDown />
      </section>

      <HowItWorks />
      <FeaturedSimulations />
      <TrustStrip />

      <div className="lp-community">
        <LandingPart
          title={t("Building this with other people")}
          subtitle={t(
            "PhysicsHub is open source. Ask questions, suggest a simulation, or help translate it — everyone is welcome."
          )}
          ctas={[
            {
              label: t("Join our Discord"),
              to: "https://discord.gg/hT68DTcwfD",
              type: "ghost",
              icon: faDiscord,
              popup: {
                title: t("Thank you for joining us!"),
                description: t(
                  "We are excited to have you in our Discord community. Feel free to explore the channels, ask questions, and connect with other fans or contributors."
                ),
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
