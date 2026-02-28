import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[3px] h-[14px] bg-[var(--gold)]" />
      <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
        {text}
      </span>
    </div>
  );
}

const locations = [
  {
    country: "Romania",
    flag: "🇷🇴",
    status: "Active",
    parishes: 4,
    since: "2010",
    desc: "Our longest-running mission presence. Four parishes now operate with local Roma clergy conducting services in Romani and Romanian.",
    image: "location-romania.jpg",
  },
  {
    country: "Slovakia",
    flag: "🇸🇰",
    status: "Active",
    parishes: 3,
    since: "2013",
    desc: "Three growing communities in Eastern Slovakia where the mission began. Strong youth and children programs anchor each parish.",
    image: "location-slovakia.jpg",
  },
  {
    country: "Hungary",
    flag: "🇭🇺",
    status: "Active",
    parishes: 2,
    since: "2016",
    desc: "Two parishes in Northern Hungary serving Roma settlements with weekly Liturgy, catechism classes, and family support programs.",
    image: "location-hungary.jpg",
  },
  {
    country: "Bulgaria",
    flag: "🇧🇬",
    status: "Growing",
    parishes: 2,
    since: "2019",
    desc: "Two newer communities in early stages of parish formation, with regular mission team visits and growing local leadership.",
    image: "location-bulgaria.jpg",
  },
];

const countries = ["ROMANIA", "HUNGARY", "SLOVAKIA", "BULGARIA", "SERBIA"];

export default function LocationsPage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="locations" />

      {/* ── Hero ── */}
      <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/locations-hero.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, #111111DD 0%, #11111188 60%, #11111144 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 md:gap-6 max-w-[700px]">
            <SectionLabel text="Where We Serve" />
            <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              Where We Serve
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              Active mission parishes across Central and Eastern Europe. Each
              location represents years of committed presence and growing
              community.
            </p>
            {/* Country filters */}
            <div className="flex flex-wrap gap-4 md:gap-6 mt-2">
              {countries.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-medium tracking-[1.5px] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors cursor-pointer"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Locations Grid ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        {/* Desktop 2x2 grid */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            {locations.slice(0, 2).map((loc) => (
              <LocationCard key={loc.country} loc={loc} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {locations.slice(2, 4).map((loc) => (
              <LocationCard key={loc.country} loc={loc} />
            ))}
          </div>
        </div>

        {/* Mobile stacked */}
        <div className="flex md:hidden flex-col gap-5">
          {locations.map((loc) => (
            <LocationCard key={loc.country} loc={loc} />
          ))}
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}

function LocationCard({
  loc,
}: {
  loc: {
    country: string;
    flag: string;
    status: string;
    parishes: number;
    since: string;
    desc: string;
    image: string;
  };
}) {
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      {/* Image */}
      <div
        className="w-full h-[180px] md:h-[240px] bg-[var(--bg-elevated)] bg-cover bg-center"
        style={{ backgroundImage: `url('/images/${loc.image}')` }}
      />
      {/* Body */}
      <div className="flex flex-col gap-4 p-5 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[22px]">{loc.flag}</span>
            <h3 className="text-[18px] md:text-[22px] font-bold text-[var(--text-primary)]">
              {loc.country}
            </h3>
          </div>
          <span
            className={`text-[10px] font-semibold tracking-[1px] px-3 py-1 ${
              loc.status === "Active"
                ? "bg-[#D4AF3720] text-[var(--gold)]"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            }`}
          >
            {loc.status.toUpperCase()}
          </span>
        </div>
        <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
          {loc.desc}
        </p>
        <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
          <div className="flex flex-col gap-1">
            <span className="text-[20px] md:text-[24px] font-bold text-[var(--gold)]">
              {loc.parishes}
            </span>
            <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
              Parishes
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[20px] md:text-[24px] font-bold text-[var(--text-primary)]">
              {loc.since}
            </span>
            <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
              Since
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
