'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, Calendar, Clock, Search, X } from 'lucide-react';
import type { Booking } from '@/lib/schema';

interface SearchBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchBookingModal({ isOpen, onClose }: SearchBookingModalProps) {
  const [bookingId, setBookingId] = useState('');
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = bookingId.trim().toUpperCase();
    if (!normalizedId) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(normalizedId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 404 ? 'Booking tidak ditemukan.' : data.error || 'Booking gagal dicari.');
      setResult(data.booking);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Booking gagal dicari.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="search-booking-title" onMouseDown={onClose}>
      <div className="relative w-full max-w-md rounded-lg border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-900 dark:bg-neutral-900" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Tutup pencarian" className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"><X className="h-5 w-5" /></button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Status reservasi</span>
        <h2 id="search-booking-title" className="mt-2 text-2xl font-bold uppercase text-neutral-900 dark:text-white">Cek booking</h2>
        <p className="mt-2 pr-8 text-xs leading-relaxed text-neutral-500">Masukkan Booking ID yang diterima setelah melakukan pemesanan.</p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input autoFocus value={bookingId} onChange={(event) => setBookingId(event.target.value)} placeholder="Contoh: BK-ABC123" className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm uppercase text-neutral-900 outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-400" />
          <button type="submit" disabled={isLoading} aria-label="Cari booking" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-neutral-950 text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-500 dark:text-white"><Search className="h-4 w-4" /></button>
        </form>

        {error && <div role="alert" className="mt-5 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

        {result && (
          <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="font-mono text-sm text-neutral-900 dark:text-white">{result.bookingId}</strong>
              <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase ${result.status === 'confirmed' ? 'bg-neutral-200 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-300' : result.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>{result.status}</span>
            </div>
            <h3 className="mt-4 font-bold text-neutral-900 dark:text-white">{result.teamName}</h3>
            <div className="mt-3 space-y-2 font-mono text-xs text-neutral-600 dark:text-neutral-300">
              <p className="flex gap-2"><Calendar className="h-3.5 w-3.5 shrink-0 text-neutral-400" />{result.bookingDate}</p>
              <p className="flex gap-2"><Clock className="h-3.5 w-3.5 shrink-0 text-neutral-400" />{result.timeSlot}</p>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">Total booking</span>
              <strong className="font-mono text-base text-neutral-900 dark:text-white">{result.price}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
