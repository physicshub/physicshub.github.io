import { Metadata } from "next";

// The blog editor is an authenticated app screen, not a search landing page.
export const metadata: Metadata = {
  title: "New Blog Post | PhysicsHub",
  robots: { index: false, follow: true },
  alternates: { canonical: "/blog/create" },
};

export default function CreateBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
