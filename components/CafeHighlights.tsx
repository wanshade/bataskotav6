import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { CAFE_GALLERY } from '@/lib/venueAssets';

export function CafeHighlights() {
  return (
    <section id="social-house" aria-labelledby="pora-title" className="bg-[#111213] py-20 text-[#f4f2ed] sm:py-28">
      <div id="cafe-menu" className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <div className="mb-10 grid gap-7 border-b border-white/20 pb-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7"><span className="text-sm text-[#ff6a1a]">02 / Social House / Coming Soon</span><h2 id="pora-title" className="mt-4 text-5xl font-medium leading-[1.05] sm:text-7xl">Pora Social House.</h2><p className="mt-4 text-lg text-white/60">A new place to stay.</p></div>
          <div className="lg:col-span-5 lg:self-end"><p className="max-w-lg text-base leading-8 text-white/65">Ruang untuk menikmati waktu bersama, di antara arsitektur terbuka dan suasana hijau. Pora Social House sedang disiapkan sebagai bagian dari Batas Kota Point.</p><a href="https://www.instagram.com/bataskota.arena/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-6 border-b border-white/40 text-sm hover:border-white hover:text-[#ff6a1a]">Ikuti perkembangannya<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {CAFE_GALLERY.map(({ image, alt }, index) => (
            <figure key={image.src} className={index === 0 ? 'col-span-2 lg:row-span-2' : ''}>
              <div className={`relative overflow-hidden bg-[#222425] ${index === 0 ? 'aspect-[2/1] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-64' : 'aspect-video sm:aspect-[16/10]'}`}>
                <Image src={image} alt={alt} fill sizes={index === 0 ? '(max-width: 1024px) 100vw, 640px' : '(max-width: 1024px) 50vw, 320px'} className="object-cover" />
                {index === 0 && <span className="absolute left-4 top-4 bg-[#ff6a1a] px-3 py-2 text-[10px] font-semibold uppercase text-black sm:left-6 sm:top-6">Coming Soon</span>}
              </div>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-white/45">Visual konsep Pora Social House.</p>
      </div>
    </section>
  );
}
