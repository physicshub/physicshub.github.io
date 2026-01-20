import Back from "./Back";
import simulations from "../data/chapters";
import { usePathname } from "next/navigation";
import { useIsMobile } from "../hooks/useMobile";

export default function TopSim() {
  const location = usePathname();
  const idx = simulations.findIndex((sim) => sim.link === location);
  const isMobile = useIsMobile();

  function getPrevious() {
    if (idx === -1) return "/";
    const prevIndex = (idx - 1 + simulations.length) % simulations.length;
    return simulations[prevIndex].link;
  }

  function getNext() {
    if (idx === -1) return "/";
    const nextIndex = (idx + 1) % simulations.length;
    return simulations[nextIndex].link;
  }

  function getCurrentName() {
    if (idx === -1) return "";
    return `${simulations[idx].id} - ${simulations[idx].name}`;
  }

  return (
    <div className="top-nav-sim">
      {!isMobile && (
        <div className="top-nav-sim-back-to-home-wrapper">
          <Back link="/simulations" />
        </div>
      )}
      <div
        className="top-nav-sim-inner"
        style={{ maxWidth: isMobile ? "100%" : "80%" }}
      >
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
      {!isMobile && <div className="top-nav-sim-filler" />}
    </div>
  );
}
