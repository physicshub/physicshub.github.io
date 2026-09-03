"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import useTranslation from "@/app/(core)/hooks/useTranslation";

type Props = {
  id: string;
  /** Server-rendered learning content, slotted below the canvas by the layout. */
  overview?: ReactNode;
};

export default function SimulationWrapper({ id, overview }: Props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  // Ora siamo in un Client Component, quindi ssr: false è permesso
  const DynamicSimulation = dynamic(() => import(`@/simulations/${id}`), {
    ssr: false,
    loading: () => <p>{t("Loading simulation...")}</p>,
  });

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <DynamicSimulation overview={overview} />
    </div>
  );
}
