'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Flag,
  MessageCircle,
} from 'lucide-react';
import { VENUE_IMAGES } from '@/lib/venueAssets';

const cancellationRules = [
  'Pembayaran yang sudah masuk dianggap hangus jika booking dibatalkan.',
  'Pembatalan atau perubahan jadwal pada hari bermain membuat pembayaran dianggap hangus.',
  'Perubahan dari jam premium ke reguler tidak mendapatkan refund selisih harga.',
  'Perubahan dari jam reguler ke premium dikenakan biaya tambahan.',
];

const bookingRules = [
  'Booking dapat dilakukan melalui website atau WhatsApp admin.',
  'Slot tersedia tampil netral, pending tampil kuning, dan booking terkonfirmasi tampil merah.',
  'Booking pending diberi waktu 15 menit untuk menyelesaikan pembayaran.',
  'Slot kembali tersedia jika pembayaran tidak diselesaikan dalam batas waktu.',
  'Booking terkonfirmasi berarti pembayaran sudah diterima dan jadwal siap dimainkan.',
];

function RuleList({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'warning' }) {
  return (
    <ol className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {items.map((item, index) => (
        <li key={item} className="grid grid-cols-[32px_1fr] gap-3 py-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          <span className={`font-mono text-xs font-bold ${tone === 'warning' ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>{String(index + 1).padStart(2, '0')}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const teamName = searchParams.get('team') || '-';
  const date = searchParams.get('date') || '-';
  const time = searchParams.get('time') || '-';
  const price = searchParams.get('price') || '-';
  const phone = searchParams.get('phone') || '-';
  const bookingId = searchParams.get('bookingId') || '-';
  const hasDokumentasi = searchParams.get('dokumentasi') === '1';
  const hasWasit = searchParams.get('wasit') === '1';

  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'Bank Mandiri';
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '1610016475977';
  const bankAccountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'CV BATAS KOTA POINT';
  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '08123456789';
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    await navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const whatsAppNumber = adminWhatsApp.replace(/^0/, '62').replace(/\D/g, '');
  const whatsAppText = encodeURIComponent(
    `Halo, saya ingin konfirmasi pembayaran booking atas nama ${teamName}, nomor HP ${phone}, Booking ID ${bookingId}.`,
  );

  return (
    <div className="public-site min-h-screen bg-neutral-50 text-neutral-950 dark:bg-black dark:text-neutral-100">
      <header className="border-b border-neutral-700 bg-black text-white backdrop-blur-md dark:border-neutral-800 dark:bg-black">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src={VENUE_IMAGES.logo} alt="Batas Kota Point" width={44} height={44} className="rounded-md" />
            <span className="flex flex-col"><strong className="text-sm uppercase sm:text-base">Batas Kota Point</strong><span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">Arena · Pora.sch · Padel</span></span>
          </Link>
          <Link href="/schedule" className="flex items-center gap-2 rounded-md border border-neutral-700 px-3.5 py-2 text-xs font-semibold transition-colors hover:border-neutral-500 hover:text-neutral-300"><ArrowLeft className="h-4 w-4" />Kembali</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <section>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"><CheckCircle2 className="h-6 w-6" /></div>
            <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Booking berhasil dibuat</p>
            <h1 className="mt-3 max-w-xl text-4xl font-medium leading-tight sm:text-6xl">Sampai ketemu di lapangan.</h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">Jadwal Anda sedang ditahan dengan status pending. Selesaikan pembayaran dan kirim bukti transfer ke admin agar booking dikonfirmasi.</p>

            <div className="mt-10 border-y border-[#c9c5ba] py-6 dark:border-neutral-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">Booking ID</span>
                <strong className="font-mono text-lg">{bookingId}</strong>
              </div>
              <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <div><dt className="text-[10px] uppercase tracking-wider text-neutral-500">Nama tim</dt><dd className="mt-1 text-sm font-semibold">{teamName}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-neutral-500">WhatsApp</dt><dd className="mt-1 font-mono text-sm">{phone}</dd></div>
                <div><dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500"><Calendar className="h-3 w-3" />Tanggal</dt><dd className="mt-1 text-sm font-semibold">{date}</dd></div>
                <div><dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500"><Clock className="h-3 w-3" />Jadwal</dt><dd className="mt-1 font-mono text-sm">{time}</dd></div>
              </dl>

              {(hasDokumentasi || hasWasit) && (
                <div className="mt-6 border-t border-[#c9c5ba] pt-5 dark:border-neutral-700">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500">Layanan tambahan</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {hasDokumentasi && <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"><Camera className="h-3.5 w-3.5" />Dokumentasi</span>}
                    {hasWasit && <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"><Flag className="h-3.5 w-3.5" />Wasit</span>}
                  </div>
                  <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">Harga layanan tambahan dikonfirmasi melalui WhatsApp dan belum termasuk total lapangan.</p>
                </div>
              )}

              <div className="mt-6 flex items-end justify-between border-t border-[#c9c5ba] pt-5 dark:border-neutral-700"><span className="text-sm font-semibold">Total lapangan</span><strong className="font-mono text-2xl">{price}</strong></div>
            </div>
          </section>

          <aside className="self-start rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            <div className="flex items-center gap-3"><CreditCard className="h-5 w-5" /><h2 className="text-xl font-bold">Instruksi pembayaran</h2></div>
            <p className="mt-3 text-sm text-neutral-500">Transfer ke rekening resmi berikut, lalu kirim bukti pembayaran kepada admin.</p>
            <div className="mt-6 space-y-5 border-y border-neutral-200 py-5 dark:border-neutral-800">
              <div><p className="text-[10px] uppercase tracking-wider text-neutral-500">Nama penerima</p><p className="mt-1 font-semibold">{bankAccountName}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-neutral-500">Bank</p><p className="mt-1 font-semibold">{bankName.toUpperCase()}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-neutral-500">Nomor rekening</p><div className="mt-1 flex items-center justify-between gap-3"><strong className="break-all font-mono text-xl">{bankAccount}</strong><button type="button" onClick={copyAccount} aria-label="Salin nomor rekening" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">{copied ? <Check className="h-4 w-4 text-neutral-600" /> : <Copy className="h-4 w-4" />}</button></div></div>
            </div>

            <div className="mt-5 flex gap-3 rounded-md border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"><AlertTriangle className="h-4 w-4 shrink-0" /><p>Transfer hanya ke rekening atas nama <strong>CV BATAS KOTA POINT</strong>. Pastikan nama penerima sesuai sebelum transfer.</p></div>
            <a href={`https://wa.me/${whatsAppNumber}?text=${whatsAppText}`} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 py-3 text-xs font-bold uppercase text-white transition-colors hover:bg-neutral-700"><MessageCircle className="h-4 w-4" />Konfirmasi via WhatsApp</a>
            <p className="mt-3 text-center font-mono text-[10px] text-neutral-500">Admin WhatsApp: {adminWhatsApp}</p>
          </aside>
        </div>

        <section className="mt-16 grid gap-10 border-t border-[#c9c5ba] pt-12 dark:border-neutral-700 lg:grid-cols-2">
          <div><p className="font-mono text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400">Peraturan pembatalan</p><h2 className="mt-3 text-2xl font-bold">Perubahan dan cancel</h2><RuleList items={cancellationRules} tone="warning" /></div>
          <div><p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Status jadwal</p><h2 className="mt-3 text-2xl font-bold">Cara booking bekerja</h2><RuleList items={bookingRules} /></div>
        </section>

        <section className="mt-12 flex flex-col justify-between gap-5 border-t border-[#c9c5ba] py-8 dark:border-neutral-700 sm:flex-row sm:items-center">
          <div><p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Periode booking</p><p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">Minimum order 1 jam sebelum bermain. Booking kurang dari 1 jam hanya dapat dilakukan melalui WhatsApp admin. Semua booking wajib dilunasi.</p></div>
          <Link href="/schedule" className="flex min-h-12 shrink-0 items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-950 dark:text-white"><ArrowLeft className="h-4 w-4" />Kembali ke booking</Link>
        </section>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500 dark:bg-black">Memuat booking...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}
