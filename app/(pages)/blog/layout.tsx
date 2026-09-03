import { Metadata } from "next";

const description =
  "Interactive physics theory: clear, visual guides to mechanics, waves, gravity and more — each paired with a hands-on PhysicsHub simulation.";

export const metadata: Metadata = {
  title: "Physics Blog – Interactive Theory & Visual Guides | PhysicsHub",
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/blog",
    title: "Physics Blog – Interactive Theory & Visual Guides | PhysicsHub",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Physics Blog – Interactive Theory & Visual Guides | PhysicsHub",
    description,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
