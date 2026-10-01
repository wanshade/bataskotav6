'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Facilities } from '@/components/Facilities';
import { CafeHighlights } from '@/components/CafeHighlights';
import { ActivityGallery } from '@/components/ActivityGallery';
import { MatchdayHighlights } from '@/components/MatchdayHighlights';
import { PadelHighlights } from '@/components/PadelHighlights';
import { LocationAmenities } from '@/components/LocationAmenities';
import { BrandBookingCta } from '@/components/BrandBookingCta';
import { Footer } from '@/components/Footer';
import { SearchBookingModal } from '@/components/SearchBookingModal';

export function HomePageClient() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  return (
    <div lang="en" className="public-site brand-site min-h-screen bg-[#111213] text-[#f4f2ed] selection:bg-[#ff6a1a] selection:text-black">
      <Navbar variant="brand" onOpenSearchBooking={() => setIsSearchModalOpen(true)} />
      <main id="main-content">
        <Hero />
        <Facilities />
        <section id="mini-soccer" aria-labelledby="arena-title">
          <ActivityGallery />
        </section>
        <MatchdayHighlights />
        <CafeHighlights />
        <PadelHighlights />
        <LocationAmenities />
        <BrandBookingCta />
      </main>
      <Footer variant="brand" />
      <SearchBookingModal language="en" isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
}
