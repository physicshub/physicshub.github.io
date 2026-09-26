import { Metadata } from "next";

const description =
  "PhysicsHub is a free, open-source library of interactive physics simulations built by the community. Learn who makes it, why it exists, and how the physics engine works.";

// The root layout's `title.template` appends " | PhysicsHub"; keep the brand out
// of this `title` to avoid "… PhysicsHub | PhysicsHub". OG/Twitter titles below
// are not templated, so they keep the standalone form.
export const metadata: Metadata = {
  title: "About – Open-Source Interactive Physics, Built by the Community",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/about",
    title: "About PhysicsHub – Open-Source Interactive Physics",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "About PhysicsHub – Open-Source Interactive Physics",
    description,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
