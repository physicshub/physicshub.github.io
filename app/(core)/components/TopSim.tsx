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

  const [fact, setFact] = useState<string | null>(null);

  function getPrevious() {
    if (idx === -1) return "/";
    return simulations[(idx - 1 + simulations.length) % simulations.length]
      .link;
  }

  function getNext() {
    if (idx === -1) return "/";
    return simulations[(idx + 1) % simulations.length].link;
  }

  function getCurrentName() {
    if (idx === -1) return "";
    return `${simulations[idx].id} - ${simulations[idx].name}`;
  }

  useEffect(() => {
    const funFacts = simulations[idx]?.funFacts ?? [];

    const timer = setTimeout(() => {
      if (funFacts.length === 0) {
        setFact(null);
        return;
      }

      const randomIndex = Math.floor(Math.random() * funFacts.length);
      setFact(funFacts[randomIndex]);
    }, 0);

    return () => clearTimeout(timer);
  }, [idx]);

  return (
    <div className="top-nav-sim">
      {!isMobile && (
        <div className="top-nav-sim-back-to-home-wrapper">
          <Back link="/simulations" />
        </div>
      )}

      <div className="top-nav-sim-inner">
        <Back
          link={getPrevious()}
          type="responsive"
          arrowPosition="left"
          content="Previous"
        />
        <h3>{getCurrentName()}</h3>
        <Back
          link={getNext()}
          type="responsive"
          arrowPosition="right"
          content="Next"
        />
      </div>

      {!isMobile && (
        <div className="fun-fact-slider-wrapper">
          <FunFactSlider fact={fact} />
        </div>
      )}
    </div>
  );
}
