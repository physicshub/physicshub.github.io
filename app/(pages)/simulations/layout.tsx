// app/(pages)/simulations/layout.tsx
import { Metadata } from "next";

const description =
  "A free online physics lab: run real-time, interactive simulations of pendulums, projectiles, springs, gravity, collisions and more. Adjust the variables and watch the maths respond.";

// Applies to the /simulations index. Each /simulations/[id] page overrides
// title, description, canonical and robots in its own generateMetadata.
// `absolute` sets this index page's own <title>; `template` is what cascades to
// the /simulations/[id] pages (a plain-string title here would break that chain).
// OG/Twitter titles keep the full brand inline — the template doesn't touch those.
export const metadata: Metadata = {
  title: {
    absolute: "Interactive Physics Simulations – Free Online Lab | PhysicsHub",
    template: "%s | PhysicsHub",
  },
  description,
  alternates: { canonical: "/simulations" },
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/simulations",
    title: "Interactive Physics Simulations – Free Online Lab | PhysicsHub",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Physics Simulations – Free Online Lab | PhysicsHub",
    description,
  },
};

export default function SimulationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
