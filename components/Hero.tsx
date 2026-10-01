'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dancing_Script } from 'next/font/google';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { HERO_GALLERY } from '@/lib/venueAssets';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '500', display: 'swap' });

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_GALLERY.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [isPaused, reducedMotion]);

  return (
    <section id="hero-section" aria-labelledby="hero-main-title" aria-roledescription="carousel" onFocusCapture={(event) => { if (!(event.target as HTMLElement).closest('[data-carousel-controls]')) setIsPaused(true); }} className="relative isolate overflow-hidden bg-[#111213] text-white sm:h-[88svh] sm:min-h-[560px] sm:max-h-[880px]">
      {HERO_GALLERY.map((photo, index) => (
        <div key={photo.image.src} id={`hero-photo-${index}`} aria-hidden={activeSlide !== index} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${activeSlide === index ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={photo.image}
            alt={photo.alt}
            fill
            priority={index === 0}
            loading={index === 0 ? undefined : 'eager'}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: photo.position }}
          />
        </div>
      ))}
      <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col justify-end px-5 pb-7 pt-32 sm:h-full sm:px-10 sm:pb-9 sm:pt-28 lg:px-16">
        <div>
          <h1 id="hero-main-title" className="max-w-5xl text-[40px] font-normal leading-[1.04] min-[400px]:text-[56px] sm:text-[80px] lg:text-[104px]">
            Starting New<br />Lifestyle
          </h1>
          <div className="mt-8 grid gap-7 border-t border-white/30 pt-6 sm:mt-10 sm:pt-7 md:grid-cols-12 md:items-center">
            <p className={`${dancingScript.className} max-w-lg text-[38px] leading-[1.25] text-white sm:text-[48px] md:col-span-6`}>
              Batas Kota Point
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
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium text-white/85 sm:mt-9 sm:text-xs">
            <div data-carousel-controls role="group" aria-label="Hero photos" className="flex items-center gap-1">
              {HERO_GALLERY.map((photo, index) => (
                <button key={photo.image.src} type="button" aria-label={`Show photo ${index + 1}: ${photo.alt}`} aria-controls={`hero-photo-${index}`} aria-pressed={activeSlide === index} title={`Photo ${index + 1}`} onClick={() => { setActiveSlide(index); setIsPaused(true); }} className="flex h-10 w-8 items-center justify-center hover:bg-white/10">
                  <span aria-hidden="true" className={`h-1.5 rounded-full ${activeSlide === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
                </button>
              ))}
              {!reducedMotion && <button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'} title={isPaused ? 'Play slideshow' : 'Pause slideshow'} className="flex h-10 w-10 items-center justify-center hover:bg-white/10">{isPaused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Pause aria-hidden="true" className="h-4 w-4" />}</button>}
            </div>
            <span>Arena / Pora.sch</span>
          </div>
        </div>
      </div>
    </section>
  );
}
