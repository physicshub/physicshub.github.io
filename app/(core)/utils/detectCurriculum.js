// Guess which school system a visitor follows, without asking for permission
// and without a network request: the site is a static export, and shipping the
// visitor's IP to a geolocation API just to pick a syllabus would be a bad
// trade. Two signals the browser already exposes are enough for the six
// supported countries.
//
//   1. Time zone (Intl) — where the device physically is. Distinctive for
//      India, Singapore, Italy, the UK and Australia; for the US we list the
//      US zone names, because `America/*` is shared with Canada and Latin
//      America.
//   2. Locale region — `navigator.languages`, e.g. en-AU or it-IT. Used only
//      when the time zone tells us nothing. A bare `it` counts as Italy; a
//      bare `en` says nothing, and `en-US` is ignored when the time zone is
//      known to be outside the US (it is usually just the browser default).
//
// The time zone wins when the two disagree (a browser defaulted to en-US on a
// laptop in Mumbai is the usual case). This is a default, never a verdict: the
// selector lets the reader override it, and the override sticks.

const TIME_ZONE_COUNTRY = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Singapore": "SG",
  "Europe/Rome": "IT",
  "Europe/London": "GB",
  "Europe/Belfast": "GB",
};

const US_TIME_ZONES = new Set([
  "America/New_York",
  "America/Detroit",
  "America/Chicago",
  "America/Menominee",
  "America/Denver",
  "America/Boise",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Juneau",
  "America/Sitka",
  "America/Nome",
  "America/Yakutat",
  "America/Metlakatla",
  "America/Adak",
  "Pacific/Honolulu",
]);

const US_ZONE_PREFIXES = [
  "America/Indiana/",
  "America/Kentucky/",
  "America/North_Dakota/",
  "US/",
];

const COUNTRY_CURRICULUM = {
  US: "us",
  GB: "uk",
  IN: "in",
  AU: "au",
  IT: "it",
  SG: "sg",
};

const countryFromTimeZone = (zone) => {
  if (!zone) return null;
  if (TIME_ZONE_COUNTRY[zone]) return TIME_ZONE_COUNTRY[zone];
  if (zone.startsWith("Australia/")) return "AU";
  if (US_TIME_ZONES.has(zone)) return "US";
  if (US_ZONE_PREFIXES.some((prefix) => zone.startsWith(prefix))) return "US";
  return null;
};

const countryFromLocale = (tag) => {
  if (!tag) return null;
  const [language, ...rest] = String(tag).split("-");
  const region = rest.find((part) => /^[A-Za-z]{2}$/.test(part));
  if (region) return region.toUpperCase();
  return language.toLowerCase() === "it" ? "IT" : null;
};

/**
 * @returns {string | null} a curriculum id (`us`, `uk`, `in`, `au`, `it`,
 *   `sg`), or null when nothing in the browser points at a supported country.
 */
export const detectCurriculum = () => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromZone = COUNTRY_CURRICULUM[countryFromTimeZone(zone)];
    if (fromZone) return fromZone;

    const tags = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];

    // Every US zone is listed above, so a known zone that is not one of them
    // means the device is outside the US: an `en-US` locale there is just the
    // browser default and must not pick the US syllabus. Without a zone at all
    // the locale is the only evidence we have.
    const countries = tags
      .map(countryFromLocale)
      .filter((country) => COUNTRY_CURRICULUM[country])
      .filter((country) => !(country === "US" && zone));
    return countries.length ? COUNTRY_CURRICULUM[countries[0]] : null;
  } catch {
    return null;
  }
};
