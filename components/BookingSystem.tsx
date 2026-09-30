'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Info,
  Shield,
  Users,
} from 'lucide-react';
import {
  DEFAULT_SCHEDULE,
  type ScheduleData,
  formatPrice,
  getDayKey,
  getExpandedSlots,
  hasTimeOverlap,
} from '@/lib/schedule';

type SlotState = 'available' | 'selected' | 'pending' | 'confirmed' | 'passed';
type PublicBooking = {
  bookingDate: string;
  timeSlot: string;
  status: string;
};

const DATES_PER_PAGE = 5;

export function BookingSystem() {
  const router = useRouter();
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 15 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [datePage, setDatePage] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [addDokumentasi, setAddDokumentasi] = useState(false);
  const [addWasit, setAddWasit] = useState(false);
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datePageCount = Math.ceil(dates.length / DATES_PER_PAGE);
  const visibleDates = dates.slice(datePage * DATES_PER_PAGE, (datePage + 1) * DATES_PER_PAGE);
  const dateRangeLabel = `${visibleDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${visibleDates[visibleDates.length - 1].toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const formattedDate = selectedDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/pricing', { signal: controller.signal, cache: 'no-store' })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error('Harga gagal dimuat.')),
      )
      .then((pricingData) => {
        if (pricingData.schedule) setSchedule(pricingData.schedule);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Harga gagal dimuat.');
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    fetch(`/api/bookings?date=${encodeURIComponent(formattedDate)}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error('Jadwal gagal dimuat.')),
      )
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Jadwal gagal dimuat.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [formattedDate]);

  const availableSlots = useMemo(
    () => getExpandedSlots(getDayKey(selectedDate), schedule),
    [schedule, selectedDate],
  );

  const selectedSlotData = availableSlots.filter((slot) => selectedSlots.includes(slot.label));
  const totalPrice = selectedSlotData.reduce((total, slot) => total + slot.price, 0);

  const isSlotPassed = (slotLabel: string) => {
    const now = new Date();
    if (selectedDate.toDateString() !== now.toDateString()) return false;

    const [start] = slotLabel.split(' - ');
    const [hour, minute = '0'] = start.split('.');
    const slotTime = new Date(selectedDate);
    slotTime.setHours(Number(hour), Number(minute), 0, 0);
    return slotTime <= now;
  };

  const getSlotState = (slotLabel: string): SlotState => {
    if (isSlotPassed(slotLabel)) return 'passed';
    if (selectedSlots.includes(slotLabel)) return 'selected';

    const booking = bookings.find(
      (item) =>
        item.bookingDate === formattedDate &&
        item.timeSlot.split(', ').some((bookedSlot) => hasTimeOverlap(bookedSlot, slotLabel)) &&
        (item.status === 'confirmed' || item.status === 'pending'),
    );

    if (booking?.status === 'confirmed') return 'confirmed';
    if (booking?.status === 'pending') return 'pending';
    return 'available';
  };

  const toggleSlot = (slotLabel: string) => {
    if (getSlotState(slotLabel) !== 'available' && !selectedSlots.includes(slotLabel)) return;
    setError(null);
    setSelectedSlots((current) =>
      current.includes(slotLabel)
        ? current.filter((slot) => slot !== slotLabel)
        : [...current, slotLabel].sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b)),
    );
  };

  const handleBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teamName.trim() || !phone.trim() || selectedSlots.length === 0) {
      setError('Pilih jadwal lalu lengkapi nama tim dan nomor WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const latestResponse = await fetch(`/api/bookings?date=${encodeURIComponent(formattedDate)}`, { cache: 'no-store' });
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        const latestBookings: PublicBooking[] = latestData.bookings || [];
        setBookings(latestBookings);

        const conflict = selectedSlots.find((slot) =>
          latestBookings.some(
            (booking) =>
              booking.bookingDate === formattedDate &&
              booking.timeSlot.split(', ').some((bookedSlot) => hasTimeOverlap(bookedSlot, slot)) &&
              (booking.status === 'confirmed' || booking.status === 'pending'),
          ),
        );

        if (conflict) {
          setSelectedSlots([]);
          throw new Error(`Slot ${conflict} baru saja dipesan. Silakan pilih jadwal lain.`);
        }
      }

      const timeSlot = selectedSlots.join(', ');
      const price = formatPrice(totalPrice);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          phone: phone.trim(),
          bookingDate: formattedDate,
          timeSlot,
          price,
          dokumentasi: addDokumentasi,
          wasit: addWasit,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) setSelectedSlots([]);
        throw new Error(data.message || data.error || 'Booking gagal dibuat.');
      }

      const bookingId = data.booking?.bookingId || 'N/A';

      try {
        let customerPhone = phone.trim();
        if (customerPhone.startsWith('0')) customerPhone = `62${customerPhone.slice(1)}`;
        else if (!customerPhone.startsWith('62')) customerPhone = `62${customerPhone}`;

        const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'Bank Mandiri';
        const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '1610016475977';
        const bankAccountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'CV BATAS KOTA POINT';
        const endpoint = process.env.NEXT_PUBLIC_WHATSAPP_API_ENDPOINT || '';

        if (endpoint) {
          const addOns = [
            addDokumentasi ? 'Dokumentasi' : '',
            addWasit ? 'Wasit pertandingan' : '',
          ].filter(Boolean);
          const message = [
            '*PEMESANAN BERHASIL - BATAS KOTA POINT*',
            '',
            `Booking ID: ${bookingId}`,
            `Nama Tim: ${teamName.trim()}`,
            `Tanggal: ${formattedDate}`,
            `Waktu: ${timeSlot} (${selectedSlots.length * 2} jam)`,
            `Nomor WhatsApp: ${phone.trim()}`,
            addOns.length ? `Layanan tambahan: ${addOns.join(', ')}` : '',
            `Total Pembayaran: ${price}`,
            '',
            '*Instruksi Pembayaran*',
            `Nama Penerima: ${bankAccountName}`,
            `Bank: ${bankName.toUpperCase()}`,
            `Nomor Rekening: ${bankAccount}`,
            '',
            'Mohon kirim bukti transfer untuk konfirmasi booking.',
          ].filter(Boolean).join('\n');

          await fetch(endpoint, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'X-Api-Key': process.env.NEXT_PUBLIC_WHATSAPP_API_KEY || '',
            },
            body: JSON.stringify({
              chatId: `${customerPhone}@c.us`,
              reply_to: null,
              text: message,
              linkPreview: true,
              linkPreviewHighQuality: false,
              session: 'default',
            }),
          });
        }
      } catch (whatsAppError) {
        console.error('Failed to send WhatsApp confirmation:', whatsAppError);
      }

      const params = new URLSearchParams({
        team: teamName.trim(),
        date: formattedDate,
        time: timeSlot,
        price: formatPrice(totalPrice),
        phone: phone.trim(),
        bookingId,
        ...(addDokumentasi ? { dokumentasi: '1' } : {}),
        ...(addWasit ? { wasit: '1' } : {}),
      });
      router.push(`/booking-success?${params.toString()}`);
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : 'Booking gagal dibuat.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-900 dark:bg-black md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Batas Kota Point</Link>
          <h1 className="mt-3 text-3xl font-medium text-neutral-900 dark:text-white sm:text-4xl">Reservasi Batas Kota Arena</h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Pilih tanggal dan jadwal bermain Anda. Harga dan ketersediaan ditampilkan pada setiap sesi.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-neutral-600 dark:text-neutral-300">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />06:00 - 24:00 WITA</li>
            <li className="flex items-center gap-2"><Flag className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />Wasit opsional</li>
            <li className="flex items-center gap-2"><Camera className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />Dokumentasi opsional</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-900 dark:bg-neutral-900 sm:p-6">
              <div className="mb-5">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-500">01 · Pilih tanggal & jam</span>
              </div>

              <div className="mb-3 flex items-center justify-between gap-2">
                <p id="booking-date-range" aria-live="polite" className="flex min-w-0 items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 sm:text-sm">
                  <CalendarIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                  {dateRangeLabel}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button type="button" aria-label="Tanggal sebelumnya" title="Tanggal sebelumnya" disabled={datePage === 0} onClick={() => setDatePage((page) => Math.max(0, page - 1))} className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:opacity-25 dark:text-neutral-200 dark:hover:bg-neutral-800">
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button type="button" aria-label="Tanggal berikutnya" title="Tanggal berikutnya" disabled={datePage === datePageCount - 1} onClick={() => setDatePage((page) => Math.min(datePageCount - 1, page + 1))} className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:opacity-25 dark:text-neutral-200 dark:hover:bg-neutral-800">
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div role="group" aria-labelledby="booking-date-range" className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {visibleDates.map((date) => {
                  const selected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === dates[0].toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`${isToday ? 'Hari ini, ' : ''}${date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlots([]);
                        setError(null);
                      }}
                      className={`flex h-[88px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${selected ? 'bg-neutral-950 text-white dark:bg-neutral-500' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`}
                    >
                      <span className="text-[11px] leading-4">{date.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                      <span className="text-xl font-semibold leading-6 tabular-nums">{date.getDate()}</span>
                      <span className="text-[10px] leading-4">{isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { month: 'short' })}</span>
                    </button>
                  );
                })}
              </div>
              <div aria-hidden="true" className="mt-3 flex justify-center gap-1.5">
                {Array.from({ length: datePageCount }, (_, index) => (
                  <span key={index} className={`h-1 rounded-full transition-colors ${index === datePage ? 'w-5 bg-neutral-950 dark:bg-neutral-400' : 'w-1 bg-neutral-200 dark:bg-neutral-700'}`} />
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300">Jadwal {formattedDate}</span>
                <div className="flex flex-wrap gap-3 font-mono text-[10px] text-neutral-500">
                  <span>Tersedia</span><span className="text-amber-600">Pending</span><span className="text-rose-600">Booked</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {availableSlots.map((slot) => {
                  const state = getSlotState(slot.label);
                  const disabled = state === 'confirmed' || state === 'pending' || state === 'passed' || isLoading;
                  const styles: Record<SlotState, string> = {
                    available: 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-500',
                    selected: 'border-neutral-600 bg-neutral-950 text-white dark:border-neutral-400 dark:bg-neutral-500 dark:text-white',
                    pending: 'cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400',
                    confirmed: 'cursor-not-allowed border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400',
                    passed: 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600',
                  };
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      disabled={disabled}
                      aria-pressed={state === 'selected'}
                      onClick={() => toggleSlot(slot.label)}
                      className={`min-h-[68px] rounded-md border p-2.5 text-left transition-colors ${styles[state]}`}
                    >
                      <span className="block font-mono text-xs font-bold">{slot.label}</span>
                      <span className="mt-1 block font-mono text-[10px] opacity-80">
                        {isLoading ? 'Memuat...' : state === 'confirmed' ? 'Booked' : state === 'pending' ? 'Pending' : state === 'passed' ? 'Jam lewat' : formatPrice(slot.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-neutral-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />Setiap slot berlangsung 2 jam. Slot yang dipilih dapat digabung dalam satu booking.</p>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-900 dark:bg-neutral-950/30 sm:p-6">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-500">02 · Layanan tambahan (opsional)</span>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" aria-pressed={addDokumentasi} onClick={() => setAddDokumentasi((value) => !value)} className={`flex min-h-[84px] items-center gap-4 rounded-lg border p-4 text-left transition-colors ${addDokumentasi ? 'border-neutral-600 bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-950/40' : 'border-neutral-200 bg-white hover:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950'}`}>
                  <Camera className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 flex-1"><strong className="block text-sm text-neutral-900 dark:text-white">Dokumentasi</strong><span className="mt-1 block text-xs text-neutral-500">Foto atau video pertandingan</span></span>
                  {addDokumentasi && <Check className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />}
                </button>
                <button type="button" aria-pressed={addWasit} onClick={() => setAddWasit((value) => !value)} className={`flex min-h-[84px] items-center gap-4 rounded-lg border p-4 text-left transition-colors ${addWasit ? 'border-neutral-600 bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-950/40' : 'border-neutral-200 bg-white hover:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-950'}`}>
                  <Flag className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 flex-1"><strong className="block text-sm text-neutral-900 dark:text-white">Wasit pertandingan</strong><span className="mt-1 block text-xs text-neutral-500">Konfirmasi ketersediaan oleh admin</span></span>
                  {addWasit && <Check className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-lg border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-900 dark:bg-neutral-900">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-500">Booking summary</span>
              <div className="mt-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <h3 className="font-bold text-neutral-900 dark:text-white">Batas Kota Arena</h3>
                <div className="mt-3 space-y-2 font-mono text-xs text-neutral-600 dark:text-neutral-300">
                  <p className="flex gap-2"><CalendarIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />{formattedDate}</p>
                  <p className="flex gap-2"><Clock className="h-3.5 w-3.5 shrink-0 text-neutral-400" />{selectedSlots.length ? selectedSlots.join(', ') : 'Belum pilih jadwal'}</p>
                  <p className="flex gap-2"><Users className="h-3.5 w-3.5 shrink-0 text-neutral-400" />{selectedSlots.length * 2} jam bermain</p>
                </div>
              </div>

              {(addDokumentasi || addWasit) && (
                <div className="border-b border-neutral-200 py-3 text-xs dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">Layanan tambahan</span>
                  <p className="mt-1 text-neutral-500">{[addDokumentasi ? 'Dokumentasi' : '', addWasit ? 'Wasit' : ''].filter(Boolean).join(', ')}</p>
                </div>
              )}

              <div className="flex items-baseline justify-between border-b border-neutral-200 py-4 dark:border-neutral-800">
                <span className="text-sm font-bold">Total</span>
                <span className="font-mono text-xl font-bold">{formatPrice(totalPrice)}</span>
              </div>

              <form onSubmit={handleBooking} className="mt-5 space-y-3">
                {error && <div role="alert" className="flex gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
                <div>
                  <label htmlFor="booking-team" className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Nama tim *</label>
                  <input id="booking-team" required value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Contoh: FC Selong" className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-400" />
                </div>
                <div>
                  <label htmlFor="booking-phone" className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Nomor WhatsApp *</label>
                  <input id="booking-phone" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0812 3456 7890" className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-neutral-400" />
                </div>
                <button type="submit" disabled={isSubmitting || isLoading || selectedSlots.length === 0} className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 py-3 text-xs font-bold uppercase text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-500 dark:text-white dark:hover:bg-neutral-400">
                  <CheckCircle2 className="h-4 w-4" />{isSubmitting ? 'Memproses booking...' : 'Booking jadwal ini'}
                </button>
                <p className="flex items-start justify-center gap-1.5 pt-2 text-center font-mono text-[10px] leading-relaxed text-neutral-500"><Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />Booking berstatus pending sampai pembayaran dikonfirmasi admin.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
