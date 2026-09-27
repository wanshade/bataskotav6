'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_SCHEDULE, formatPrice, type ScheduleData } from '@/lib/schedule';

export function PricingTable() {
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/pricing', { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.schedule) setSchedule(data.schedule);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to load public pricing:', error);
        }
      });
    return () => controller.abort();
  }, []);

  const dayRates = useMemo(() => {
    const groups = [
      { key: 'Senin_sd_Kamis', day: 'Senin–Kamis' },
      { key: 'Jumat', day: 'Jumat' },
      { key: 'Sabtu', day: 'Sabtu' },
      { key: 'Minggu', day: 'Minggu' },
    ];

    return groups.map(({ key, day }) => {
      const prices = (schedule[key] || []).map((item) => item.harga).filter((price) => price > 0);
      const min = prices.length ? Math.min(...prices) : 0;
      const max = prices.length ? Math.max(...prices) : 0;
      return { day, range: min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}` };
    });
  }, [schedule]);

  return (
    <section id="rates" className="border-t border-terracotta-300 bg-terracotta-100 py-16 dark:border-terracotta-900 dark:bg-terracotta-950/40 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <div><span className="font-mono text-xs uppercase tracking-widest text-terracotta-700 dark:text-terracotta-300">Batas Kota Arena · Mini Soccer</span><h2 className="mt-3 text-3xl font-bold uppercase tracking-tight sm:text-5xl">Pilih jamnya.<br />Ajak tim lo.</h2><p className="mt-4 text-sm text-neutral-700 dark:text-neutral-400">Satu booking berlaku untuk satu sesi main selama 2 jam. Harga pastinya mengikuti hari dan jam yang lo pilih.</p></div>
        <div className="rounded-xl border border-terracotta-300 bg-white p-6 dark:border-terracotta-900 dark:bg-black sm:p-8">
          <h3 className="text-xl font-bold">Batas Kota Arena</h3>
          <p className="mt-1 text-xs text-neutral-500">Kisaran tarif per sesi 2 jam</p>
          <div className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
            {dayRates.map((rate) => (
              <div key={rate.day} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-sm">{rate.day}</p>
                <p className="font-mono text-sm font-bold">{rate.range}</p>
              </div>
            ))}
          </div>
          <a href="#booking" className="mt-6 flex items-center justify-center gap-3 rounded-md bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-700 dark:bg-terracotta-600 dark:text-white dark:hover:bg-terracotta-500">Booking Batas Kota Arena<ArrowRight className="h-4 w-4" /></a>
        </div>
      </div>
    </section>
  );
}
