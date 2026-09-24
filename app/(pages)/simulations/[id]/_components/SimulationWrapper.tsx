"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import useTranslation from "@/app/(core)/hooks/useTranslation";
import SimulationSkeleton, { type SkeletonField } from "./SimulationSkeleton";

type Props = {
  id: string;
  /** Server-rendered learning content, shown right under the stage. */
  overview?: ReactNode;
  /** Server-rendered recommended reading, closing the page. */
  related?: ReactNode;
  /** Shape of the parameters panel, so the skeleton reserves the right height. */
  fields?: SkeletonField[];
};

// One `dynamic()` component per simulation, created once. Calling `dynamic()`
// inside the component body would mint a new component type on every render;
// React would then unmount and remount the whole simulation each time
// `useTranslation` updates state, replaying the loading skeleton (and
// restarting p5) several times per page view.
const simulations = new Map<string, ComponentType>();

function getSimulation(id: string, fields: SkeletonField[]) {
  let Simulation = simulations.get(id);
  if (!Simulation) {
    Simulation = dynamic(() => import(`@/simulations/${id}`), {
      ssr: false,
      loading: () => <SimulationSkeleton fields={fields} />,
    }) as ComponentType;
    simulations.set(id, Simulation);
  }
  return Simulation;
}

export default function SimulationWrapper({
  id,
  overview,
  related,
  fields = [],
}: Props) {
  const { meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const Simulation = getSimulation(id, fields);

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <Simulation />
      {/* Slotted here, not passed into the client-only simulation: this way
          they are part of the server HTML, already occupying their space when
          the stage mounts above them, and crawlable without running p5. */}
      {overview}
      {related}
    </div>
  );
}
