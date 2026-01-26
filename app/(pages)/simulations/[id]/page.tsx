// app/(pages)/simulations/[id]/page.tsx
import chapters from "@/app/(core)/data/chapters";
import SimulationWrapper from "./_components/SimulationWrapper";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamicParams = false;

type Props = {
  params: Promise<{ id: string }>;
};

// Funzione helper per uniformare l'estrazione dell'ID
function getSimulationId(path: string): string {
  const parts = path.split("simulations/");
  return parts.length > 1 ? parts[1].split(/[?#]/)[0] : "";
}

export async function generateStaticParams() {
  return chapters.map((chapter) => ({
    // L'id generato deve essere identico a quello usato per la ricerca dopo
    id: getSimulationId(chapter.link),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // IMPORTANTE: Dobbiamo cercare il capitolo confrontando l'ID estratto dal link
  const chapter = chapters.find((c) => getSimulationId(c.link) === id);

  if (!chapter) return { title: "Not Found" };

  return {
    title: `PhysicsHub - ${chapter.name}`,
    description: chapter.desc,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const chapter = chapters.find((c) => getSimulationId(c.link) === id);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="simulation-page">
      <SimulationWrapper id={id} />
    </div>
  );
}
