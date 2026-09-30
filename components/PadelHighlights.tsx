import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

export function PadelHighlights() {
  return (
    <section id="padel" aria-labelledby="padel-title" className="bg-[#e9e7e1] py-20 text-[#111213] sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <div className="mb-10 grid gap-7 border-b border-black/20 pb-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7"><span className="text-sm text-black/55">03 / Racket Sports / Coming Soon</span><h2 id="padel-title" className="mt-4 text-5xl font-medium leading-[1.05] sm:text-7xl">Padel at Batas Kota.</h2></div>
          <div className="lg:col-span-5 lg:self-end"><p className="max-w-lg text-base leading-8 text-black/65">Pengalaman olahraga berikutnya di Batas Kota Point. Area padel sedang dalam pengembangan. Informasi pembukaan dan reservasi akan diumumkan melalui kanal resmi kami.</p><a href="https://www.instagram.com/bataskota.arena/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-6 border-b border-black/40 text-sm hover:border-black hover:text-[#c64712]">Ikuti perkembangannya<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a></div>
        </div>
        <figure className="relative aspect-[16/9] overflow-hidden bg-[#d5d3cd]">
          <Image src={VENUE_IMAGES.venueOverview} alt="Visual konsep kawasan Batas Kota Point dengan lapangan padel biru di sisi kiri" fill sizes="(max-width: 1440px) 100vw, 1312px" className="object-contain" />
          <span className="absolute left-4 top-4 bg-[#111213] px-3 py-2 text-[10px] font-semibold uppercase text-white sm:left-6 sm:top-6">Coming Soon</span>
        </figure>
        <p className="mt-4 text-[11px] text-black/50">Visual konsep pengembangan kawasan.</p>
      </div>
    </section>
  );
}
