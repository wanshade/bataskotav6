'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Facilities } from '@/components/Facilities';
import { BookingSystem } from '@/components/BookingSystem';
import { CafeHighlights } from '@/components/CafeHighlights';
import { ActivityGallery } from '@/components/ActivityGallery';
import { PadelHighlights } from '@/components/PadelHighlights';
import { LocationAmenities } from '@/components/LocationAmenities';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { SearchBookingModal } from '@/components/SearchBookingModal';

export default function HomePage() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="public-site min-h-screen overflow-x-clip bg-porcelain text-ink transition-colors selection:bg-terracotta-600 selection:text-white dark:bg-black dark:text-neutral-100 dark:selection:bg-terracotta-500 dark:selection:text-white">
      <Navbar onOpenSearchBooking={() => setIsSearchModalOpen(true)} />
      <main id="main-content">
        <Hero />
        <Facilities />
        <CafeHighlights />
        <section id="mini-soccer" aria-labelledby="arena-title">
          <ActivityGallery />
          <BookingSystem />
        </section>
        <PadelHighlights />
        <LocationAmenities />
        <FaqSection />
      </main>
      <Footer />
      <SearchBookingModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between rounded-lg border border-terracotta-200 bg-porcelain/95 p-2.5 shadow-lg backdrop-blur-md dark:border-terracotta-900 dark:bg-black/95 sm:hidden">
        <div className="flex min-w-0 flex-col pl-2">
          <span className="truncate text-[11px] font-bold uppercase text-neutral-900 dark:text-white">Batas Kota Point</span>
          <span className="truncate font-mono text-[10px] text-neutral-500">Pora.sch · Arena · Padel</span>
        </div>
        <button type="button" onClick={scrollToBooking} className="flex shrink-0 items-center gap-1.5 rounded-md bg-terracotta-600 px-4 py-2 text-xs font-bold uppercase text-white shadow-sm transition-colors hover:bg-terracotta-700 dark:bg-terracotta-500 dark:text-white dark:hover:bg-terracotta-400">
          <Calendar className="h-3.5 w-3.5" /> Booking
        </button>
      </div>
    </div>
  );
}
