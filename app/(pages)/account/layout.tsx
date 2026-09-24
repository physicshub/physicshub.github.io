import { Metadata } from "next";

// A personal app screen, not a search landing page.
export const metadata: Metadata = {
  // Root layout's `title.template` appends " | PhysicsHub".
  title: "Your account",
  robots: { index: false, follow: true },
  alternates: { canonical: "/account" },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
