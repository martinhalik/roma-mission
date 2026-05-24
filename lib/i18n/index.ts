import en from "./dictionaries/en";
import sk from "./dictionaries/sk";
import cs from "./dictionaries/cs";
import ro from "./dictionaries/ro";
import de from "./dictionaries/de";
import sr from "./dictionaries/sr";
import ru from "./dictionaries/ru";
import mk from "./dictionaries/mk";
import el from "./dictionaries/el";
import type { Dictionary } from "./types";
import type { Locale } from "./locales";

export const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  sk,
  cs,
  ro,
  de,
  sr,
  ru,
  mk,
  el,
};

export type { Dictionary } from "./types";
export { LOCALES, DEFAULT_LOCALE, isLocale, getLocaleMeta } from "./locales";
export type { Locale } from "./locales";
