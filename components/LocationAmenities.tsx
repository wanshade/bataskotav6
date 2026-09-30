import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { adminWhatsAppDisplay, adminWhatsAppUrl } from '@/lib/contact';

export function LocationAmenities() {
  return (
    <section id="location" aria-labelledby="location-title" className="bg-[#111213] py-20 text-[#f4f2ed] sm:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-16">
        <div className="lg:col-span-5">
          <span className="text-sm text-[#ff6a1a]">Kunjungi kami</span>
          <h2 id="location-title" className="mt-4 text-5xl font-medium leading-[1.05] sm:text-6xl">Bertemu di<br />Batas Kota.</h2>
          <address className="mt-7 max-w-md text-base not-italic leading-8 text-white/65">Jl. TGH. Zainuddin Abdul Majid, Pancor, Kec. Sukamulia, Kabupaten Lombok Timur, Nusa Tenggara Bar. 83652</address>
          <dl className="mt-8 grid gap-6 border-y border-white/20 py-6 sm:grid-cols-2">
            <div><dt className="text-xs text-white/45">Operational Daily</dt><dd className="mt-2 text-sm font-medium">06:00 - 24:00 WITA</dd></div>
            <div><dt className="text-xs text-white/45">Kontak</dt><dd className="mt-2 text-sm font-medium"><a href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{adminWhatsAppDisplay}</a></dd></div>
          </dl>
          <div className="mt-7 flex flex-wrap gap-6">
            <a id="open-google-maps-btn" href="https://maps.app.goo.gl/h6W1PFLEWQmoEKKbA" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-5 border-b border-white/60 text-sm font-medium hover:text-[#ff6a1a]">Buka Google Maps<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            <a id="location-direct-wa" href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-5 border-b border-white/30 text-sm text-white/65 hover:text-white">Hubungi kami<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </div>
        <figure className="relative min-h-[320px] overflow-hidden bg-[#27292a] sm:min-h-[420px] lg:col-span-7 lg:min-h-[480px]">
          <Image src="/images/arena/arena-8.jpg" alt="Foto udara Batas Kota Arena dan lingkungan di Pancor" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          <figcaption className="absolute bottom-0 left-0 bg-[#111213] px-4 py-3 text-xs text-white sm:px-6">Batas Kota Arena / Pancor, Lombok Timur</figcaption>
        </figure>
      </div>
    </section>
  );
}
