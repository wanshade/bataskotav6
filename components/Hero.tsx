import Image from 'next/image';
import { Dancing_Script } from 'next/font/google';
import { ArrowUpRight } from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '600', display: 'swap' });

export function Hero() {
  return (
    <section id="hero-section" aria-labelledby="hero-main-title" className="font-sans">
      <div className="relative isolate h-[520px] overflow-hidden bg-terracotta-950 sm:h-[580px] lg:h-[min(660px,72svh)] lg:min-h-[520px]">
        <Image
          src={VENUE_IMAGES.venueOverview}
          alt="Visual konsep Batas Kota Point dengan Pora Social House, Batas Kota Arena, dan padel"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] sm:object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,16,15,0.18)_15%,rgba(47,20,15,0.42)_48%,rgba(17,16,15,0.92)_100%)]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-9 sm:px-8 sm:pb-12 lg:px-8 lg:pb-14">
          <p className="absolute right-6 top-5 text-[10px] tracking-wide text-white/90 sm:right-8 sm:top-6">
            Visual konsep kawasan
          </p>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="min-w-0 max-w-2xl">
              <h1
                id="hero-main-title"
                className="text-[clamp(3.75rem,19.5vw,4.75rem)] font-medium leading-[0.88] tracking-[-0.065em] text-[#fffdf5] sm:text-[104px] lg:text-[136px]"
              >
                Batas Kota<br />Point.
              </h1>
              <p className={`${dancingScript.className} mt-6 text-5xl leading-tight text-[#fffdf5] sm:mt-8 sm:text-6xl lg:text-7xl`}>
                The Social House
              </p>
            </div>
            <a
              href="https://www.instagram.com/bataskota.arena/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex shrink-0 items-center gap-5 border-b border-white/60 pb-2 text-sm text-white transition-colors hover:border-white focus-visible:outline-white sm:mb-1"
            >
              Open Instagram
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-terracotta-700 bg-terracotta-600 text-white dark:border-terracotta-800 dark:bg-terracotta-700 dark:text-white">
        <div className="mx-auto max-w-7xl px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div>
              <h2 className="text-lg font-medium tracking-tight">Olahraga dan kumpul di Batas Kota.</h2>
            </div>
            <a
              id="hero-book-now-btn"
              href="#booking"
              className="group inline-flex min-h-12 min-w-0 items-center justify-between gap-4 bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-white"
            >
              <span className="min-w-0 leading-relaxed">Booking Batas Kota Arena mini soccer</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
