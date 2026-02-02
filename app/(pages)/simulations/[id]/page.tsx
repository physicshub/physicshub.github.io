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
  const chapter = chapters.find((c) => getSimulationId(c.link) === id);

  if (!chapter) return { title: "Simulation Not Found | PhysicsHub" };

  const title = `${chapter.name}: Interactive Physics Simulation | PhysicsHub`;

  const description = chapter.desc;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [chapter.icon],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [chapter.icon],
    },
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
