import Link from "next/link";

export default function CTASection() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-8 md:gap-10 px-5 py-20 md:py-[120px] text-center bg-[linear-gradient(180deg,var(--warm-bg)_0%,var(--bg-primary)_100%)]"
    >
      <div className="w-12 h-[3px] bg-[var(--gold)]" />
      <h2 className="text-[32px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-tight">
        Help Plant the Next Parish.
      </h2>
      <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
        Your support plants parishes, trains leaders, and transforms communities.
      </p>

      {/* Desktop buttons */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/get-involved"
          className="px-9 py-[18px] bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
        >
          SUPPORT THE MISSION
        </Link>
        <Link
          href="/get-involved"
          className="px-9 py-[18px] border border-[var(--gold)] text-[var(--gold)] text-[12px] font-bold tracking-[1px] hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
        >
          JOIN A MISSION TRIP
        </Link>
        <Link
          href="/get-involved"
          className="px-9 py-[18px] border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
        >
          BECOME A VOLUNTEER
        </Link>
      </div>

      {/* Mobile buttons */}
      <div className="flex md:hidden flex-col gap-3 w-full max-w-[353px]">
        <Link
          href="/get-involved"
          className="py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] text-center hover:opacity-90 transition-opacity"
        >
          SUPPORT THE MISSION
        </Link>
        <Link
          href="/get-involved"
          className="py-4 border border-[var(--gold)] text-[var(--gold)] text-[12px] font-bold tracking-[1px] text-center hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
        >
          JOIN A MISSION TRIP
        </Link>
      </div>
    </section>
  );
}
