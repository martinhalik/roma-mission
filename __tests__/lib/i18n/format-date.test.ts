import { afterEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "../../../lib/i18n/locales";
import {
  formatDate,
  formatRelativeDate,
  formatRelativeTime,
  formatShortDate,
  type RelativeUnit,
} from "../../../lib/i18n/format";

const LOCALES: Locale[] = ["en", "sk", "de", "el", "cs", "ro", "sr", "mk", "ru"];

/** Day 13 of each month in 2026, UTC noon, so the calendar day does not depend on the host zone. */
const MONTH_DATES = Array.from({ length: 12 }, (_, month) =>
  new Date(Date.UTC(2026, month, 13, 12))
);

const SHORT: Record<Locale, readonly string[]> = {
  en: ["Jan 13", "Feb 13", "Mar 13", "Apr 13", "May 13", "Jun 13", "Jul 13", "Aug 13", "Sep 13", "Oct 13", "Nov 13", "Dec 13"],
  sk: ["13. 1.", "13. 2.", "13. 3.", "13. 4.", "13. 5.", "13. 6.", "13. 7.", "13. 8.", "13. 9.", "13. 10.", "13. 11.", "13. 12."],
  cs: ["13. 1.", "13. 2.", "13. 3.", "13. 4.", "13. 5.", "13. 6.", "13. 7.", "13. 8.", "13. 9.", "13. 10.", "13. 11.", "13. 12."],
  de: ["13. Jan.", "13. Feb.", "13. März", "13. Apr.", "13. Mai", "13. Juni", "13. Juli", "13. Aug.", "13. Sept.", "13. Okt.", "13. Nov.", "13. Dez."],
  el: ["13 Ιαν", "13 Φεβ", "13 Μαρ", "13 Απρ", "13 Μαΐ", "13 Ιουν", "13 Ιουλ", "13 Αυγ", "13 Σεπ", "13 Οκτ", "13 Νοε", "13 Δεκ"],
  ro: ["13 ian.", "13 feb.", "13 mar.", "13 apr.", "13 mai", "13 iun.", "13 iul.", "13 aug.", "13 sept.", "13 oct.", "13 nov.", "13 dec."],
  sr: ["13. јан", "13. феб", "13. мар", "13. апр", "13. мај", "13. јун", "13. јул", "13. авг", "13. сеп", "13. окт", "13. нов", "13. дец"],
  mk: ["13 јан.", "13 фев.", "13 мар.", "13 апр.", "13 мај", "13 јун.", "13 јул.", "13 авг.", "13 сеп.", "13 окт.", "13 ное.", "13 дек."],
  ru: ["13 янв.", "13 февр.", "13 мар.", "13 апр.", "13 мая", "13 июн.", "13 июл.", "13 авг.", "13 сент.", "13 окт.", "13 нояб.", "13 дек."],
};

const LONG: Record<Locale, readonly string[]> = {
  en: ["January 13, 2026", "February 13, 2026", "March 13, 2026", "April 13, 2026", "May 13, 2026", "June 13, 2026", "July 13, 2026", "August 13, 2026", "September 13, 2026", "October 13, 2026", "November 13, 2026", "December 13, 2026"],
  sk: ["13. januára 2026", "13. februára 2026", "13. marca 2026", "13. apríla 2026", "13. mája 2026", "13. júna 2026", "13. júla 2026", "13. augusta 2026", "13. septembra 2026", "13. októbra 2026", "13. novembra 2026", "13. decembra 2026"],
  cs: ["13. ledna 2026", "13. února 2026", "13. března 2026", "13. dubna 2026", "13. května 2026", "13. června 2026", "13. července 2026", "13. srpna 2026", "13. září 2026", "13. října 2026", "13. listopadu 2026", "13. prosince 2026"],
  de: ["13. Januar 2026", "13. Februar 2026", "13. März 2026", "13. April 2026", "13. Mai 2026", "13. Juni 2026", "13. Juli 2026", "13. August 2026", "13. September 2026", "13. Oktober 2026", "13. November 2026", "13. Dezember 2026"],
  el: ["13 Ιανουαρίου 2026", "13 Φεβρουαρίου 2026", "13 Μαρτίου 2026", "13 Απριλίου 2026", "13 Μαΐου 2026", "13 Ιουνίου 2026", "13 Ιουλίου 2026", "13 Αυγούστου 2026", "13 Σεπτεμβρίου 2026", "13 Οκτωβρίου 2026", "13 Νοεμβρίου 2026", "13 Δεκεμβρίου 2026"],
  ro: ["13 ianuarie 2026", "13 februarie 2026", "13 martie 2026", "13 aprilie 2026", "13 mai 2026", "13 iunie 2026", "13 iulie 2026", "13 august 2026", "13 septembrie 2026", "13 octombrie 2026", "13 noiembrie 2026", "13 decembrie 2026"],
  sr: ["13. јануар 2026.", "13. фебруар 2026.", "13. март 2026.", "13. април 2026.", "13. мај 2026.", "13. јун 2026.", "13. јул 2026.", "13. август 2026.", "13. септембар 2026.", "13. октобар 2026.", "13. новембар 2026.", "13. децембар 2026."],
  mk: ["13 јануари 2026 г.", "13 февруари 2026 г.", "13 март 2026 г.", "13 април 2026 г.", "13 мај 2026 г.", "13 јуни 2026 г.", "13 јули 2026 г.", "13 август 2026 г.", "13 септември 2026 г.", "13 октомври 2026 г.", "13 ноември 2026 г.", "13 декември 2026 г."],
  ru: ["13 января 2026 г.", "13 февраля 2026 г.", "13 марта 2026 г.", "13 апреля 2026 г.", "13 мая 2026 г.", "13 июня 2026 г.", "13 июля 2026 г.", "13 августа 2026 г.", "13 сентября 2026 г.", "13 октября 2026 г.", "13 ноября 2026 г.", "13 декабря 2026 г."],
};

const RELATIVE: Record<Locale, readonly (readonly [RelativeUnit, number, string])[]> = {
  en: [
    ["minute", 0, "this minute"],
    ["minute", 1, "1 minute ago"],
    ["minute", 5, "5 minutes ago"],
    ["hour", 0, "this hour"],
    ["hour", 1, "1 hour ago"],
    ["hour", 11, "11 hours ago"],
    ["day", 0, "today"],
    ["day", 1, "yesterday"],
    ["day", 2, "2 days ago"],
    ["day", 29, "29 days ago"],
  ],
  de: [
    ["minute", 0, "in dieser Minute"],
    ["minute", 1, "vor 1 Minute"],
    ["minute", 5, "vor 5 Minuten"],
    ["hour", 1, "vor 1 Stunde"],
    ["hour", 5, "vor 5 Stunden"],
    ["day", 0, "heute"],
    ["day", 1, "gestern"],
    ["day", 2, "vorgestern"],
    ["day", 5, "vor 5 Tagen"],
  ],
  el: [
    ["minute", 0, "τρέχον λεπτό"],
    ["minute", 1, "πριν από 1 λεπτό"],
    ["minute", 5, "πριν από 5 λεπτά"],
    ["hour", 1, "πριν από 1 ώρα"],
    ["hour", 5, "πριν από 5 ώρες"],
    ["day", 0, "σήμερα"],
    ["day", 1, "χθες"],
    ["day", 2, "προχθές"],
    ["day", 5, "πριν από 5 ημέρες"],
  ],
  sk: [
    ["minute", 0, "v tejto minúte"],
    ["minute", 1, "pred 1 minútou"],
    ["minute", 2, "pred 2 minútami"],
    ["minute", 5, "pred 5 minútami"],
    ["hour", 1, "pred 1 hodinou"],
    ["hour", 4, "pred 4 hodinami"],
    ["hour", 5, "pred 5 hodinami"],
    ["day", 0, "dnes"],
    ["day", 1, "včera"],
    ["day", 2, "predvčerom"],
    ["day", 3, "pred 3 dňami"],
    ["day", 5, "pred 5 dňami"],
    ["day", 21, "pred 21 dňami"],
  ],
  cs: [
    ["minute", 0, "tuto minutu"],
    ["minute", 1, "před 1 minutou"],
    ["minute", 2, "před 2 minutami"],
    ["minute", 5, "před 5 minutami"],
    ["hour", 1, "před 1 hodinou"],
    ["hour", 5, "před 5 hodinami"],
    ["day", 0, "dnes"],
    ["day", 1, "včera"],
    ["day", 2, "předevčírem"],
    ["day", 4, "před 4 dny"],
    ["day", 5, "před 5 dny"],
    ["day", 22, "před 22 dny"],
  ],
  ro: [
    ["minute", 0, "minutul acesta"],
    ["minute", 1, "acum 1 minut"],
    ["minute", 2, "acum 2 minute"],
    ["minute", 19, "acum 19 minute"],
    ["minute", 20, "acum 20 de minute"],
    ["minute", 101, "acum 101 minute"],
    ["hour", 1, "acum 1 oră"],
    ["hour", 21, "acum 21 de ore"],
    ["day", 0, "azi"],
    ["day", 1, "ieri"],
    ["day", 2, "alaltăieri"],
    ["day", 5, "acum 5 zile"],
    ["day", 21, "acum 21 de zile"],
  ],
  sr: [
    ["minute", 0, "овог минута"],
    ["minute", 1, "пре 1 минута"],
    ["minute", 5, "пре 5 минута"],
    ["minute", 21, "пре 21 минута"],
    ["hour", 1, "пре 1 сата"],
    ["hour", 2, "пре 2 сата"],
    ["hour", 4, "пре 4 сата"],
    ["hour", 5, "пре 5 сати"],
    ["hour", 11, "пре 11 сати"],
    ["hour", 21, "пре 21 сата"],
    ["hour", 22, "пре 22 сата"],
    ["day", 0, "данас"],
    ["day", 1, "јуче"],
    ["day", 2, "прекјуче"],
    ["day", 5, "пре 5 дана"],
    ["day", 21, "пре 21 дана"],
  ],
  ru: [
    ["minute", 0, "в эту минуту"],
    ["minute", 1, "1 минуту назад"],
    ["minute", 2, "2 минуты назад"],
    ["minute", 5, "5 минут назад"],
    ["minute", 11, "11 минут назад"],
    ["minute", 21, "21 минуту назад"],
    ["minute", 22, "22 минуты назад"],
    ["hour", 1, "1 час назад"],
    ["hour", 3, "3 часа назад"],
    ["hour", 5, "5 часов назад"],
    ["hour", 11, "11 часов назад"],
    ["hour", 21, "21 час назад"],
    ["day", 0, "сегодня"],
    ["day", 1, "вчера"],
    ["day", 2, "позавчера"],
    ["day", 3, "3 дня назад"],
    ["day", 5, "5 дней назад"],
    ["day", 11, "11 дней назад"],
    ["day", 21, "21 день назад"],
    ["day", 22, "22 дня назад"],
  ],
  mk: [
    ["minute", 0, "оваа минута"],
    ["minute", 1, "пред 1 минута"],
    ["minute", 2, "пред 2 минути"],
    ["minute", 11, "пред 11 минути"],
    ["minute", 21, "пред 21 минута"],
    ["hour", 1, "пред 1 час"],
    ["hour", 11, "пред 11 часа"],
    ["hour", 21, "пред 21 час"],
    ["day", 0, "денес"],
    ["day", 1, "вчера"],
    ["day", 2, "завчера"],
    ["day", 11, "пред 11 дена"],
    ["day", 21, "пред 21 ден"],
    ["day", 29, "пред 29 дена"],
  ],
};

describe("formatShortDate and formatDate", () => {
  it.each(LOCALES)("formats every month for %s", (locale) => {
    MONTH_DATES.forEach((date, index) => {
      expect(formatShortDate(date, locale)).toBe(SHORT[locale][index]);
      expect(formatDate(date, locale)).toBe(LONG[locale][index]);
      expect(formatDate(date.toISOString(), locale)).toBe(LONG[locale][index]);
    });
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatShortDate("not-a-date", "mk")).toBe("");
    expect(formatDate("not-a-date", "en")).toBe("");
  });
});

