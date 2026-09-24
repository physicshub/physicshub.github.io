import Back from "./Back";
import simulations from "../data/chapters";
import { usePathname } from "next/navigation";
import useTranslation from "../hooks/useTranslation.ts";
import Funfact from "./Funfact.jsx";
import { useEffect, useState } from "react";

export default function TopSim() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const location = usePathname();
  const idx = simulations.findIndex((sim) => sim.link === location);
  const [show, setshow] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setshow(false);
    }, 5000);
  }, [simulations[idx].id]);

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
    return `${simulations[idx].id} - ${t(simulations[idx].name)}`;
  }

  return (
    <div className={`top-nav-sim ${isCompleted ? "notranslate" : ""}`}>
      <div className="top-nav-sim-back-to-home-wrapper">
        <Back link="/" />
      </div>
      <div className="top-nav-sim-inner">
        <Back
          link={getPrevious()}
          type="responsive"
          arrowPosition="left"
          content={t("Previous")}
        />
        <h3>{getCurrentName()}</h3>
        <Back
          link={getNext()}
          type="responsive"
          arrowPosition="right"
          content={t("Next")}
        />
      </div>
      {idx !== -1 && (
        <div className={`top-nav-sim-filler ${show ? "show" : "hide"}`}>
          <Funfact chapterId={simulations[idx].id} setshow={setshow} />
        </div>
      )}
    </div>
  );
}
