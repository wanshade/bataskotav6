import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const photos = [
  { id: 6, alt: 'Pemandangan udara lapangan Batas Kota Arena pada siang hari', width: 1280, height: 720 },
  { id: 1, alt: 'Pertandingan malam di Batas Kota Arena', width: 640, height: 427 },
  { id: 3, alt: 'Foto bersama tim di Batas Kota Arena', width: 640, height: 427 },
  { id: 2, alt: 'Dua pemain memperebutkan bola di Batas Kota Arena', width: 480, height: 640 },
  { id: 4, alt: 'Penjaga gawang di Batas Kota Arena', width: 480, height: 640 },
  { id: 5, alt: 'Pemain di sisi lapangan Batas Kota Arena', width: 640, height: 640 },
  { id: 7, alt: 'Lapangan Batas Kota Arena dilihat dari belakang gawang', width: 1280, height: 720 },
  { id: 8, alt: 'Lapangan dan kawasan sekitar Batas Kota Arena', width: 1280, height: 720 },
];

export function ActivityGallery() {
  return (
    <section id="activities" className="bg-[#e9e7e1] py-20 text-[#111213] sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <div className="flex flex-col justify-between gap-8 border-b border-black/20 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm text-black/55">01 / Mini Soccer</p>
            <h2 id="arena-title" className="mt-3 max-w-3xl text-5xl font-medium leading-[1.05] sm:text-7xl">Batas Kota Arena.</h2>
          </div>
          <div className="max-w-md">
            <p className="text-base leading-7 text-black/65">Lapangan untuk latihan, pertandingan, dan waktu bersama tim. Pilih sesi bermain dengan opsi wasit dan dokumentasi saat reservasi.</p>
            <Link id="arena-book-cta" href="/schedule" className="mt-5 inline-flex min-h-11 items-center gap-5 border-b border-black/50 text-sm font-medium transition-colors hover:border-black hover:text-[#c64712]">
              Reservasi Arena <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div id="activity-photos" role="region" tabIndex={0} aria-label="Galeri Batas Kota Arena" className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:block sm:columns-2 sm:gap-5 sm:overflow-visible sm:pb-0 lg:columns-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="w-[85%] shrink-0 snap-start break-inside-avoid sm:mb-5 sm:w-auto">
              <div className="aspect-[4/3] w-full bg-[#d5d3cd] sm:aspect-auto sm:bg-transparent">
                <Image
                  src={`/images/arena/arena-${photo.id}.jpg`}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 420px"
                  className="block h-full w-full object-contain sm:h-auto"
                />
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-black/20 pt-5 text-xs text-black/55">
          <span>Foto Batas Kota Arena</span>
          <span>Operasional setiap hari / 06:00 - 24:00 WITA</span>
        </div>
      </div>
    </section>
  );
}
