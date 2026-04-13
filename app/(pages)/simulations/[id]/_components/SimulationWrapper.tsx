"use client";

import dynamic from "next/dynamic";
import useTranslation from "@/app/(core)/hooks/useTranslation";

type Props = {
  id: string;
};

export default function SimulationWrapper({ id }: Props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  // Ora siamo in un Client Component, quindi ssr: false è permesso
  const DynamicSimulation = dynamic(() => import(`@/simulations/${id}`), {
    ssr: false,
    loading: () => <p>{t("Loading simulation...")}</p>,
  });

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <DynamicSimulation />
    </div>
  );
}
