"use client"
import React, { useEffect, useState } from "react";
import { Hero } from "./Hero.jsx";
import Stars from "./Stars.jsx";
import Comets from "./Comets.jsx";
import { LandingPart } from "./LandingPart";
import HeroBackground from "./HeroBackground";
import GradientBackground from "./GradientBackground.jsx";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faGlobe, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import ScrollDown from './ScrollDown';


export default function FullLandingPage() {
  const [stats, setStats] = useState({
    online: null,
    visibleMembers: null,
    channels: null,
    voiceActive: null,
    serverName: ""
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          "https://discord.com/api/guilds/1406404598679470121/widget.json"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const voiceActiveCount = data.members.filter((m: { channel_id: any; }) => m.channel_id).length;

        setStats({
          online: data.presence_count ?? null,
          visibleMembers: data.members?.length ?? null,
          channels: data.channels?.length ?? null,
          voiceActive: voiceActiveCount,
          serverName: data.name ?? ""
        });
      } catch (err) {
        console.error("Errore nel recupero stats Discord:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="ph-hero" aria-label="Hero">
      <GradientBackground />
      <Stars color="var(--stars-color)" opacity={0.3} />
      <Comets count={12} speed={1} direction="down-right" color="#AEE3FF" opacity={0.3} zIndex={1} />
      <HeroBackground />
      <Hero />
      <ScrollDown />
      <LandingPart
        title={`Join ${stats.serverName || "the community"}`}
        subtitle="Join other fans and contributors and talk with them!"
        ctas={[
          {
            label: "Join our Discord",
            to: "https://discord.gg/hT68DTcwfD",
            type: "ghost",
            icon: faDiscord,
            popup: {
              title: "Thank you for joining us!",
              description: "We are excited to have you in our Discord community. Feel free to explore the channels, ask questions, and connect with other fans or contributors.",
            }
          }
        ]}
        stats={[
          { label: "Online:", value: stats.online ?? "—", icon: faDiscord },
          // { label: "Membri visibili:", value: stats.visibleMembers ?? "—", icon: faDiscord },
          { label: "Public Channels:", value: stats.channels ?? "—", icon: faGlobe },
          { label: "Now In VC:", value: stats.voiceActive ?? "—", icon: faMicrophone }
        ]}
      />
    </section>    
  );
}
