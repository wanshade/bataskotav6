'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

interface NavbarProps {
  onOpenSearchBooking: () => void;
  bookingHref?: string;
  variant?: 'default' | 'brand';
}

export function Navbar({ onOpenSearchBooking, bookingHref = '/schedule', variant = 'default' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isBrand = variant === 'brand';
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  const navLinks = [
    { label: 'Kawasan', href: '/#facilities' },
    { label: 'Arena', href: '/#mini-soccer' },
    { label: 'Pora.sch', href: '/#social-house' },
    { label: 'Lokasi', href: '/#location' },
  ];

  return (
    <header id="main-header" className={`top-0 z-50 border-b ${isBrand ? 'fixed inset-x-0 border-white/10 bg-[#111213] text-white' : 'sticky border-neutral-200 bg-white text-neutral-950'}`}>
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-10 lg:px-16">
        <Link id="brand-logo" href="/" aria-label="Batas Kota Point, halaman utama" className="flex min-w-0 items-center gap-3">
          <Image src={VENUE_IMAGES.logo} alt="Batas Kota Point" width={44} height={44} className="shrink-0 bg-white" />
          <div><span className="block text-sm font-semibold uppercase sm:text-base">Batas Kota Point</span><span className={`mt-1 block text-[10px] ${isBrand ? 'text-white/65' : 'text-neutral-500'}`}>The Social House</span></div>
        </Link>
        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 text-xs font-medium lg:flex">
          {navLinks.map((link) => <Link key={link.href} href={link.href} className={`transition-colors ${isBrand ? 'text-white/80 hover:text-white' : 'hover:text-neutral-500'}`}>{link.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <button id="search-booking-btn" type="button" onClick={onOpenSearchBooking} title="Cek booking" aria-label="Cek booking" className={`hidden h-11 w-11 items-center justify-center sm:flex ${isBrand ? 'hover:bg-white/10' : 'hover:bg-neutral-100'}`}><Search aria-hidden="true" className="h-[18px] w-[18px]" /></button>
          <Link id="header-book-cta" href={bookingHref} className={`hidden min-h-11 items-center gap-5 rounded-sm px-5 text-xs font-medium transition-colors sm:inline-flex ${isBrand ? 'bg-[#ff6a1a] text-black hover:bg-white' : 'bg-neutral-950 text-white hover:bg-neutral-700'}`}>Reservasi Arena<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          <button id="mobile-menu-toggle" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" className={`flex h-11 w-11 shrink-0 items-center justify-center lg:hidden ${isBrand ? 'hover:bg-white/10' : 'hover:bg-neutral-100'}`}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav id="mobile-menu" aria-label="Navigasi seluler" className={`absolute inset-x-0 top-full max-h-[calc(100svh-80px)] overflow-y-auto border-b px-5 pb-6 shadow-lg sm:px-10 lg:hidden ${isBrand ? 'border-white/10 bg-[#111213] text-white' : 'border-neutral-200 bg-white'}`}>
          {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-14 items-center justify-between border-t text-sm ${isBrand ? 'border-white/15' : 'border-neutral-100'}`}>{link.label}<ArrowUpRight className={`h-4 w-4 ${isBrand ? 'text-[#ff6a1a]' : 'text-neutral-400'}`} /></Link>)}
          <button type="button" onClick={() => { setMobileMenuOpen(false); onOpenSearchBooking(); }} className={`flex min-h-14 w-full items-center gap-3 border-t text-sm ${isBrand ? 'border-white/15' : 'border-neutral-100'}`}><Search className="h-4 w-4" />Cek booking</button>
          <Link id="mobile-book-cta" href={bookingHref} onClick={() => setMobileMenuOpen(false)} className={`mt-3 flex min-h-12 items-center justify-between px-5 text-sm font-medium ${isBrand ? 'bg-[#ff6a1a] text-black' : 'bg-black text-white'}`}>Reservasi Batas Kota Arena<ArrowUpRight className="h-4 w-4" /></Link>
        </nav>
      )}
    </header>
  );
}
