import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const photos = [
  { id: 6, alt: 'Pemandangan udara lapangan Batas Kota Arena pada siang hari', ratio: 'sm:aspect-video' },
  { id: 1, alt: 'Pemain berebut bola dalam pertandingan malam di Batas Kota Arena', ratio: 'sm:aspect-[640/427]' },
  { id: 3, alt: 'Foto bersama tim berseragam hijau di Batas Kota Arena', ratio: 'sm:aspect-[640/427]' },
  { id: 2, alt: 'Dua pemain berduel memperebutkan bola di Batas Kota Arena', ratio: 'sm:aspect-[3/4]' },
  { id: 4, alt: 'Penjaga gawang menangkap bola di depan gawang Batas Kota Arena', ratio: 'sm:aspect-[3/4]' },
  { id: 5, alt: 'Pemain di sisi lapangan dengan logo Batas Kota Arena di belakangnya', ratio: 'sm:aspect-square' },
  { id: 7, alt: 'Lapangan Batas Kota Arena dilihat dari udara di belakang gawang', ratio: 'sm:aspect-video' },
  { id: 8, alt: 'Pemandangan seluruh lapangan dan area sekitar Batas Kota Arena', ratio: 'sm:aspect-video' },
];

export function ActivityGallery() {
  return (
    <section id="activities" className="border-t border-terracotta-200 bg-porcelain py-16 dark:border-terracotta-900 dark:bg-black md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-terracotta-700 dark:text-terracotta-300">Batas Kota Arena · Mini Soccer</span>
            <h2 id="arena-title" className="mt-3 text-3xl font-bold uppercase text-ink dark:text-white sm:text-5xl">Batas Kota Arena.<br />Tempat main tim lo.</h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">Lapangan mini soccer di Kota Selong, buat latihan bareng atau tanding antartim. Main dari pagi sampai malam, dengan pilihan tambahan wasit dan dokumentasi. Pilih tanggal dan jam main di bawah.</p>
            <a href="#booking" className="mt-3 inline-flex min-h-11 items-center gap-2 border-b border-terracotta-600 text-sm font-semibold text-terracotta-700 transition-colors hover:text-ink dark:text-terracotta-300 dark:hover:text-white">Cari jam main <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </div>
        <div id="activity-photos" role="region" tabIndex={0} aria-label="Galeri Batas Kota Arena, geser untuk melihat foto berikutnya" className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:block sm:columns-2 sm:gap-5 sm:overflow-visible lg:columns-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="w-[84%] shrink-0 snap-start break-inside-avoid sm:mb-5 sm:w-auto">
              <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-md ${photo.ratio}`}>
                <Image src={`/images/arena/arena-${photo.id}.jpg`} alt={photo.alt} fill sizes="(max-width: 640px) 84vw, (max-width: 1024px) 50vw, 400px" className="object-contain" />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
