'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { adminWhatsAppUrl } from '@/lib/contact';
import { VENUE_IMAGES } from '@/lib/venueAssets';

export function Footer({ variant = 'default' }: { variant?: 'default' | 'brand' }) {
  const isBrand = variant === 'brand';
  return (
    <footer className={`pb-7 pt-14 text-white sm:pt-20 ${isBrand ? 'bg-[#111213]' : 'bg-neutral-950'}`}>
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <div className="grid gap-12 pb-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-4"><Image src={VENUE_IMAGES.logo} alt="Batas Kota Point" width={48} height={48} className="bg-white" /><span className="text-lg font-semibold">Batas Kota Point</span></Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-neutral-400">{isBrand ? 'Born in Selong. A Social House for sport, coffee, and community.' : 'Satu kawasan untuk Batas Kota Arena dan Pora Social House.'}<br />{isBrand ? 'Selong, East Lombok, Indonesia.' : 'Selong, Lombok Timur, Indonesia.'}</p>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase text-neutral-500">{isBrand ? 'Destinations' : 'Destinasi'}</h2>
            <ul className="mt-5 space-y-4 text-sm text-neutral-300">
              <li><Link href="/#mini-soccer" className="hover:text-white">Batas Kota Arena</Link></li>
              <li><Link href="/#social-house" className="hover:text-white">Pora Social House</Link></li>
              <li><Link href="/#padel" className="hover:text-white">Padel</Link></li>
              <li><Link href="/schedule" className="inline-flex items-center gap-3 text-white">{isBrand ? 'Book the Arena' : 'Reservasi Arena'}<ArrowUpRight className="h-4 w-4" /></Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase text-neutral-500">{isBrand ? 'Stay connected' : 'Terhubung'}</h2>
            <ul className="mt-5 space-y-4 text-sm text-neutral-300">
              <li><a href="https://www.instagram.com/bataskota.arena/" target="_blank" rel="noopener noreferrer" className="hover:text-white">@bataskota.arena</a></li>
              <li><a href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a></li>
              {isBrand && <li><Link href="/#matchday" className="hover:text-white">Matchday & Community</Link></li>}
              <li><Link href="/#location" className="hover:text-white">{isBrand ? 'Location & Contact' : 'Lokasi & Kontak'}</Link></li>
              <li><Link href="/schedule#booking-rules" className="hover:text-white">{isBrand ? 'Booking information' : 'Informasi booking'}</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-neutral-800 pt-6 text-[11px] text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Batas Kota Point. All rights reserved.</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex min-h-10 items-center gap-4 text-neutral-300 hover:text-white">{isBrand ? 'Back to top' : 'Kembali ke atas'}<ArrowUp aria-hidden="true" className="h-4 w-4" /></button>
        </div>
        {isBrand && <p aria-hidden="true" className="mt-10 text-[43px] font-medium leading-[0.93] text-[#f4f2ed] min-[400px]:text-[52px] sm:text-[78px] lg:text-[118px]">Batas Kota<br />Point<span className="text-[#ff6a1a]">.</span></p>}
      </div>
    </footer>
  );
}
