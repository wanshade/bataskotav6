'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingSystem } from '@/components/BookingSystem';
import { FaqSection } from '@/components/FaqSection';
import { SearchBookingModal } from '@/components/SearchBookingModal';

export default function SchedulePage() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="public-site min-h-screen overflow-x-clip bg-neutral-50 text-neutral-950 selection:bg-neutral-950 selection:text-white dark:bg-black dark:text-neutral-100 dark:selection:bg-neutral-500 dark:selection:text-white">
      <Navbar
        bookingHref="#booking"
        onOpenSearchBooking={() => setIsSearchModalOpen(true)}
      />
      <main id="main-content">
        <BookingSystem />
        <FaqSection />
      </main>
      <Footer />
      <SearchBookingModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
