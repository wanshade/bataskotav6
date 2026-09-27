'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Apa itu Batas Kota Arena?',
    answer: 'Batas Kota Arena adalah lapangan mini soccer di dalam kawasan Batas Kota Point. Semua pilihan tanggal dan jam pada booking mengacu ke arena yang sama.',
  },
  {
    question: 'Bagaimana cara booking Batas Kota Arena?',
    answer: 'Pilih tanggal, jam bermain, dan perlengkapan tambahan jika diperlukan. Isi data pemesan, lalu lanjutkan melalui tombol booking yang tersedia.',
  },
  {
    question: 'Apakah Pora Social House sudah buka?',
    answer: 'Pora.sch atau Pora Social House masih Coming Soon. Gambar yang ditampilkan adalah preview konsepnya. Menu, jam buka, dan reservasi belum tersedia.',
  },
  {
    question: 'Apakah lapangan padel sudah bisa dibooking?',
    answer: 'Belum. Padel masih Coming Soon. Saat ini booking hanya tersedia untuk Batas Kota Arena.',
  },
  {
    question: 'Berapa tarif booking Batas Kota Arena?',
    answer: 'Setiap sesi berlangsung 2 jam. Harganya menyesuaikan hari dan jam yang dipilih, mulai Rp700.000 sampai Rp1.200.000 per sesi. Harga pasti langsung terlihat saat memilih jadwal.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="border-t border-terracotta-200 bg-porcelain py-16 dark:border-terracotta-900 dark:bg-black md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block mb-2">
            Sebelum main
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
            Yang sering ditanyakan
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Info booking Batas Kota Arena dan perkembangan fasilitas Batas Kota Point.
          </p>
        </div>

        <div className="divide-y divide-terracotta-200 border-y border-terracotta-200 dark:divide-neutral-800 dark:border-neutral-800">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  id={`faq-toggle-${idx}`}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left py-2 focus:outline-none group"
                >
                  <span className="text-base font-semibold text-neutral-900 transition-colors group-hover:text-terracotta-600 dark:text-white dark:group-hover:text-terracotta-300">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pr-6">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
