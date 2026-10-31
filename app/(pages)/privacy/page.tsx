// app/(pages)/privacy/page.tsx
//
// The privacy policy. A server component: static text, in the server HTML,
// readable without JavaScript. Keep it in step with what the site actually
// does — when a feature starts sending data somewhere new (a new analytics
// tool, a new sign-in provider, a new email sender), add it to "Who else
// processes data" in the same change, and bump LAST_UPDATED.

import type { Metadata } from "next";
import Link from "next/link";

const LAST_UPDATED = "25 September 2026";
const CONTACT = "mattqdevv@gmail.com";

const description =
  "What PhysicsHub collects, why, who processes it, how long it is kept, and how to download or delete your data. Written for students, parents and teachers.";

export const metadata: Metadata = {
  // Root layout's `title.template` appends " | PhysicsHub".
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "https://physicshub.github.io/privacy",
    title: "Privacy Policy | PhysicsHub",
    description,
  },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-page__head">
        <h1>Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: {LAST_UPDATED}</p>
        <p className="legal-page__lead">
          PhysicsHub is a free, open-source physics learning site used by
          students, many of them under 18. We collect as little as we can, never
          sell anything, and show no ads. This page explains exactly what
          happens to your data, in plain language.
        </p>
      </header>

      <section>
        <h2>1. Who is responsible</h2>
        <p>
          PhysicsHub is an open-source project run by its maintainer (the data
          controller). For anything about privacy or your data, write to{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We aim to answer within
          30 days.
        </p>
      </section>

      <section>
        <h2>2. Using the site without an account</h2>
        <p>
          Every simulation and article works without an account. If you never
          sign in, we do not know who you are. What still happens:
        </p>
        <ul>
          <li>
            <strong>Settings stored in your browser.</strong> Your theme,
            language, school curriculum and saved simulation parameters are kept
            in your browser&apos;s local storage. They never leave your device
            unless you sign in and press Save (see below). Your curriculum is
            guessed from your browser&apos;s time zone and language, on your
            device — no location lookup is made.
          </li>
          <li>
            <strong>Usage statistics.</strong> We use Google Analytics and
            Microsoft Clarity to understand which pages are used and where the
            site is confusing or broken. They record pages visited, clicks,
            scrolling, device and browser type and an approximate location
            derived from your IP address, and use cookies to recognise a
            returning browser. Clarity can replay how a page was used; fields
            with personal data (your email, nickname and account page) are
            masked so they are never recorded.
          </li>
          <li>
            <strong>Feedback.</strong> If you use &quot;Leave feedback&quot;,
            your rating, your comment, the page you were on and your device type
            are posted to the maintainers&apos; Discord server. Don&apos;t put
            personal information in the comment.
          </li>
          <li>
            <strong>Translation.</strong> Languages without a finished
            translation use the Google Translate widget, which sends the page
            text to Google and sets a <code>googtrans</code> cookie with the
            chosen language.
          </li>
          <li>
            <strong>Hosting.</strong> Like any website, the servers that deliver
            the pages (GitHub Pages, and Vercel for some features) receive your
            IP address and browser details to do so, and may keep them in
            short-lived security logs. Your browser also asks GitHub for the
            project&apos;s star and contributor counts.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. If you create an account</h2>
        <p>
          An account is optional. It only adds publishing community presets,
          liking presets and syncing your saved parameters across devices. We
          store:
        </p>
        <ul>
          <li>
            <strong>Your email address</strong>, or the GitHub account you sign
            in with — only to sign you in. There are no passwords. It is never
            shown to other users, sold, or used for marketing or newsletters.
            With GitHub sign-in we receive your public GitHub profile (username,
            name, avatar, email) from GitHub; we use only the username, as your
            default nickname.
          </li>
          <li>
            <strong>A public nickname</strong>, which you can change on your{" "}
            <Link href="/account">account page</Link>. Please don&apos;t use
            your full real name.
          </li>
          <li>
            <strong>What you publish</strong>: preset titles, descriptions and
            simulation parameters. These are public, with your nickname.
          </li>
          <li>
            <strong>Private activity</strong>: your likes, the presets you
            report and your saved simulation parameters. Only you can see them.
          </li>
          <li>
            <strong>Technical data</strong> the sign-in service keeps to protect
            accounts: sign-in times and the IP address of recent sign-ins, and
            anonymous counters that stop anyone from sending too many requests.
          </li>
        </ul>
        <p>
          Your session is kept in your browser&apos;s local storage (not an
          advertising cookie) until you sign out.
        </p>
      </section>

      <section>
        <h2>4. Why we process it (legal basis)</h2>
        <ul>
          <li>
            <strong>Running the account you asked for</strong> (sign-in,
            publishing, likes, syncing): performance of the service you
            requested — GDPR Art. 6(1)(b).
          </li>
          <li>
            <strong>Keeping the site safe</strong> (rate limits, reports, hiding
            abusive content, security logs): our legitimate interest in
            protecting users — Art. 6(1)(f).
          </li>
          <li>
            <strong>Usage statistics</strong> (Google Analytics, Microsoft
            Clarity): your consent where the law requires it — Art. 6(1)(a). You
            can refuse or withdraw it at any time without losing access to
            anything.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Children</h2>
        <p>
          PhysicsHub is built for school use and needs no account at all. If you
          are under 16 (or under the age of digital consent in your country,
          which is between 13 and 16 in the EU and 13 in the United States),
          please ask a parent, guardian or teacher before creating an account —
          where the law requires it, they must give consent for you. We
          don&apos;t knowingly create accounts for children under 13. If you are
          a parent and believe your child has an account without your consent,
          write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will
          delete it.
        </p>
      </section>

      <section>
        <h2>6. Who else processes data</h2>
        <p>
          We use these providers to run the site. Each processes data only for
          the purpose listed, under its own data protection terms:
        </p>
        <div className="legal-page__table">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Used for</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase</td>
                <td>Accounts and the community database</td>
                <td>Account and community data (section 3)</td>
              </tr>
              <tr>
                <td>GitHub (Microsoft)</td>
                <td>Hosting (GitHub Pages), GitHub sign-in, star counts</td>
                <td>
                  IP address, browser details; your GitHub profile if you sign
                  in with it
                </td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Hosting for the blog editor</td>
                <td>IP address, browser details</td>
              </tr>
              <tr>
                <td>Google</td>
                <td>Google Analytics, Google Translate widget</td>
                <td>Usage data, page text, cookies</td>
              </tr>
              <tr>
                <td>Microsoft</td>
                <td>Microsoft Clarity</td>
                <td>Usage data, masked session recordings, cookies</td>
              </tr>
              <tr>
                <td>Discord</td>
                <td>Receiving feedback</td>
                <td>Your rating, comment, page and device type</td>
              </tr>
              <tr>
                <td>Email delivery service</td>
                <td>Sending sign-in links</td>
                <td>Your email address</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Some of these providers are based in the United States, so data may be
          transferred outside the European Union. Where that happens it is
          covered by the EU–US Data Privacy Framework or by the European
          Commission&apos;s Standard Contractual Clauses.
        </p>
      </section>

      <section>
        <h2>7. How long we keep it</h2>
        <ul>
          <li>
            Account data and everything you published: until you delete it or
            delete your account. Deleting your account removes your profile,
            presets, likes, reports and saved parameters immediately.
          </li>
          <li>
            Presets hidden after reports: until a maintainer reviews them, then
            restored or deleted.
          </li>
          <li>
            Sign-in and security logs at our providers: for the short period
            they keep them (typically days to a few weeks).
          </li>
          <li>
            Usage statistics: Google Analytics keeps them for up to 14 months,
            Microsoft Clarity for up to 13 months (recordings for up to 30
            days).
          </li>
          <li>Feedback messages: until the maintainers delete them.</li>
        </ul>
      </section>

      <section>
        <h2>8. Your rights</h2>
        <p>
          You can, at any time and free of charge: see the data we hold about
          you, correct it, download it, object to its use, restrict it, and
          delete it. Most of this is self-service on your{" "}
          <Link href="/account">account page</Link>:{" "}
          <strong>Download my data</strong> gives you everything in one file,
          and <strong>Delete my account</strong> erases it. For anything else,
          write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. If you think we
          have not handled your data properly, you can also complain to your
          national data protection authority (in Italy, the Garante per la
          protezione dei dati personali).
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          Connections are encrypted (HTTPS). There are no passwords to leak.
          Access rules are enforced in the database itself, so one user can
          never read another user&apos;s private data, and every kind of write
          is rate-limited. The code is open source, so anyone can check how it
          works.
        </p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p>
          When this policy changes, we update the date at the top. Significant
          changes are also announced in the project&apos;s release notes on
          GitHub.
        </p>
      </section>
    </main>
  );
}