describe("formatRelativeTime", () => {
  it.each(LOCALES)("uses the plural forms for %s", (locale) => {
    for (const [unit, count, text] of RELATIVE[locale]) {
      expect(formatRelativeTime(count, unit, locale)).toBe(text);
    }
  });
});

describe("formatRelativeDate", () => {
  const now = Date.UTC(2026, 9, 17, 12, 0, 0);

  function iso(msBefore: number): string {
    return new Date(now - msBefore).toISOString();
  }

  it("keeps the same string for one server clock", () => {
    const stamp = iso(29 * 86_400_000);
    expect(formatRelativeDate(stamp, "mk", now)).toBe("пред 29 дена");
    expect(formatRelativeDate(stamp, "mk", now)).toBe(formatRelativeDate(stamp, "mk", now));
    expect(formatRelativeDate(stamp, "en", now)).toBe("29 days ago");
    expect(formatRelativeDate(stamp, "ru", now)).toBe("29 дней назад");
    expect(formatRelativeDate(stamp, "sr", now)).toBe("пре 29 дана");
    expect(formatRelativeDate(stamp, "sk", now)).toBe("pred 29 dňami");
  });

  it("switches from a relative day to a short date at 30 days", () => {
    expect(formatRelativeDate(iso(29 * 86_400_000), "mk", now)).toBe("пред 29 дена");
    expect(formatRelativeDate(iso(30 * 86_400_000), "mk", now)).toBe("17 сеп.");
    expect(formatRelativeDate(iso(30 * 86_400_000), "en", now)).toBe("Sep 17");
    expect(formatRelativeDate(iso(30 * 86_400_000), "sr", now)).toBe("17. сеп");
    expect(formatRelativeDate(iso(30 * 86_400_000), "ru", now)).toBe("17 сент.");
    expect(formatRelativeDate(iso(30 * 86_400_000), "sk", now)).toBe("17. 9.");
  });

  it("uses minutes, then hours, then days", () => {
    expect(formatRelativeDate(iso(0), "en", now)).toBe("this minute");
    expect(formatRelativeDate(iso(59 * 60_000), "mk", now)).toBe("пред 59 минути");
    expect(formatRelativeDate(iso(60 * 60_000), "mk", now)).toBe("пред 1 час");
    expect(formatRelativeDate(iso(23 * 3_600_000), "cs", now)).toBe("před 23 hodinami");
    expect(formatRelativeDate(iso(24 * 3_600_000), "cs", now)).toBe("včera");
  });

  it("returns an empty string when the timestamp is missing or invalid", () => {
    expect(formatRelativeDate("", "en", now)).toBe("");
    expect(formatRelativeDate("nope", "en", now)).toBe("");
  });
});

describe("date formatting does not consult Intl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still formats when DateTimeFormat and RelativeTimeFormat throw", () => {
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("date formatting must not consult Intl");
    });
    vi.spyOn(Intl, "RelativeTimeFormat").mockImplementation(() => {
      throw new Error("relative time must not consult Intl");
    });

    expect(formatDate(MONTH_DATES[8], "mk")).toBe("13 септември 2026 г.");
    expect(formatShortDate(MONTH_DATES[8], "mk")).toBe("13 сеп.");
    expect(formatRelativeTime(29, "day", "mk")).toBe("пред 29 дена");
    expect(formatRelativeTime(21, "day", "ru")).toBe("21 день назад");
    expect(formatRelativeTime(1, "minute", "sk")).toBe("pred 1 minútou");
    expect(formatRelativeTime(22, "hour", "sr")).toBe("пре 22 сата");
    expect(formatRelativeTime(5, "day", "cs")).toBe("před 5 dny");
  });
});
