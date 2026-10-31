import { Metadata } from "next";

const description =
  "Interactive physics theory: clear, visual guides to mechanics, waves, gravity and more — each paired with a hands-on PhysicsHub simulation.";

// `absolute` sets this index page's own <title>; `template` is what cascades to
// the /blog/[slug] articles (a plain-string title here would break that chain,
// leaving articles with no " | PhysicsHub" suffix). OG/Twitter titles keep the
// full brand inline — the template doesn't touch those.
export const metadata: Metadata = {
  title: {
    absolute: "Physics Blog – Interactive Theory & Visual Guides | PhysicsHub",
    template: "%s | PhysicsHub",
  },
  description,
  alternates: {
    canonical: "/blog",
    types: { "application/atom+xml": "/feed.xml" },
  },
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
