import { Metadata } from "next";

const description =
  "PhysicsHub is a free, open-source library of interactive physics simulations built by the community. Learn who makes it, why it exists, and how the physics engine works.";

export const metadata: Metadata = {
  title: "About PhysicsHub – Open-Source Interactive Physics",
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
