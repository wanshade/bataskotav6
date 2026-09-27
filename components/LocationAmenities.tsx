import { ArrowUpRight, Clock, MapPin, MessageCircle } from 'lucide-react';
import { adminWhatsAppDisplay, adminWhatsAppUrl } from '@/lib/contact';

export function LocationAmenities() {
  return (
    <section id="location" aria-labelledby="location-title" className="border-t border-terracotta-900 bg-black py-16 text-white md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:px-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-terracotta-300">Pancor, Lombok Timur</span>
          <h2 id="location-title" className="mt-3 text-3xl font-bold sm:text-4xl">Mampir ke<br />Batas Kota Point.</h2>
          <div className="mt-8 flex items-start gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-terracotta-300" />
            <address className="max-w-sm text-sm not-italic leading-7 text-neutral-300">
              Jl. TGH. Zainuddin Abdul Majid, Pancor, Kec. Sukamulia, Kabupaten Lombok Timur, Nusa Tenggara Bar. 83652
            </address>
          </div>
          <dl className="mt-6 divide-y divide-neutral-800 border-y border-neutral-800">
            <div className="flex items-start gap-4 py-5">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-300" />
              <div>
                <dt className="text-xs text-neutral-400">Buka setiap hari</dt>
                <dd className="mt-1 text-sm font-semibold">06:00 &ndash; 24:00 WITA</dd>
              </div>
            </div>
            <div className="flex items-start gap-4 py-5">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-300" />
              <div>
                <dt className="text-xs text-neutral-400">WhatsApp admin</dt>
                <dd className="mt-1 text-sm font-semibold"><a href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta-300">{adminWhatsAppDisplay}</a></dd>
              </div>
            </div>
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <a id="open-google-maps-btn" href="https://maps.app.goo.gl/h6W1PFLEWQmoEKKbA" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-terracotta-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-700">
              Petunjuk arah<ArrowUpRight className="h-4 w-4" />
            </a>
            <a id="location-direct-wa" href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-neutral-700 px-5 py-3 text-sm font-semibold transition-colors hover:border-terracotta-400 hover:text-terracotta-300">
              <MessageCircle className="h-4 w-4" />Hubungi admin
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
          <iframe
            title="Peta lokasi Batas Kota Arena di Pancor"
            src="https://www.google.com/maps?q=-8.6422015,116.5093622&z=16&output=embed"
            className="block h-[340px] w-full border-0 sm:h-[420px] lg:h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
