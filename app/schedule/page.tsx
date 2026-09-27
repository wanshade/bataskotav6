'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BookingSystem } from '@/components/BookingSystem';
import { SearchBookingModal } from '@/components/SearchBookingModal';

export default function SchedulePage() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="public-site min-h-screen overflow-x-clip bg-porcelain text-ink selection:bg-terracotta-600 selection:text-white dark:bg-black dark:text-neutral-100 dark:selection:bg-terracotta-500 dark:selection:text-white">
      <Navbar
        bookingHref="#booking"
        onOpenSearchBooking={() => setIsSearchModalOpen(true)}
      />
      <main id="main-content">
        <BookingSystem />
      </main>
      <Footer />
      <SearchBookingModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
