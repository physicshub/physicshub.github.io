import { Metadata } from "next";

const description =
  "Help build PhysicsHub. Add a simulation, write theory, translate the site or fix a bug — a step-by-step guide to contributing to this open-source physics project.";

// The root layout's `title.template` appends " | PhysicsHub"; keep the brand out
// of this `title`. OG/Twitter titles below are not templated.
export const metadata: Metadata = {
  title: "How to Contribute – Add Simulations & Theory",
  description,
  alternates: { canonical: "/contribute" },
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/contribute",
    title: "Contribute to PhysicsHub – Add Simulations & Theory",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribute to PhysicsHub – Add Simulations & Theory",
    description,
  },
};

export default function ContributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
