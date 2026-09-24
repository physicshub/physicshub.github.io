import "./(core)/styles/index.css";
import "katex/dist/katex.min.css";
import Script from "next/script";
import Layout from "./(core)/components/Layout.jsx";
import { Metadata } from "next";
import { FeedbackProvider } from "./(core)/context/FeedbackProvider.tsx";
import { SITE_URL, SITE_NAME } from "./(core)/constants/site.js";

const SITE_DESCRIPTION =
  "Explore interactive physics simulations online. Try physical phenomena, visualize complex concepts with PhysicsHub's free educational tools for students and coders.";

const OG_IMAGE = {
  url: "/Thumbnail.jpg",
  width: 1200,
  height: 800,
  alt: "PhysicsHub – interactive physics simulations",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `default` is used on the home page; `template` appends " | PhysicsHub" to
  // every child route's own title. Child routes must NOT re-add that suffix.
  title: {
    default: "PhysicsHub – Interactive Physics Simulations Online",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "physics",
    "science",
    "education",
    "portal",
    "learning",
    "research",
    "simulations",
    "free",
  ],
  authors: [{ name: "mattqdev" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/",
    title: "PhysicsHub – Interactive Physics Simulations Online",
    siteName: "PhysicsHub",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://physicshub.github.io/",
    title: "PhysicsHub – Interactive Physics Simulations Online",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/Logo.ico", type: "image/x-icon" },
      { url: "/Logo.png", type: "image/png" },
    ],
    apple: "/Logo.png",
  },
  verification: {
    google: [
      "mZD-GZIQxWFBVVNpzrQ_V1Vmf8do93uwLkKfn10dJrA",
      "kkjcQbru_GaoTFpR7cIshWnCbYCi4Xl0lAaclaF_Fy0",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://physicshub.github.io/#organization",
        name: "PhysicsHub",
        url: "https://physicshub.github.io/",
        logo: {
          "@type": "ImageObject",
          url: "https://physicshub.github.io/Logo.png",
        },
        description:
          "A free, open-source library of interactive physics simulations and written theory for students, teachers and developers.",
        sameAs: ["https://github.com/physicshub/physicshub.github.io"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/simulations?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {/* Theme + embed-mode initialization — runs inline before paint to
              avoid flash. `?embed=1` hides the site chrome (simulation.css). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function() {
                  try {
                    if (new URLSearchParams(location.search).get('embed') === '1') {
                      document.body.dataset.embed = '1';
                    }
                  } catch(e) {}
                  try {
                    const key = 'physicshub-theme';
                    const saved = localStorage.getItem(key);
                    const theme = saved && ['light','dark'].includes(saved) ? saved : 'dark';
                    document.body.dataset.theme = theme;
                    if (theme === 'light') {
                      document.body.style.backgroundColor = '#ffffff';
                    }
                  } catch(e) {}
                })();
              `,
          }}
        />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xpg8g0yoq0");
            `}
        </Script>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ELZTKTE86N"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-ELZTKTE86N');
            `}
        </Script>

        {/* Inside <body>, not around <html>: React owns <html>/<body> as
            singletons, and a portal committed from a component outside them
            (the feedback Popup) is swept out of <body> on first open. */}
        <FeedbackProvider>
          <Layout showStars={true} showGradient={true}>
            {children}
          </Layout>
        </FeedbackProvider>
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: "#ffffff",
};
