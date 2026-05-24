export const LOCALES = [
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "sk", label: "Slovenčina", short: "SK", flag: "🇸🇰" },
  { code: "cs", label: "Čeština", short: "CZ", flag: "🇨🇿" },
  { code: "ro", label: "Română", short: "RO", flag: "🇷🇴" },
  { code: "de", label: "Deutsch", short: "DE", flag: "🇩🇪" },
  { code: "sr", label: "Srpski", short: "SR", flag: "🇷🇸" },
  { code: "ru", label: "Русский", short: "RU", flag: "🇷🇺" },
  { code: "mk", label: "Македонски", short: "MK", flag: "🇲🇰" },
  { code: "el", label: "Ελληνικά", short: "EL", flag: "🇬🇷" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) return false;
  return LOCALES.some((l) => l.code === value);
}

export function getLocaleMeta(code: Locale) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}
