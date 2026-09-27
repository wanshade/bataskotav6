'use client';

import Image, { type StaticImageData } from 'next/image';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CAFE_GALLERY, VENUE_IMAGES } from '@/lib/venueAssets';

interface Space {
  id: string;
  number: string;
  name: string;
  status?: string;
  description: string;
  details?: string[];
  image: StaticImageData | string;
  alt: string;
  imagePosition: string;
}

const SPACES: Space[] = [
  {
    id: 'social-house',
    number: '01',
    name: 'Pora.sch',
    status: 'Coming Soon',
    description: 'Pora Social House. Buat ngopi sebentar, duduk lebih lama, atau lanjut ngobrol setelah main.',
    details: [
      'Ruang duduk di dalam dan area terbuka',
      'Tempat singgah sebelum atau setelah main',
      'Suasana hijau yang menyatu dengan kawasan olahraga',
    ],
    image: CAFE_GALLERY[1].image,
    alt: 'Visual konsep Pora Social House di Batas Kota Point, Kota Selong',
    imagePosition: 'center',
  },
  {
    id: 'mini-soccer',
    number: '02',
    name: 'Batas Kota Arena',
    description: 'Ajak tim, pilih jamnya, lalu ketemu di lapangan.',
    image: '/images/arena/arena-6.jpg',
    alt: 'Lapangan Batas Kota Arena di Kota Selong dilihat dari udara',
    imagePosition: 'center',
  },
  {
    id: 'padel',
    number: '03',
    name: 'Padel',
    status: 'Coming Soon',
    description: 'Tempat baru buat rally santai sampai tanding serius bareng teman.',
    image: VENUE_IMAGES.venueOverview,
    alt: 'Visual konsep area padel Batas Kota Point di Kota Selong',
    imagePosition: '12% center',
  },
];

export function Facilities() {
  const [activeSpace, setActiveSpace] = useState(0);
  const selectedSpace = SPACES[activeSpace];

  return (
    <section
      id="facilities"
      aria-labelledby="spaces-title"
      className="border-b border-terracotta-200 bg-terracotta-50 py-20 text-ink dark:border-terracotta-900 dark:bg-neutral-950 dark:text-neutral-100 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            Di dalam Batas Kota
          </p>
          <div>
            <h2
              id="spaces-title"
              className="max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
            >
              Main dulu. Ngopi belakangan. Atau sebaliknya.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Pora Social House, Batas Kota Arena, dan padel kami kumpulkan di satu tempat—biar hari yang tadinya cuma mau main bisa lanjut ke mana-mana.
            </p>
          </div>
        </div>

        <div className="mt-14 grid border-t border-terracotta-200 dark:border-neutral-700 lg:mt-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            {SPACES.map((space, index) => {
              const isActive = index === activeSpace;

              return (
                <div
                  key={space.id}
                  id={space.id === 'mini-soccer' ? 'arena-preview' : space.id === 'padel' ? 'padel-preview' : space.id}
                  className="border-b border-terracotta-200 dark:border-neutral-700"
                  onMouseEnter={() => setActiveSpace(index)}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-controls="space-preview"
                    onClick={() => setActiveSpace(index)}
                    onFocus={() => setActiveSpace(index)}
                    className="group w-full py-6 text-left sm:py-7"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
                        <span className="text-[10px] tabular-nums text-neutral-500 dark:text-neutral-400">
                          {space.number}
                        </span>
                        <span
                          className={`text-2xl tracking-[-0.03em] transition-colors sm:text-3xl ${
                            isActive
                              ? 'text-terracotta-700 dark:text-terracotta-300'
                              : 'text-neutral-500 group-hover:text-terracotta-700 dark:text-neutral-500 dark:group-hover:text-terracotta-300'
                          }`}
                        >
                          {space.name}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`ml-8 mt-3 block max-w-sm text-sm leading-relaxed text-neutral-600 transition-[opacity,max-height] duration-300 dark:text-neutral-400 sm:ml-12 ${
                        isActive ? 'max-h-20 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
                      }`}
                    >
                      {space.description}
                    </span>
                  </button>

                  {space.details && isActive ? (
                    <div className="mb-7 ml-8 border-l border-terracotta-300 pl-4 sm:ml-12">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                        Yang sedang disiapkan
                      </p>
                      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-sm">
                        {space.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {space.id === 'mini-soccer' && isActive ? (
                    <a
                      href="#mini-soccer"
                      className="group mb-7 ml-8 inline-flex items-center gap-4 border-b border-terracotta-500 pb-1 text-sm font-medium text-terracotta-700 hover:border-terracotta-800 dark:border-terracotta-400 dark:text-terracotta-300 dark:hover:border-terracotta-200 sm:ml-12"
                    >
                      Kenali Batas Kota Arena
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>

          <figure id="space-preview" className="order-1 py-8 lg:order-2 lg:py-10">
            <div className="relative aspect-[4/3] overflow-hidden bg-terracotta-100 sm:aspect-[16/10] lg:aspect-[4/3]">
              <Image
                key={selectedSpace.id}
                src={selectedSpace.image}
                alt={selectedSpace.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover"
                style={{ objectPosition: selectedSpace.imagePosition }}
              />
              {selectedSpace.status && (
                <span className="absolute right-4 top-4 rounded-sm bg-black/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white sm:right-6 sm:top-6">
                  {selectedSpace.status}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/60 to-transparent px-5 pb-5 pt-16 text-white sm:px-7 sm:pb-7">
                <p className="text-xl font-medium tracking-tight sm:text-2xl">{selectedSpace.name}</p>
                <p className="text-[10px]">{selectedSpace.id === 'mini-soccer' ? 'Batas Kota Arena' : 'Visual konsep'}</p>
              </div>
            </div>
            <figcaption className="mt-3 flex justify-between gap-4 text-[10px] text-neutral-500 dark:text-neutral-400">
              <span>Batas Kota Point · Kota Selong</span>
              <span>{selectedSpace.number} / 03</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
