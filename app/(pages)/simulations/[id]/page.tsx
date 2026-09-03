// app/(pages)/simulations/[id]/page.tsx
import chapters from "@/app/(core)/data/chapters";
import SimulationWrapper from "./_components/SimulationWrapper";
import SimulationOverview from "./_components/SimulationOverview";
import { LEVELS, DIFFICULTIES, COLORS } from "@/app/(core)/data/tags";
import { blogsArray } from "@/app/(core)/data/articles/index.js";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

export const dynamicParams = false;

const SITE_URL = "https://physicshub.github.io";

type Props = {
  params: Promise<{ id: string }>;
};

// Funzione helper per uniformare l'estrazione dell'ID
function getSimulationId(path: string): string {
  const parts = path.split("simulations/");
  return parts.length > 1 ? parts[1].split(/[?#]/)[0] : "";
}

// `/simulations/test` is a browser benchmark, not a learning page — keep it out
// of the index.
const isIndexable = (chapter: { level?: string; link: string }) =>
  chapter.level !== "tool" && getSimulationId(chapter.link) !== "test";

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
  const canonical = `/simulations/${id}`;

  return {
    title: title,
    description: description,
    alternates: { canonical },
    robots: isIndexable(chapter)
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${canonical}`,
      title: title,
      description: description,
      images: [chapter.thumbnail],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [chapter.thumbnail],
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

  const canonical = `${SITE_URL}/simulations/${id}`;
  const relatedBlog = chapter.relatedBlogSlug
    ? blogsArray.find(
        (b: { slug: string }) => b.slug === chapter.relatedBlogSlug
      )
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${canonical}#resource`,
        name: chapter.name,
        description: chapter.desc,
        url: canonical,
        learningResourceType: "simulation",
        interactivityType: "active",
        isAccessibleForFree: true,
        inLanguage: "en",
        ...(level?.name ? { educationalLevel: level.name } : {}),
        ...(chapter.tags?.length
          ? { about: chapter.tags.map((t: { name: string }) => t.name) }
          : {}),
        publisher: { "@id": `${SITE_URL}/#organization` },
        ...(relatedBlog
          ? {
              isBasedOn: `${SITE_URL}/blog/${relatedBlog.slug}`,
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Simulations",
            item: `${SITE_URL}/simulations`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: chapter.name,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <div className="simulation-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="simulation-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/simulations">Simulations</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{chapter.name}</span>
      </nav>

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

      <SimulationOverview id={id} chapter={chapter} />
    </div>
  );
}
