import Blogs from "../../../(core)/data/blogs.js";
import { notFound } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx";

/**
 * 1. Obbligatorio per output: export
 */
export async function generateStaticParams() {
  return Blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

/**
 * 2. Genera Metadati (Fix Next.js 15: await params)
 */
export async function generateMetadata({ params }) {
  // UNWRAP della Promise params
  const { slug } = await params;

  const blog = Blogs.find((b) => b.slug === slug);

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.name,
    description: blog.desc,
  };
}

/**
 * 3. Componente Pagina (Fix Next.js 15: await params)
 */
export default async function BlogPost({ params }) {
  // UNWRAP della Promise params
  const { slug } = await params;

  const blog = Blogs.find((b) => b.slug === slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="blog-container">
      <h1 className="text-3xl font-bold">{blog.name}</h1>
      <p className="blog-description my-4 italic text-gray-600">{blog.desc}</p>

      <div className="mt-8">
        {blog.theory && <TheoryRenderer theory={blog.theory} />}
      </div>
    </div>
  );
}
