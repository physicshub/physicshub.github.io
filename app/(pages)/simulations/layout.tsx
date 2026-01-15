// app/simulations/layout.tsx
"use client";

export const dynamic = "force-dynamic";
export const ssr = false;

export default function SimulationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
