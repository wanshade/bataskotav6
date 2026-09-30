import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function BrandBookingCta() {
  return (
    <section aria-labelledby="booking-prompt-title" className="bg-[#ff6a1a] py-20 text-[#111213] sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <p className="text-sm font-medium">Batas Kota Arena / Mini Soccer</p>
        <div className="mt-5 flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="booking-prompt-title" className="max-w-4xl text-5xl font-medium leading-[0.98] sm:text-7xl lg:text-[88px]">Sampai jumpa<br />di lapangan.</h2>
          <Link href="/schedule" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-6 self-start rounded-sm bg-[#111213] px-7 text-sm font-medium text-white transition-colors hover:bg-white hover:text-[#111213] lg:self-auto">
            Pilih jadwal bermain <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
          </Link>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-black/25 pt-5 text-sm text-black/70">
          <span>Reservasi online Batas Kota Arena</span>
          <span>Setiap hari, 06:00 - 24:00 WITA</span>
        </div>
      </div>
    </section>
  );
}
