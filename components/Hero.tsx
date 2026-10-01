import Image from 'next/image';
import Link from 'next/link';
import { Dancing_Script } from 'next/font/google';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '500', display: 'swap' });

export function Hero() {
  return (
    <section id="hero-section" aria-labelledby="hero-main-title" className="relative isolate overflow-hidden bg-[#111213] text-white sm:h-[88svh] sm:min-h-[560px] sm:max-h-[880px]">
      <Image
        src={VENUE_IMAGES.venueOverview}
        alt="Concept overview of Batas Kota Point with the Arena, Pora Social House, and padel courts"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[56%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col justify-end px-5 pb-7 pt-32 sm:h-full sm:px-10 sm:pb-9 sm:pt-28 lg:px-16">
        <div>
          <p className={`${dancingScript.className} mb-5 text-[25px] leading-[1.3] text-white/85 sm:mb-6 sm:text-[30px]`}>Starting New Lifestyle</p>
          <h1 id="hero-main-title" className="max-w-5xl text-[48px] font-normal leading-[1.04] min-[400px]:text-[60px] sm:text-[80px] lg:text-[104px]">
            Batas Kota<br />Point.
          </h1>
          <div className="mt-8 grid gap-7 border-t border-white/30 pt-6 sm:mt-10 sm:pt-7 md:grid-cols-12 md:items-center">
            <p className={`${dancingScript.className} max-w-lg text-[38px] leading-[1.25] text-white sm:text-[48px] md:col-span-6`}>
              The Social House
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
              <Link href="/schedule" className="inline-flex min-h-12 items-center justify-center gap-6 rounded-sm bg-white px-5 text-sm font-medium text-[#111213] transition-colors hover:bg-[#111213] hover:text-white">
                Book the Arena <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <a href="#facilities" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-sm border border-white/70 px-5 text-sm font-medium transition-colors hover:bg-white/10">
                Explore the destination <ArrowDown aria-hidden="true" className="h-4 w-4" />
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
