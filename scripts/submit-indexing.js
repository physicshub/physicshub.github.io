// submit-indexing.js
//
// Push already-live URLs to Google's Web Search Indexing API so Google
// re-crawls them sooner than it would from the sitemap alone.
//
//   POST https://indexing.googleapis.com/v3/urlNotifications:publish
//   { "url": "...", "type": "URL_UPDATED" }
//
// Auth is a service-account JWT (RS256) exchanged for an OAuth token — no SDK,
// just node:crypto + global fetch (Node >= 18). The service account must be a
// *verified owner* of the Search Console property (Settings -> Users and
// permissions -> Owner), otherwise every publish returns 403.
//
// Caveat: Google officially scopes this API to JobPosting / BroadcastEvent
// pages. It works for ordinary pages in practice and carries no documented
// penalty for non-abusive use, but Google may choose to ignore the ping.
//
// Credentials are resolved in this order:
//   1. GOOGLE_INDEXING_CREDENTIALS  — raw JSON string (used by CI)
//   2. INDEXING_KEY_FILE            — path to a JSON key file
//   3. the single *.json file in .secrets/  (local dev default)
//
// URLs are read from the sitemap (--sitemap <url|path>, default is the live
// sitemap) unless explicit URLs are passed as positional args.
//
// Usage:
//   npm run submit:indexing                 # all sitemap URLs, type URL_UPDATED
//   npm run submit:indexing -- --dry-run    # resolve + list, no API calls
//   npm run submit:indexing -- https://physicshub.github.io/simulations/BallGravity
//   node scripts/submit-indexing.js --type URL_DELETED https://.../old-page

import crypto from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, isAbsolute } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..");
const DEFAULT_SITEMAP = "https://physicshub.github.io/sitemap.xml";
const PUBLISH_ENDPOINT =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";
const SCOPE = "https://www.googleapis.com/auth/indexing";
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 3;

// ──────────────── args ────────────────

function parseArgs(argv) {
  const opts = { type: "URL_UPDATED", dryRun: false, sitemap: null, urls: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--type") opts.type = argv[++i];
    else if (a.startsWith("--type=")) opts.type = a.slice(7);
    else if (a === "--sitemap") opts.sitemap = argv[++i];
    else if (a.startsWith("--sitemap=")) opts.sitemap = a.slice(10);
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a.startsWith("--")) fail(`unknown flag: ${a}`);
    else opts.urls.push(a);
  }
  if (!["URL_UPDATED", "URL_DELETED"].includes(opts.type))
    fail(`--type must be URL_UPDATED or URL_DELETED (got ${opts.type})`);
  return opts;
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

// ──────────────── credentials ────────────────

function loadCredentials() {
  const raw = process.env.GOOGLE_INDEXING_CREDENTIALS;
  if (raw)
    return { creds: JSON.parse(raw), from: "GOOGLE_INDEXING_CREDENTIALS" };

  const explicit = process.env.INDEXING_KEY_FILE;
  if (explicit) {
    const p = isAbsolute(explicit) ? explicit : join(REPO_ROOT, explicit);
    return { creds: JSON.parse(readFileSync(p, "utf8")), from: p };
  }

  const secretsDir = join(REPO_ROOT, ".secrets");
  if (existsSync(secretsDir)) {
    const jsons = readdirSync(secretsDir).filter((f) => f.endsWith(".json"));
    if (jsons.length === 1) {
      const p = join(secretsDir, jsons[0]);
      return { creds: JSON.parse(readFileSync(p, "utf8")), from: p };
    }
    if (jsons.length > 1)
      fail(
        `.secrets/ has ${jsons.length} .json files — set INDEXING_KEY_FILE to pick one`
      );
  }

  fail(
    "no credentials: set GOOGLE_INDEXING_CREDENTIALS, or INDEXING_KEY_FILE, or drop the key in .secrets/"
  );
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken(creds) {
  if (!creds.client_email || !creds.private_key)
    fail("credentials missing client_email / private_key");

  const now = Math.floor(Date.now() / 1000);
  const tokenUri = creds.token_uri || "https://oauth2.googleapis.com/token";
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: creds.client_email,
    scope: SCOPE,
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(claim)
  )}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signingInput)
    .sign(creds.private_key, "base64url");
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    fail(
      `token exchange failed (${res.status}): ${body.error_description || body.error || JSON.stringify(body)}`
    );
  return body.access_token;
}

// ──────────────── url source ────────────────

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

async function resolveUrls(opts) {
  if (opts.urls.length) return opts.urls;

  const src = opts.sitemap || DEFAULT_SITEMAP;
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src, {
      headers: { "User-Agent": "physicshub-indexing-script" },
    });
    if (!res.ok) fail(`could not fetch sitemap ${src} (${res.status})`);
    return extractLocs(await res.text());
  }
  const p = isAbsolute(src) ? src : join(REPO_ROOT, src);
  if (!existsSync(p)) fail(`sitemap not found: ${p}`);
  return extractLocs(readFileSync(p, "utf8"));
}

// ──────────────── publish ────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function publishOne(url, type, token) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    try {
      res = await fetch(PUBLISH_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, type }),
      });
    } catch (e) {
      if (attempt === MAX_ATTEMPTS) return { url, ok: false, error: e.message };
      await sleep(500 * attempt);
      continue;
    }

    if (res.ok) return { url, ok: true };

    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.message || `HTTP ${res.status}`;

    // 429 / 5xx are worth retrying; 403 / 400 are not.
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_ATTEMPTS) {
      await sleep(1000 * attempt);
      continue;
    }
    return { url, ok: false, status: res.status, error: reason };
  }
}

async function runPool(items, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from(
    { length: Math.min(CONCURRENCY, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await worker(items[idx]);
      }
    }
  );
  await Promise.all(runners);
  return results;
}

// ──────────────── main ────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      readFileSync(new URL(import.meta.url))
        .toString()
        .split("\n")
        .slice(1, 34)
        .join("\n")
        .replace(/^\/\/ ?/gm, "")
    );
    return;
  }

  const { creds, from } = loadCredentials();
  const urls = await resolveUrls(opts);
  if (!urls.length) fail("no URLs to submit");

  console.log(`• credentials: ${from}`);
  console.log(`• service account: ${creds.client_email}`);
  console.log(`• type: ${opts.type}`);
  console.log(`• URLs: ${urls.length}`);

  if (opts.dryRun) {
    console.log("\n[dry run] would submit:");
    for (const u of urls) console.log(`  ${u}`);
    return;
  }

  const token = await getAccessToken(creds);
  console.log("• access token acquired\n");

  const results = await runPool(urls, (u) => publishOne(u, opts.type, token));

  const ok = results.filter((r) => r.ok);
  const bad = results.filter((r) => !r.ok);

  for (const r of ok) console.log(`  ✓ ${r.url}`);
  for (const r of bad)
    console.log(`  ✖ ${r.url}  — ${r.status ? r.status + " " : ""}${r.error}`);

  console.log(`\n${ok.length}/${results.length} submitted.`);

  if (bad.some((r) => r.status === 403)) {
    console.log(
      "\n403 = the service account is not a verified *Owner* of the Search Console\n" +
        "property. Search Console -> Settings -> Users and permissions -> add\n" +
        `${creds.client_email} with the Owner role, then re-run.`
    );
  }

  process.exit(bad.length ? 1 : 0);
}

main().catch((e) => fail(e.stack || e.message));
