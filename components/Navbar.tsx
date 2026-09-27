'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { VENUE_IMAGES } from '@/lib/venueAssets';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, Calendar, Search } from 'lucide-react';

interface NavbarProps {
  onOpenSearchBooking: () => void;
  bookingHref?: string;
}

export function Navbar({ onOpenSearchBooking, bookingHref = '/#booking' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Batas Kota Arena', href: '/#mini-soccer' },
    { label: 'Pora.sch', href: '/#social-house' },
    { label: 'Padel', href: '/#padel' },
    { label: 'Tarif', href: '/#booking' },
  ];

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 w-full border-b border-terracotta-700 bg-black/95 text-white backdrop-blur-md transition-colors dark:border-terracotta-800 dark:bg-black/95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <a
            id="brand-logo"
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <Image src={VENUE_IMAGES.logo} alt="Batas Kota Group" width={48} height={48} className="rounded-md bg-white shrink-0" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-white uppercase">
                Batas Kota Point
              </span>
              <span className="text-[11px] uppercase tracking-widest text-terracotta-300 font-mono">
                Arena &bull; Pora.sch &bull; Padel
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            id="desktop-navigation"
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-5 text-sm font-medium text-neutral-300"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-terracotta-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Tools: Search Booking, Theme Toggle, Book CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              id="search-booking-btn"
              type="button"
              onClick={onOpenSearchBooking}
              className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-terracotta-500 hover:text-terracotta-300"
              title="Look up existing reservation status"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Check Booking</span>
            </button>

            <ThemeToggle />

            <a
              id="header-book-cta"
              href={bookingHref}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-terracotta-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-terracotta-500"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Booking</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md border border-neutral-700 p-2 text-neutral-100 transition-colors hover:border-terracotta-500 hover:text-terracotta-300"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="space-y-3 border-b border-terracotta-700 bg-black px-4 pb-6 pt-3 lg:hidden"
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-terracotta-950 hover:text-terracotta-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-neutral-800 pt-3">
            <button
              id="mobile-search-booking-btn"
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearchBooking();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-neutral-200"
            >
              <Search className="w-4 h-4" />
              <span>Check Existing Reservation</span>
            </button>
            <a
              id="mobile-book-cta"
              href={bookingHref}
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-terracotta-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
            >
              <Calendar className="w-4 h-4" />
              <span>Booking Arena</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
