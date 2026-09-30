import Image from 'next/image';
import Link from 'next/link';
import { Dancing_Script } from 'next/font/google';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '600', display: 'swap' });

export function Hero() {
  return (
    <section id="hero-section" aria-labelledby="hero-main-title" className="relative isolate h-[88svh] min-h-[560px] max-h-[880px] overflow-hidden bg-[#111213] text-white">
      <Image
        src={VENUE_IMAGES.venueOverview}
        alt="Visual konsep kawasan Batas Kota Point dengan Arena, Pora Social House, dan lapangan padel"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[56%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-7 pt-28 sm:px-10 sm:pb-9 lg:px-16">
        <div>
          <h1 id="hero-main-title" className="max-w-5xl text-[47px] font-medium leading-[0.97] min-[400px]:text-[58px] sm:text-[84px] lg:text-[116px]">
            Batas Kota<br />Point.
          </h1>
          <div className="mt-6 grid gap-6 border-t border-white/50 pt-5 sm:mt-9 sm:pt-6 md:grid-cols-12 md:items-end">
            <p className={`${dancingScript.className} max-w-lg text-[44px] leading-[1.1] text-white sm:text-[58px] md:col-span-6`}>
              The Social House
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
              <Link href="/schedule" className="inline-flex min-h-12 items-center justify-center gap-6 rounded-sm bg-white px-5 text-sm font-medium text-[#111213] transition-colors hover:bg-[#111213] hover:text-white">
                Reservasi Arena <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <a href="#facilities" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-sm border border-white/70 px-5 text-sm font-medium transition-colors hover:bg-white/10">
                Jelajahi kawasan <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="mt-7 flex justify-end text-[11px] font-medium text-white/85 sm:mt-9 sm:text-xs">
            <span>Arena / Pora.sch</span>
          </div>
        </div>
      </div>
    </section>
  );
}
