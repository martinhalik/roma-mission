import Link from "next/link";

export default function Footer() {
  return (
    <>
      <div className="h-px bg-[var(--border-default)] w-full" />
      <footer className="bg-[var(--bg-primary)] w-full">
        {/* Desktop Footer */}
        <div className="hidden md:block px-[120px] pt-16 pb-10">
          <div className="flex justify-between mb-12">
            {/* Brand */}
            <div className="w-[300px] flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
                <span className="text-[14px] font-bold tracking-[2px] text-[var(--text-primary)] uppercase">
                  Christian Roma Mission
                </span>
              </Link>
              <p className="text-[var(--text-muted)] text-[13px] leading-[1.6]">
                Planting parishes. Forming disciples.
                <br />
                Transforming communities.
              </p>
            </div>

            {/* Mission */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                Mission
              </p>
              <div className="flex flex-col gap-3">
                {["Our Approach", "Locations", "Stories"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Media */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                Media
              </p>
              <div className="flex flex-col gap-3">
                {["Documentary", "Podcast", "News"].map((item) => (
                  <Link
                    key={item}
                    href="/media"
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Get Involved */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                Get Involved
              </p>
              <div className="flex flex-col gap-3">
                {["Support", "Volunteer", "Mission Trips"].map((item) => (
                  <Link
                    key={item}
                    href="/get-involved"
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--border-default)] mb-6" />

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[var(--text-muted)]">
              © 2026 Christian Roma Mission. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-use"
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex md:hidden flex-col gap-10 px-5 pt-12 pb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-georgia text-[24px] text-[var(--gold)]">☦</span>
              <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--text-primary)] leading-[1.3] uppercase">
                Christian Roma
                <br />
                Mission
              </span>
            </Link>
            <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">
              Planting parishes. Forming disciples.
              <br />
              Transforming communities.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                Mission
              </p>
              {["Our Approach", "Locations", "Stories"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-[12px] text-[var(--text-secondary)]"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                Media
              </p>
              {["Documentary", "Podcast", "News"].map((item) => (
                <Link key={item} href="/media" className="text-[12px] text-[var(--text-secondary)]">
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                Involved
              </p>
              {["Support", "Volunteer", "Trips"].map((item) => (
                <Link
                  key={item}
                  href="/get-involved"
                  className="text-[12px] text-[var(--text-secondary)]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--border-default)]" />

          <div className="flex flex-col gap-3 items-center">
            <p className="text-[10px] text-[var(--text-muted)] text-center">
              © 2026 Christian Roma Mission.
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="/privacy-policy"
                className="text-[10px] text-[var(--text-muted)]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-use"
                className="text-[10px] text-[var(--text-muted)]"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
