"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Share2, MessageCircle } from "lucide-react";

type Page = "home" | "mission" | "locations" | "media" | "stories" | "get-involved";

interface NavbarProps {
  activePage?: Page;
}

const navLinks: { label: string; href: string; page: Page }[] = [
  { label: "HOME", href: "/", page: "home" },
  { label: "MISSION", href: "/mission", page: "mission" },
  // { label: "LOCATIONS", href: "/locations", page: "locations" },
  { label: "MEDIA", href: "/media", page: "media" },
  { label: "STORIES", href: "/stories", page: "stories" },
];

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center justify-between px-20 py-5 bg-[var(--bg-primary)]/50 backdrop-blur-xl w-full border-b border-white/[0.06]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
          <span className="text-[14px] font-bold tracking-[2px] text-[var(--text-primary)] uppercase">
            Christian Roma Mission
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.page}
              href={link.href}
              className={`text-[11px] tracking-[1.5px] transition-colors ${
                activePage === link.page
                  ? "text-[var(--gold)] font-semibold"
                  : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: document.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--gold)] text-[var(--gold)] text-[11px] font-bold tracking-[1px] hover:bg-[var(--gold)]/10 transition-colors"
          >
            <Share2 size={13} />
            SHARE
          </button>
          <a
            href="https://wa.me/421951230015"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[11px] font-bold tracking-[1px] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <MessageCircle size={13} />
            CONTACT
          </a>
          <Link
            href="/get-involved"
            className="px-6 py-3 bg-[var(--gold)] text-[#111111] text-[11px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
          >
            SUPPORT THE MISSION
          </Link>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="flex md:hidden items-center justify-between px-5 py-4 bg-[var(--bg-primary)]/50 backdrop-blur-xl w-full border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-georgia text-[24px] text-[var(--gold)]">☦</span>
          <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--text-primary)] leading-[1.3] uppercase">
            Christian Roma
            <br />
            Mission
          </span>
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[var(--text-primary)]"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="flex md:hidden flex-col bg-[var(--bg-primary)]/90 backdrop-blur-xl border-t border-[var(--border-default)]">
          {navLinks.map((link) => (
            <Link
              key={link.page}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`px-5 py-4 text-[13px] tracking-[1.5px] border-b border-[var(--border-default)] ${
                activePage === link.page
                  ? "text-[var(--gold)] font-semibold"
                  : "text-[var(--text-secondary)] font-medium"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              if (navigator.share) {
                navigator.share({ title: document.title, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="px-5 py-4 text-[13px] tracking-[1.5px] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-medium text-left"
          >
            SHARE
          </button>
          <a
            href="https://wa.me/421951230015"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="px-5 py-4 text-[13px] tracking-[1.5px] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-medium"
          >
            CONTACT
          </a>
          <Link
            href="/get-involved"
            onClick={() => setMenuOpen(false)}
            className="mx-5 my-4 py-4 bg-[var(--gold)] text-[#111111] text-[11px] font-bold tracking-[1px] text-center"
          >
            SUPPORT THE MISSION
          </Link>
        </div>
      )}

    </div>
  );
}
