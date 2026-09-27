import Image from 'next/image';
import { Clock, ArrowUpRight } from 'lucide-react';
import { CAFE_GALLERY } from '@/lib/venueAssets';

export function CafeHighlights() {
  return (
    <section id="cafe-menu" className="border-t border-terracotta-900 bg-black py-16 text-white dark:border-terracotta-900 dark:bg-black md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div><span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-terracotta-300"><Clock className="h-4 w-4" />Pora.sch · Coming Soon</span><h2 className="mt-3 text-3xl font-bold uppercase tracking-tight sm:text-5xl">Pora Social House.<br />A new place to stay.</h2></div>
          <p className="max-w-md text-sm leading-relaxed text-neutral-400">Sudut hijau, ruang terbuka, dan tempat untuk kumpul setelah main. Ini gambaran Pora Social House yang akan hadir. Menu dan reservasi menyusul saat pembukaan.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {CAFE_GALLERY.map(({ image, alt }, index) => (
            <figure key={image.src} className={index === 0 ? 'col-span-2 lg:row-span-2' : ''}>
              <div className={`relative overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-terracotta-900 ${index === 0 ? 'aspect-[2/1] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-64' : 'aspect-video sm:aspect-[16/10]'}`}><Image src={image} alt={alt} fill sizes={index === 0 ? '(max-width: 1024px) 100vw, 608px' : '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 304px'} className="object-cover" /></div>
            </figure>
          ))}
        </div>
        <p className="mt-4 font-mono text-xs text-terracotta-300">Galeri visual konsep Pora Social House · Coming Soon</p>
        <a href="https://www.instagram.com/bataskota.arena/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-terracotta-300 underline underline-offset-4 transition-colors hover:text-white">Kabar pembukaan di Instagram<ArrowUpRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}
