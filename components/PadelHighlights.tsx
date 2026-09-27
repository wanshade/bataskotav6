import Image from 'next/image';
import { ArrowUpRight, Clock } from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

export function PadelHighlights() {
  return (
    <section id="padel" aria-labelledby="padel-title" className="border-t border-terracotta-300 bg-terracotta-100 py-16 text-ink dark:border-terracotta-900 dark:bg-neutral-950 dark:text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-terracotta-700 dark:text-terracotta-300"><Clock className="h-4 w-4" />Padel · Coming Soon</span>
            <h2 id="padel-title" className="mt-3 text-3xl font-bold uppercase sm:text-5xl">Padel di Batas Kota.<br />Ketemu di court.</h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-400">Tempat baru buat rally santai dan main bareng teman. Area padel sedang disiapkan di Batas Kota Point. Informasi pembukaan, tarif, dan reservasi akan diumumkan menyusul.</p>
            <a href="https://www.instagram.com/bataskota.arena/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-terracotta-800 underline underline-offset-4 transition-colors hover:text-black dark:text-terracotta-300 dark:hover:text-white">Ikuti kabar pembukaan<ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image src={VENUE_IMAGES.venueOverview} alt="Visual konsep kawasan Batas Kota Point dengan lapangan padel berwarna biru di sisi kiri" fill sizes="(max-width: 1280px) 100vw, 1216px" className="object-cover" />
          <span className="absolute bottom-3 left-3 rounded bg-black/75 px-3 py-1.5 text-xs text-white sm:bottom-5 sm:left-5">Visual konsep kawasan</span>
        </div>
      </div>
    </section>
  );
}
