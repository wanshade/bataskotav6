'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NeonButton from './ui/NeonButton';
import { Calendar, Clock, User, Phone, ChevronRight, ChevronLeft, Trophy, CheckCircle2, AlertCircle, Lock, AlertTriangle } from 'lucide-react';
import {
  type ScheduleData,
  DEFAULT_SCHEDULE,
  formatPrice,
  getDayKey,
  getExpandedSlots,
  hasTimeOverlap,
} from '@/lib/schedule';

type Booking = {
  bookingDate: string;
  timeSlot: string;
  status: string;
};

// --- Main Component ---

const BookingSection: React.FC = () => {
  const router = useRouter();
  // Initialize with today's date (same-day booking allowed)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date();
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [dateScrollIndex, setDateScrollIndex] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addDokumentasi, setAddDokumentasi] = useState(false);
  const [addWasit, setAddWasit] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          if (data.bookings) {
            setBookings(data.bookings);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  // Fetch pricing on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/pricing');
        if (response.ok) {
          const data = await response.json();
          if (data.schedule) setSchedule(data.schedule);
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      }
    };
    fetchPricing();
  }, []);

  // Generate next 14 days starting from today (same-day booking allowed)
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  const visibleDates = dates.slice(dateScrollIndex, dateScrollIndex + 5); // Show 5 at a time on desktop

  const availableSlots = useMemo(() => {
    const key = getDayKey(selectedDate);
    return getExpandedSlots(key, schedule);
  }, [selectedDate, schedule]);

  const handleNextDates = () => {
    if (dateScrollIndex + 5 < dates.length) setDateScrollIndex(prev => prev + 1);
  };

  const handlePrevDates = () => {
    if (dateScrollIndex > 0) setDateScrollIndex(prev => prev - 1);
  };

  const selectedSlotsData = availableSlots.filter(s => selectedSlots.includes(s.label));
  const totalPrice = selectedSlotsData.reduce((sum, s) => sum + s.price, 0);

  const toggleSlot = (slotLabel: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotLabel)
        ? prev.filter(s => s !== slotLabel)
        : [...prev, slotLabel].sort((a, b) => {
            const aStart = parseFloat(a.split(' - ')[0].replace('.', '.'));
            const bStart = parseFloat(b.split(' - ')[0].replace('.', '.'));
            return aStart - bStart;
          })
    );
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSlots.length === 0 || !teamName.trim() || !phone.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Format date for display
      const formattedDate = selectedDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const timeSlotStr = selectedSlots.join(', ');
      const priceFormatted = formatPrice(totalPrice);

      // Save to database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName,
          phone,
          bookingDate: formattedDate,
          timeSlot: timeSlotStr,
          price: priceFormatted,
          dokumentasi: addDokumentasi,
          wasit: addWasit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show the detailed message from the API
        const errorMessage = errorData.message || errorData.error || 'Gagal membuat pemesanan';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Booking created:', data);

      // Show warning if using temporary storage
      if (data.warning) {
        console.warn('⚠️', data.warning);
      }
      if (!data.usingDatabase) {
        console.warn('💡 Tip: Set up database to persist bookings. See DATABASE_SETUP.md');
      }

      // Get booking ID from response
      const bookingId = data.booking?.bookingId || 'N/A';

      // Send WhatsApp confirmation message
      try {
        // Format phone number: remove leading 0 and add 62 country code
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '62' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('62')) {
          formattedPhone = '62' + formattedPhone;
        }
        const chatId = `${formattedPhone}@c.us`;

        // Bank details from environment variables
        const bankName = process.env.NEXT_PUBLIC_BANK_NAME || 'Bank Mandiri';
        const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '1610016475977';
        const bankAccountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'CV BATAS KOTA POINT';

        const bookingText = `✅ *PEMESANAN BERHASIL!*
Terima kasih telah memesan lapangan di Batas Kota

📋 *Detail Pemesanan:*
• Booking ID: ${bookingId}
• Nama Tim: ${teamName}
• Tanggal: ${formattedDate}
• Waktu: ${timeSlotStr} (${selectedSlots.length * 2} jam)
• Nomor WhatsApp: ${phone}${addDokumentasi ? '\n• 📸 Add-on: Dokumentasi' : ''}${addWasit ? '\n• 🏁 Add-on: Wasit' : ''}
• Total Pembayaran: ${priceFormatted}

💳 *Instruksi Pembayaran:*
Silakan transfer ke rekening berikut:
• Nama Penerima: ${bankAccountName}
• Bank: ${bankName.toUpperCase()}
• Nomor Rekening: ${bankAccount}

🚨 *PERINGATAN PENIPUAN:*
Transfer HANYA ke rekening atas nama *CV BATAS KOTA POINT*. 
Kami TIDAK bertanggung jawab atas transfer ke rekening lain atau atas nama pribadi.
Pastikan nama penerima sesuai sebelum transfer.

⚠️ *Penting:* Setelah melakukan pembayaran, harap konfirmasi melalui WhatsApp dengan melampirkan bukti transfer.

🚫 *PERATURAN CANCEL:*
1. Jika melakukan pembatalan pemesanan maka sejumlah uang yang telah masuk dianggap HANGUS dan tidak bisa untuk merubah jadwal
2. Jika melakukan pembatalan atau perubahan jadwal saat hari yang sudah ditentukan maka pembayaran yang telah dilakukan akan dianggap HANGUS
3. Jika pergantian jadwal dari jam premium ke jam reguler maka kelebihan uang tidak bisa di refund untuk kelebihan biayanya
4. Jika pergantian jadwal dari jam reguler ke jam premium maka customer dikenakan biaya tambahan

📋 *BOOKING ORDER:*
1. Booking bisa melalui website atau via whatsapp admin
2. Tanda putih pada jadwal berarti available (jam kosong)
3. Jam kosong yang telah dibooking akan berubah menjadi kuning, berarti sudah dibooking dan customer diberikan kesempatan 15 menit untuk melakukan pelunasan
4. Jika dalam 15 menit belum melakukan pelunasan maka secara otomatis tanda booking order pada website kembali menjadi putih (available) dan bisa kembali dibooking oleh siapa saja
5. Tanda merah pada booking order berarti customer sudah melakukan pembayaran dan siap untuk bermain pada jadwal tersebut

⏰ *PERIODE BOOKING ORDER:*
1. Minimum order 1 jam sebelumnya. 1 jam sebelum jam bermain pada jadwal booking hanya bisa dibooking via whatsapp melalui admin
2. Silahkan menghubungi admin
3. Untuk booking wajib melakukan pelunasan

_Batas Kota - The Town Space_`;

        const waApiEndpoint = process.env.NEXT_PUBLIC_WHATSAPP_API_ENDPOINT || '';
        if (!waApiEndpoint) {
          console.warn('WhatsApp API endpoint not configured');
          throw new Error('WhatsApp API endpoint not configured');
        }

        await fetch(waApiEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.NEXT_PUBLIC_WHATSAPP_API_KEY || '',
          },
          body: JSON.stringify({
            chatId: chatId,
            reply_to: null,
            text: bookingText,
            linkPreview: true,
            linkPreviewHighQuality: false,
            session: 'default'
          }),
        });
        console.log('WhatsApp confirmation sent to:', chatId);
      } catch (waError) {
        console.error('Failed to send WhatsApp confirmation:', waError);
        // Don't block booking flow if WhatsApp fails
      }

      // Create query params for success page
      const params = new URLSearchParams({
        team: teamName,
        date: formattedDate,
        time: timeSlotStr,
        price: priceFormatted,
        phone: phone,
        bookingId: bookingId,
        ...(addDokumentasi ? { dokumentasi: '1' } : {}),
        ...(addWasit ? { wasit: '1' } : {}),
      });

      // Redirect to success page
      router.push(`/booking-success?${params.toString()}`);
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat pemesanan';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none" />

      {/* Custom Background Shape - Abstract Field Diagram */}
      <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          {/* Abstract Play Tactics Circles */}
          <circle cx="80%" cy="80%" r="300" fill="none" stroke="#39ff14" strokeWidth="2" strokeDasharray="20 20" />
          <circle cx="80%" cy="80%" r="200" fill="none" stroke="#39ff14" strokeWidth="1" />
          <circle cx="80%" cy="80%" r="50" fill="#39ff14" fillOpacity="0.2" />

          {/* Tactics Lines/Arrows */}
          <path d="M 500 800 Q 600 600 800 500" fill="none" stroke="#39ff14" strokeWidth="2" strokeDasharray="10 10" />
          <path d="M 400 900 Q 550 750 750 600" fill="none" stroke="#39ff14" strokeWidth="2" strokeOpacity="0.5" />

          {/* Crosshairs */}
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#39ff14" strokeWidth="1" strokeOpacity="0.1" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#39ff14" strokeWidth="1" strokeOpacity="0.1" />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase mb-4">
            Pesan <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-500 drop-shadow-[0_0_10px_rgba(20,124,96,0.5)]">Lapangan</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Pilih tanggal dan waktu di bawah. Harga bervariasi berdasarkan hari dan waktu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Selection Grid */}
          <div className="lg:col-span-8 space-y-8">

            {/* Date Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-display text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Pilih Tanggal
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevDates}
                    disabled={dateScrollIndex === 0}
                    className="p-2 rounded-full hover:bg-zinc-800 disabled:opacity-30 transition-colors text-neon-green"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextDates}
                    disabled={dateScrollIndex + 5 >= dates.length}
                    className="p-2 rounded-full hover:bg-zinc-800 disabled:opacity-30 transition-colors text-neon-green"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {visibleDates.map((date, idx) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                  const dayNum = date.getDate();

                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedDate(date); setSelectedSlots([]); }}
                      className={`
                        relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 group
                        ${isSelected
                          ? 'bg-neon-green border-neon-green text-black shadow-[0_0_15px_rgba(20,124,96,0.4)] scale-105 z-10'
                          : 'bg-zinc-900/50 border-zinc-800 text-gray-400 hover:border-neon-green/50 hover:text-white'}
                      `}
                    >
                      <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                        {dayName}
                      </span>
                      <span className="font-display font-bold text-2xl">
                        {dayNum}
                      </span>
                      {isSelected && (
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slot Selector */}
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-display text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pilih Waktu
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Format current date once for all slots */}
                {(() => {
                  const formattedDate = selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  });

                  // Check if selected date is today
                  const now = new Date();
                  const isToday = selectedDate.toDateString() === now.toDateString();

                  return availableSlots.map((slot, idx) => {
                    const isSelected = selectedSlots.includes(slot.label);

                    // Check if time slot has already passed (only for today)
                    let timePassed = false;
                    if (isToday) {
                      const startTimeStr = slot.label.split(' - ')[0];
                      const startHour = parseInt(startTimeStr.split('.')[0]);
                      const startMinute = parseInt(startTimeStr.split('.')[1] || '0');
                      const currentHour = now.getHours();
                      const currentMinute = now.getMinutes();
                      if (startHour < currentHour || (startHour === currentHour && startMinute <= currentMinute)) {
                        timePassed = true;
                      }
                    }

                    // Check if slot is booked (confirmed status - includes DP bookings)
const isBooked = bookings.some(b =>
                       b.bookingDate === formattedDate &&
                       b.timeSlot.split(', ').some(ts => hasTimeOverlap(ts, slot.label)) &&
                       b.status === 'confirmed'
                     );

                     // Check if slot is pending
                     const isPending = bookings.some(b =>
                       b.bookingDate === formattedDate &&
                       b.timeSlot.split(', ').some(ts => hasTimeOverlap(ts, slot.label)) &&
                       b.status === 'pending'
                     );

                    const isOccupied = isBooked || isPending || timePassed;

                    return (
                      <button
                        key={idx}
                        disabled={isOccupied}
                        onClick={() => !isOccupied && toggleSlot(slot.label)}
                        className={`
                          relative overflow-hidden p-4 rounded-xl border text-left transition-all duration-300 group
                          ${timePassed
                            ? 'bg-zinc-900/50 border-zinc-700/50 opacity-60 cursor-not-allowed'
                            : isBooked
                              ? 'bg-red-900/20 border-red-900/50 cursor-not-allowed opacity-80'
                              : isPending
                                ? 'bg-yellow-900/20 border-yellow-700/50 cursor-not-allowed opacity-80'
                                : isSelected
                                  ? 'bg-neon-green/10 border-neon-green shadow-[inset_0_0_20px_rgba(20,124,96,0.1)]'
                                  : 'bg-zinc-900/30 border-zinc-800 hover:border-neon-green/50 hover:bg-zinc-900'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-sans font-bold text-lg ${timePassed ? 'text-gray-400 line-through' : isBooked ? 'text-red-500' : isPending ? 'text-yellow-500' : isSelected ? 'text-neon-green' : 'text-white'
                            }`}>
                            {slot.label}
                          </span>
                          {isBooked ? (
                            <Lock className="w-5 h-5 text-red-500" />
                          ) : isPending ? (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-neon-green" />
                          ) : null}
                        </div>
                        <div className={`text-sm font-sans ${timePassed ? 'text-gray-400' : isBooked ? 'text-red-400 font-bold uppercase' : isPending ? 'text-yellow-400 font-bold uppercase' : isSelected ? 'text-white' : 'text-gray-500'
                          }`}>
                          {timePassed ? 'JAM LEWAT' : isBooked ? 'BOOKED' : isPending ? 'PENDING' : formatPrice(slot.price)}
                        </div>

                        {/* Hover Effect */}
                        {!isOccupied && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent" />

                <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-white">
                  <Trophy className="text-neon-green w-5 h-5" /> Ringkasan Pemesanan
                </h3>

                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-black/50 rounded-lg p-4 space-y-3 border border-zinc-800/50">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                      <span className="text-gray-400 text-sm">Tanggal</span>
                      <span className="text-white font-medium">{selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                      <span className="text-gray-400 text-sm">Waktu</span>
                      <span className={`font-medium text-right max-w-[200px] ${selectedSlots.length > 0 ? 'text-white' : 'text-zinc-600 italic'}`}>
                        {selectedSlots.length > 0 ? `${selectedSlots.length} slot dipilih` : 'Pilih waktu'}
                      </span>
                    </div>
                    {selectedSlots.length > 0 && (
                      <div className="border-b border-zinc-800 pb-2 space-y-1">
                        {selectedSlots.map(s => {
                          const slotData = availableSlots.find(as => as.label === s);
                          return (
                            <div key={s} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{s}</span>
                              <span className="text-gray-300">{slotData ? formatPrice(slotData.price) : '-'}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {(addDokumentasi || addWasit) && (
                      <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
                        <span className="text-gray-400 text-sm">Add-On</span>
                        <div className="text-right flex flex-col gap-1">
                          {addDokumentasi && <span className="text-white text-sm">📸 Dokumentasi</span>}
                          {addWasit && <span className="text-white text-sm">🏁 Wasit</span>}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-gray-400 text-sm">Total ({selectedSlots.length * 2} jam)</span>
                      <span className="text-neon-green font-display font-bold text-lg">
                        {totalPrice > 0 ? formatPrice(totalPrice) : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Nama Tim</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-green transition-colors" />
                        <input
                          type="text"
                          placeholder="FC Batas Kota"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          required
                          className="w-full bg-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-neon-green focus:ring-1 focus:ring-neon-green outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Nomor WhatsApp</label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-green transition-colors" />
                        <input
                          type="tel"
                          placeholder="0812..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full bg-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-neon-green focus:ring-1 focus:ring-neon-green outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Add-On Options */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Add-On (Opsional)</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 bg-black/50 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-600 transition-all group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={addDokumentasi}
                              onChange={(e) => setAddDokumentasi(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-black peer-checked:bg-neon-green peer-checked:border-neon-green transition-all flex items-center justify-center">
                              {addDokumentasi && (
                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className="text-white text-sm font-medium">📸 Dokumentasi</span>
                            <p className="text-xs text-gray-500">Dokumentasi foto & video selama bermain</p>
                            <p className="text-xs text-yellow-500 font-medium">⚠️ Harga: Konfirmasi via WhatsApp</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-black/50 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-600 transition-all group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={addWasit}
                              onChange={(e) => setAddWasit(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-black peer-checked:bg-neon-green peer-checked:border-neon-green transition-all flex items-center justify-center">
                              {addWasit && (
                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className="text-white text-sm font-medium">🏁 Wasit</span>
                            <p className="text-xs text-gray-500">Wasit profesional untuk pertandingan</p>
                            <p className="text-xs text-yellow-500 font-medium">⚠️ Harga: Konfirmasi via WhatsApp</p>
                          </div>
                        </label>
                      </div>
                      {(addDokumentasi || addWasit) && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mt-2">
                          <p className="text-yellow-400 text-xs flex items-start gap-2">
                            <span className="text-base flex-shrink-0">📋</span>
                            <span>Harga add-on <strong>tidak termasuk</strong>. Konfirmasi harga via WhatsApp setelah booking.</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <NeonButton
                      type="submit"
                      className={`w-full flex justify-center ${(selectedSlots.length === 0 || !teamName.trim() || !phone.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                      disabled={selectedSlots.length === 0 || !teamName.trim() || !phone.trim() || isSubmitting}
                    >
                      {isSubmitting ? 'Memproses...' : `Konfirmasi Pemesanan (${selectedSlots.length * 2} jam)`}
                    </NeonButton>

                    {/* Fraud Warning */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-400 text-xs flex items-start gap-2">
                        <span className="text-base flex-shrink-0">⚠️</span>
                        <span>
                          <strong>PERINGATAN:</strong> Transfer hanya ke rekening atas nama <strong className="text-white">CV BATAS KOTA POINT</strong>. 
                          Kami tidak bertanggung jawab atas transfer ke rekening lain.
                        </span>
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center justify-center gap-2 text-xs text-red-500/80 bg-red-500/10 p-2 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Validation Warning */}
                    {!error && (selectedSlots.length === 0 || !teamName.trim() || !phone.trim()) && (
                      <div className="flex items-center justify-center gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>
                          {selectedSlots.length === 0 && 'Silakan pilih waktu terlebih dahulu'}
                          {selectedSlots.length > 0 && (!teamName.trim() || !phone.trim()) && 'Silakan lengkapi data pemesanan'}
                        </span>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Peraturan Cancel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent" />

          <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <AlertTriangle className="text-red-500 w-5 h-5" /> Peraturan Cancel
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika melakukan pembatalan pemesanan maka sejumlah uang yang telah masuk dianggap <strong className="text-red-400">HANGUS</strong> dan tidak bisa untuk merubah jadwal
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">2</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika melakukan pembatalan atau perubahan jadwal saat hari yang sudah ditentukan maka pembayaran yang telah dilakukan akan dianggap <strong className="text-red-400">HANGUS</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">3</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika pergantian jadwal dari jam premium ke jam reguler maka kelebihan uang <strong className="text-red-400">tidak bisa di refund</strong> untuk kelebihan biayanya
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">4</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika pergantian jadwal dari jam reguler ke jam premium maka customer dikenakan <strong className="text-yellow-400">biaya tambahan</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Order */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent" />

          <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <Calendar className="text-neon-green w-5 h-5" /> Booking Order
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Booking bisa melalui <strong className="text-white">website</strong> atau via <strong className="text-white">WhatsApp admin</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">2</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Tanda <strong className="text-white">putih</strong> pada jadwal berarti <strong className="text-white">available</strong> (jam kosong)
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">3</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jam kosong yang telah dibooking akan berubah menjadi <strong className="text-yellow-400">kuning</strong>, berarti sudah dibooking dan customer diberikan kesempatan <strong className="text-white">15 menit</strong> untuk melakukan pelunasan
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">4</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika dalam <strong className="text-white">15 menit</strong> belum melakukan pelunasan maka secara otomatis tanda booking order pada website kembali menjadi <strong className="text-white">putih</strong> (available) dan bisa kembali dibooking oleh siapa saja
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">5</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Tanda <strong className="text-red-400">merah</strong> pada booking order berarti customer sudah melakukan pembayaran dan siap untuk bermain pada jadwal tersebut
              </p>
            </div>
          </div>
        </div>

        {/* Periode Booking Order */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-transparent" />

          <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <Clock className="text-yellow-500 w-5 h-5" /> Periode Booking Order
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Minimum order <strong className="text-white">1 jam sebelumnya</strong>. 1 jam sebelum jam bermain pada jadwal booking hanya bisa dibooking via <strong className="text-white">WhatsApp</strong> melalui admin
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">2</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Silahkan menghubungi <strong className="text-white">admin</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">3</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Untuk booking <strong className="text-white">wajib melakukan pelunasan</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
