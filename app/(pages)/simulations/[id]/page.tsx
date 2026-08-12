// app/(pages)/simulations/[id]/page.tsx
import chapters from "@/app/(core)/data/chapters";
import SimulationWrapper from "./_components/SimulationWrapper";
import { LEVELS, DIFFICULTIES, COLORS } from "@/app/(core)/data/tags";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import type { CSSProperties } from "react";

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

  const level = LEVELS[chapter.level as keyof typeof LEVELS];
  const levelLabel = level ? `${level.name} (${level.age})` : "";
  const title = `${chapter.name}: ${
    levelLabel ? `${levelLabel} · ` : ""
  }Interactive Physics Simulation | PhysicsHub`;
  const description = chapter.desc;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [chapter.thumbnail], // 👈 Changed from chapter.icon to chapter.thumbnail
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [chapter.thumbnail], // 👈 Changed from chapter.icon to chapter.thumbnail
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const chapter = chapters.find((c) => getSimulationId(c.link) === id);

  if (!chapter) {
    notFound();
  }

  const level = LEVELS[chapter.level as keyof typeof LEVELS];
  const difficulty =
    DIFFICULTIES[chapter.difficulty as keyof typeof DIFFICULTIES];

  return (
    <div className="simulation-page">
      {level && (
        <div
          className="simulation-level-banner"
          style={
            {
              "--level-accent":
                COLORS[level.color as keyof typeof COLORS]?.primary ||
                "#00e6e6",
            } as CSSProperties
          }
        >
          <span className="simulation-level-banner-name">
            {level.name} · {level.age}
          </span>
          <span className="simulation-level-banner-equiv">
            {level.equivalents.join(" · ")}
          </span>
          {difficulty && (
            <span className="simulation-level-banner-difficulty">
              {difficulty.name}
            </span>
          )}
        </div>
      )}
      <SimulationWrapper id={id} />
    </div>
  );
}
