import "./(core)/styles/index.css";
import "./(core)/styles/theory.css";
import "./(core)/styles/landing.css";
import "katex/dist/katex.min.css";
import Script from "next/script";
import Layout from "./(core)/components/Layout.jsx";
import { Metadata } from "next";
import { FeedbackProvider } from "./(core)/context/FeedbackProvider.tsx";

export const metadata: Metadata = {
  metadataBase: new URL("https://physicshub.github.io"),
  title: "PhysicsHub – Interactive Physics Simulations Online",
  description:
    "Explore interactive physics simulations online. Try physical phenomena, visualize complex concepts with PhysicsHub's free educational tools for students and coders.",
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
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/",
    title: "Physics Portal – Interactive Physics Simulations Online",
    siteName: "PhysicsHub",
    description:
      "Explore interactive physics simulations online. Try physical phenomena, visualize complex concepts with PhysicsHub's free educational tools for students and coders.",
    images: ["/Thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://physicshub.github.io/",
    title: "Physics Portal – Interactive Physics Simulations Online",
    description:
      "Explore interactive physics simulations online. Try physical phenomena, visualize complex concepts with PhysicsHub's free educational tools for students and coders.",
    images: ["/Thumbnail.png"],
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
    "@type": "WebSite",
    name: "PhysicsHub",
    url: "https://physicshub.github.io/",
  };

  return (
    <FeedbackProvider>
      <html lang="en" dir="ltr">
        <body suppressHydrationWarning>
          {/* Theme initialization — runs inline before paint to avoid flash */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
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

          <Layout showStars={true} showGradient={true}>
            {children}
          </Layout>
        </body>
      </html>
    </FeedbackProvider>
  );
}

export const viewport = {
  themeColor: "#ffffff",
};
