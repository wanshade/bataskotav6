import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { adminWhatsAppUrl } from '@/lib/contact';

const matchPhotos = [
  { id: 1, alt: 'Players competing during an evening match at Batas Kota Arena', width: 640, height: 427 },
  { id: 2, alt: 'Two players challenging for the ball at Batas Kota Arena', width: 480, height: 640 },
  { id: 3, alt: 'A team gathered for a photo on the Batas Kota Arena pitch', width: 640, height: 427 },
  { id: 4, alt: 'A goalkeeper on the pitch at Batas Kota Arena', width: 480, height: 640 },
  { id: 5, alt: 'A player beside the pitch at Batas Kota Arena', width: 640, height: 640 },
];

export function MatchdayHighlights() {
  return (
    <section id="matchday" aria-labelledby="matchday-title" className="bg-[#111213] py-20 text-[#f4f2ed] sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <div className="grid gap-7 border-b border-white/20 pb-9 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="text-sm text-[#ff6a1a]">Matchday at Batas Kota Arena</p>
            <h2 id="matchday-title" className="mt-4 max-w-xl text-4xl font-medium leading-[1.12] sm:text-[52px]">Where the community plays.</h2>
          </div>
          <p className="max-w-lg text-base leading-8 text-white/65">
            The Batas Kota story comes to life on the pitch. These match moments bring together the players, teams, and shared energy that make the Arena part of our community in Selong.
          </p>
        </div>

        <div className="mt-9 columns-2 gap-3 sm:gap-5 lg:columns-3">
          {matchPhotos.map((photo) => (
            <figure key={photo.id} className="mb-3 break-inside-avoid sm:mb-5">
              <Image
                src={`/images/arena/arena-${photo.id}.jpg`}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 1024px) 50vw, 420px"
                className="block h-auto w-full"
              />
            </figure>
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-6 border-t border-white/20 pt-7 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-medium">Bring your next match to Batas Kota.</h3>
            <p className="mt-2 max-w-lg text-sm leading-7 text-white/60">Talk to our team about match arrangements, community activities, and collaboration.</p>
          </div>
          <a href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-fit shrink-0 items-center gap-5 border-b border-white/40 text-sm font-medium transition-colors hover:border-[#ff6a1a] hover:text-[#ff6a1a]">
            Connect with our team <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
