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
  description: "Explore interactive physics simulations online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          {/* ✅ THEME FIX (CORRECT WAY) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const key = 'physicshub-theme';
                    const saved = localStorage.getItem(key);
                    const theme = saved && ['light','dark'].includes(saved) ? saved : 'dark';
                    document.body.dataset.theme = theme;
                  } catch(e){}
                })();
              `,
            }}
          />

          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

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
