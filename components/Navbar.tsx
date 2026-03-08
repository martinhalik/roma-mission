"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Share2 } from "lucide-react";
import ShareModal from "@/components/ShareModal";

type Page = "home" | "mission" | "locations" | "media" | "get-involved";

interface NavbarProps {
  activePage?: Page;
}

const navLinks: { label: string; href: string; page: Page }[] = [
  { label: "MISSION", href: "/mission", page: "mission" },
  { label: "LOCATIONS", href: "/locations", page: "locations" },
  { label: "MEDIA", href: "/media", page: "media" },
];

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center justify-between px-20 py-5 bg-[var(--bg-primary)]/50 backdrop-blur-xl w-full border-b border-white/[0.06]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity">
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

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-6 py-3 border border-[var(--gold)] text-[var(--gold)] text-[11px] font-bold tracking-[1px] hover:opacity-80 transition-opacity"
          >
            <Share2 size={14} />
            SHARE
          </button>
          <a
            href="https://wa.me/421951230015"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
            className="flex items-center gap-2 px-6 py-3 border border-white/20 text-[var(--text-secondary)] text-[11px] font-bold tracking-[1px] hover:text-[var(--text-primary)] hover:border-white/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
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
        <Link href="/" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity">
          <span className="font-georgia text-[24px] text-[var(--gold)]">☦</span>
          <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--text-primary)] leading-[1.3] uppercase">
            Christian Roma
            <br />
            Mission
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/421951230015"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[var(--text-primary)]"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
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
          <div className="flex gap-3 mx-5 mt-4">
            <button
              onClick={() => { setMenuOpen(false); setShareOpen(true); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--gold)] text-[var(--gold)] text-[11px] font-bold tracking-[1px] hover:opacity-80 transition-opacity"
            >
              <Share2 size={13} />
              SHARE
            </button>
            <a
              href="https://wa.me/421951230015"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/20 text-[var(--text-secondary)] text-[11px] font-bold tracking-[1px] hover:text-[var(--text-primary)] hover:border-white/40 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              CONTACT
            </a>
          </div>
          <Link
            href="/get-involved"
            onClick={() => setMenuOpen(false)}
            className="mx-5 my-4 py-4 bg-[var(--gold)] text-[#111111] text-[11px] font-bold tracking-[1px] text-center"
          >
            SUPPORT THE MISSION
          </Link>
        </div>
      )}

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
