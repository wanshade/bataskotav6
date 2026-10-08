import Image from 'next/image';
import { Dancing_Script } from 'next/font/google';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const dancingScript = Dancing_Script({ subsets: ['latin'], weight: '600', display: 'swap' });

const brands = [
  {
    name: 'Batas Kota Arena',
    category: '01 / Mini Soccer',
    description: 'Where teams come together on the pitch. The Arena is open, with playing sessions available to book online.',
    logo: '/images/brands/batas-kota-arena-logo.png',
    logoAlt: 'Batas Kota Arena Mini Soccer logo',
    surface: 'bg-[#f4f2ed]',
    href: '#mini-soccer',
    action: 'Discover the Arena',
  },
  {
    name: 'Pora Social House',
    category: '02 / Social House',
    description: 'A place to slow down, stop by, and reconnect after the game. Pora.sch is coming soon to Batas Kota Point.',
    logo: '/images/brands/pora-social-house-logo.png',
    logoAlt: 'Pora Social House logo',
    surface: 'bg-[#f4f2ed]',
    href: '#social-house',
    action: 'Discover Pora.sch',
  },
];

export function Facilities() {
  return (
    <section id="facilities" aria-labelledby="spaces-title" className="bg-[#111213] py-20 text-[#f4f2ed] sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <div>
          <h2 id="spaces-title" className="max-w-5xl text-4xl font-medium leading-[1.08] sm:text-[56px]">
            Batas Kota Point.
            <span className={`${dancingScript.className} mt-1 block text-[48px] leading-[1.2] sm:mt-2 sm:text-[72px]`}>The Social House</span>
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
            Batas Kota is all about passion, happiness &amp; togetherness. We bring sport, coffee, and community through the new lifestyle &amp; trends.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
            This year, we are introducing Pora Cafe where people gather &amp; share love
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-8">
          {brands.map((brand) => (
            <article key={brand.name} className="border-t border-white/20 pt-5">
              <div className={`flex h-52 items-center justify-center sm:h-64 ${brand.surface}`}>
                <Image src={brand.logo} alt={brand.logoAlt} width={240} height={240} sizes="(max-width: 640px) 180px, 240px" className="h-40 w-40 object-contain sm:h-52 sm:w-52" />
              </div>
              <div className="mt-6 flex items-center justify-between gap-4 text-xs text-white/50">
                <span>{brand.category}</span>
                {brand.name === 'Pora Social House' && <span>Coming Soon</span>}
              </div>
              <h3 className="mt-3 text-2xl font-medium sm:text-4xl">{brand.name}</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/60 sm:text-base">{brand.description}</p>
              <p className="mt-4 text-xs text-white/50">Part of Batas Kota Point</p>
              <a href={brand.href} className="mt-5 inline-flex min-h-11 items-center gap-5 border-b border-white/40 text-sm font-medium transition-colors hover:border-[#ff6a1a] hover:text-[#ff6a1a]">
                {brand.action} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>

        <a href="#padel" className="group mt-16 flex min-h-20 items-center justify-between gap-5 border-y border-white/20 py-5 text-sm transition-colors hover:text-[#ff6a1a]">
          <span className="hidden text-white/45 min-[400px]:inline">Up next</span>
          <span className="mr-auto text-lg font-medium sm:text-2xl">Padel</span>
          <span className="shrink-0 whitespace-nowrap text-xs text-white/45">Coming Soon</span>
          <ArrowDownRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
        </a>
      </div>
    </section>
  );
}
