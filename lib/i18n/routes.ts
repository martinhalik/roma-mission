import { LOCALES, type Locale } from "./locales";

export type RouteKey =
  | "home"
  | "mission"
  | "ourStory"
  | "locations"
  | "stories"
  | "media"
  | "heritage"
  | "activity"
  | "getInvolved"
  | "thankYou"
  | "privacy"
  | "terms"
  | "book";

export const ROUTE_KEYS: readonly RouteKey[] = [
  "home",
  "mission",
  "ourStory",
  "locations",
  "stories",
  "media",
  "heritage",
  "activity",
  "getInvolved",
  "thankYou",
  "privacy",
  "terms",
  "book",
] as const;

export const ROUTE_SLUGS: Record<Locale, Record<RouteKey, string>> = {
  en: { home: "", mission: "mission",     ourStory: "our-story",          locations: "locations",   stories: "stories",  media: "media",   heritage: "heritage",       activity: "live",         getInvolved: "get-involved",  thankYou: "thank-you",   privacy: "privacy-policy",    terms: "terms-of-use", book: "book" },
  sk: { home: "", mission: "misia",       ourStory: "nas-pribeh",         locations: "lokality",    stories: "pribehy",  media: "media",   heritage: "dedicstvo",      activity: "nazivo",       getInvolved: "zapojte-sa",    thankYou: "dakujeme",    privacy: "ochrana-udajov",    terms: "podmienky", book: "kniha" },
  cs: { home: "", mission: "mise",        ourStory: "nas-pribeh",         locations: "lokality",    stories: "pribehy",  media: "media",   heritage: "dedictvi",       activity: "zive",         getInvolved: "zapojte-se",    thankYou: "dekujeme",    privacy: "ochrana-udaju",     terms: "podminky", book: "kniha" },
  ro: { home: "", mission: "misiune",     ourStory: "povestea-noastra",   locations: "locatii",     stories: "marturii", media: "media",   heritage: "mostenire",      activity: "in-direct",    getInvolved: "implica-te",    thankYou: "multumesc",   privacy: "confidentialitate", terms: "termeni", book: "carte" },
  de: { home: "", mission: "mission",     ourStory: "unsere-geschichte",  locations: "standorte",   stories: "geschichten", media: "medien", heritage: "erbe",         activity: "live",         getInvolved: "mitmachen",     thankYou: "danke",       privacy: "datenschutz",       terms: "nutzungsbedingungen", book: "buch" },
  sr: { home: "", mission: "misija",      ourStory: "nasa-prica",         locations: "lokacije",    stories: "price",    media: "mediji",  heritage: "nasledje",       activity: "uzivo",        getInvolved: "prikljuci-se",  thankYou: "hvala",       privacy: "privatnost",        terms: "uslovi", book: "knjiga" },
  ru: { home: "", mission: "missiya",     ourStory: "nasha-istoriya",     locations: "mesta",       stories: "istorii",  media: "media",   heritage: "nasledie",       activity: "v-efire",      getInvolved: "uchastvovat",   thankYou: "spasibo",     privacy: "konfidentsialnost", terms: "usloviya", book: "kniga" },
  mk: { home: "", mission: "misija",      ourStory: "nasata-prikazna",    locations: "lokacii",     stories: "prikazni", media: "mediumi", heritage: "nasledstvo",     activity: "vo-zivo",      getInvolved: "vklucise",      thankYou: "blagodaram",  privacy: "privatnost",        terms: "uslovi", book: "kniga" },
  el: { home: "", mission: "apostoli",    ourStory: "i-istoria-mas",      locations: "topothesies", stories: "martyries", media: "mesa",   heritage: "klironomia",     activity: "zontana",      getInvolved: "symmetechete",  thankYou: "efcharistoume", privacy: "aporrito",        terms: "oroi-chrisis", book: "vivlio" },
};

export function resolveRoute(locale: Locale, urlSlug: string): RouteKey | null {
  const map = ROUTE_SLUGS[locale];
  if (!map) return null;
  for (const key of ROUTE_KEYS) {
    if (map[key] === urlSlug) return key;
  }
  return null;
}

export function buildPath(locale: Locale, routeKey: RouteKey): string {
  const slug = ROUTE_SLUGS[locale]?.[routeKey] ?? "";
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

export function isSupportedLocaleSegment(segment: string): segment is Locale {
  return LOCALES.some((l) => l.code === segment);
}
