import Back from "./Back";
import simulations from "../data/chapters";
import { useLocation } from "react-router-dom";

export default function TopSim() {
  const location = useLocation();
  const idx = simulations.findIndex(sim => sim.link === location.pathname);


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
      <div className="top-nav-sim-back-to-home-wrapper">
        <Back link="/" />
      </div>
      <div className="top-nav-sim-inner">
        <Back link={getPrevious()} type="full" arrowPosition="left" content="Previous" />
        <h3>{getCurrentName()}</h3>
        <Back link={getNext()} type="full" arrowPosition="right" content="Next" />
      </div>
      <div className="top-nav-sim-filler"/>
    </div>
  );
}
