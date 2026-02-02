"use client";

import dynamic from "next/dynamic";

type Props = {
  id: string;
};

export default function SimulationWrapper({ id }: Props) {
  // Ora siamo in un Client Component, quindi ssr: false è permesso
  const DynamicSimulation = dynamic(() => import(`@/simulations/${id}`), {
    ssr: false,
    loading: () => <p>Loading simulation...</p>,
  });

  return <DynamicSimulation />;
}
