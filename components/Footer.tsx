'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUp, Instagram, MessageCircle } from 'lucide-react';
import { adminWhatsAppDisplay, adminWhatsAppUrl } from '@/lib/contact';
import { VENUE_IMAGES } from '@/lib/venueAssets';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-terracotta-700 bg-black py-16 text-neutral-300 dark:border-terracotta-800 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Col 1: Brand (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <Image src={VENUE_IMAGES.logo} alt="Batas Kota Group" width={48} height={48} className="rounded-md bg-white shrink-0" />
              <span className="text-lg font-bold tracking-tight text-white uppercase">
                Batas Kota Point
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Satu tempat untuk olahraga dan kumpul bersama. Booking Batas Kota Arena. Pora Social House dan padel: Coming Soon.
            </p>
            <div className="text-xs font-mono text-neutral-400 space-y-1">
              <p>Operational Daily: 06:00 &mdash; 24:00 WITA</p>
              <p>
                Jl. TGH. Zainuddin Abdul Majid, Pancor, Kec. Sukamulia, Kabupaten Lombok Timur,
                Nusa Tenggara Bar. 83652
              </p>
            </div>
          </div>

          {/* Col 2: Facilities (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-terracotta-300">
              Spaces
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#padel" className="hover:text-white transition-colors">Padel · Coming Soon</a></li>
              <li><a href="#mini-soccer" className="hover:text-white transition-colors">Batas Kota Arena</a></li>
              <li><a href="#social-house" className="hover:text-white transition-colors">Pora.sch · Coming Soon</a></li>
              <li><a href="#booking" className="hover:text-white transition-colors">Tarif Arena</a></li>

            </ul>
          </div>

          {/* Col 3: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-terracotta-300">
              Reservations
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#booking" className="hover:text-white transition-colors">Booking Batas Kota Arena</a></li>
              <li><a href="#booking" className="hover:text-white transition-colors">Tarif per sesi</a></li>
              <li><a href="#cafe-menu" className="hover:text-white transition-colors">Preview Pora.sch</a></li>
              <li><a href="#location" className="hover:text-white transition-colors">Lokasi &amp; Kontak</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Rules &amp; Guidelines</a></li>
            </ul>
          </div>

          {/* Col 4: Direct Connect (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-terracotta-300">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-neutral-400">
              <a
                href={adminWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: {adminWhatsAppDisplay}</span>
              </a>
              <a
                href="https://www.instagram.com/bataskota.arena/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram: @bataskota.arena</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright & scroll-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} Batas Kota Point. All rights reserved. Modern Minimalist Sports &amp; Social Sanctuary.
          </p>
          <button
            type="button"
            id="scroll-to-top-btn"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
