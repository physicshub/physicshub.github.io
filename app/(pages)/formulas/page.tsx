// /formulas — the Formulary. A server page: it works out where each formula is
// used (which needs every article, so it must not ship to the browser), emits
// the DefinedTermSet JSON-LD, and hands the client Formulary plain data. The
// cards themselves come from the registry the client imports directly, since
// their calculators are functions.
import type { Metadata } from "next";
import chapters from "@/app/(core)/data/chapters.js";
import simulationOverviews from "@/app/(core)/data/simulationOverviews.js";
import { blogsArray } from "@/app/(core)/data/articles/index.js";
import {
  formulas,
  plainText,
  FORMULARY_PATH,
} from "@/app/(core)/data/formulas/index.js";
import { buildFormulaUsage } from "@/app/(core)/utils/formulaUsage.js";
import {
  SITE_URL,
  SITE_NAME,
  ORG_ID,
  WEBSITE_ID,
} from "@/app/(core)/constants/site.js";
import Formulary from "./_components/Formulary";

const title = "Physics Formulary – Every Formula, Explained";
const description =
  "A free physics formula sheet with an identity card for every formula: what each symbol means, its units, when it holds, a calculator, and the simulations and articles that use it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: FORMULARY_PATH },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${FORMULARY_PATH}`,
    title: `${title} | ${SITE_NAME}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description,
  },
};

export default function FormulasPage() {
  const usage = buildFormulaUsage({
    chapters,
    overviews: simulationOverviews,
    articles: blogsArray,
  });

  const url = `${SITE_URL}${FORMULARY_PATH}`;
  const setId = `${url}#formulary`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": setId,
    name: `${SITE_NAME} Physics Formulary`,
    description,
    url,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    hasDefinedTerm: formulas.map((f) => ({
      "@type": "DefinedTerm",
      "@id": `${url}#${f.id}`,
      url: `${url}#${f.id}`,
      name: f.name,
      alternateName: f.aka?.length ? f.aka : undefined,
      termCode: f.latex,
      description: plainText(f.summary),
      inDefinedTermSet: { "@id": setId },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Formulary usage={usage} />
    </>
  );
}
