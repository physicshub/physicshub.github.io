// app/simulations/layout.tsx
// Rimuovi "use client", force-dynamic e ssr = false
export default function SimulationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
