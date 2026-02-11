import Back from "./Back";
import simulations from "../data/chapters";
import { usePathname } from "next/navigation";
import useMobile from "../hooks/useMobile";
import { useEffect, useState } from "react";
import FunFactSlider from "../components/FunFactSlider";

export default function TopSim() {
  const location = usePathname();
  const idx = simulations.findIndex((sim) => sim.link === location);
  const isMobile = useMobile();
  const [showFact, setShowFact] = useState(true);

  useEffect(() => {
    setShowFact(true);
    const timer = setTimeout(() => setShowFact(false), 7000);
    return () => clearTimeout(timer);
  }, [location]);

  function getPrevious() {
    if (idx === -1) return "/";
    return simulations[(idx - 1 + simulations.length) % simulations.length].link;
  }

  function getNext() {
    if (idx === -1) return "/";
    return simulations[(idx + 1) % simulations.length].link;
  }

  function getCurrentName() {
    if (idx === -1) return "";
    return `${simulations[idx].id} - ${simulations[idx].name}`;
  }

  const funFacts = simulations[idx]?.funFacts || [];
  const fact =
    funFacts.length > 0
      ? funFacts[Math.floor(Math.random() * funFacts.length)]
      : null;

  return (
    <div className="top-nav-sim relative overflow-hidden">
      {!isMobile && (
        <div className="top-nav-sim-back-to-home-wrapper">
          <Back link="/simulations" />
        </div>
      )}

      <div
        className="top-nav-sim-inner"
        style={{ maxWidth: isMobile ? "100%" : "80%" }}
      >
        <Back link={getPrevious()} type="responsive" arrowPosition="left" content="Previous" />
        <h3>{getCurrentName()}</h3>
        <Back link={getNext()} type="responsive" arrowPosition="right" content="Next" />
      </div>

      {/* ✅ RIGHT SIDE SLIDING FUN FACT */}
      { !isMobile && showFact && (
        <FunFactSlider
          fact={fact}
        />
      )}

      {!isMobile && <div className="top-nav-sim-filler" />}
    </div>
  );
}
