import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PublicScheduleGrid from '@/components/PublicScheduleGrid';

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-neon-green selection:text-black overflow-x-hidden pt-28 pb-12">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4 tracking-wider uppercase">
            Jadwal <span className="text-neon-green">Arena</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-sans">
            Cek ketersediaan lapangan secara real-time dan langsung amankan jadwal main tim Anda.
          </p>
        </div>
        <PublicScheduleGrid />
      </main>
      <Footer />
    </div>
  );
}
