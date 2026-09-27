"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  User,
  Phone,
  ArrowRight,
  X,
} from "lucide-react";
import {
  type ScheduleData,
  DEFAULT_SCHEDULE,
  formatPrice,
  getDayKey,
  getExpandedSlots,
  hasTimeOverlap,
} from "@/lib/schedule";

type PublicBooking = {
  bookingDate: string;
  timeSlot: string;
  status: string;
};

export default function PublicScheduleGrid() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date();
  });
  const formattedDate = selectedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [dateScrollIndex, setDateScrollIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  const [teamName, setTeamName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);

  const [addDokumentasi, setAddDokumentasi] = useState(false);
  const [addWasit, setAddWasit] = useState(false);
  
  const [selectedBooking, setSelectedBooking] = useState<PublicBooking | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const response = await fetch(
          `/api/bookings?date=${encodeURIComponent(formattedDate)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (response.ok) {
          const data = await response.json();
          if (data.bookings) {
            setBookings(data.bookings);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to fetch bookings:", err);
      } finally {
        if (!controller.signal.aborted) setLoadingBookings(false);
      }
    };

    fetchBookings();
    return () => controller.abort();
  }, [formattedDate]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing");
        if (response.ok) {
          const data = await response.json();
          if (data.schedule) setSchedule(data.schedule);
        }
      } catch (err) {
        console.error("Failed to fetch pricing:", err);
      }
    };
    fetchPricing();
  }, []);

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

  const visibleDates = dates.slice(dateScrollIndex, dateScrollIndex + 7);

  const availableSlots = useMemo(() => {
    const key = getDayKey(selectedDate);
    return getExpandedSlots(key, schedule);
  }, [selectedDate, schedule]);

  const handleNextDates = () => {
    if (dateScrollIndex + 7 < dates.length)
      setDateScrollIndex((prev) => prev + 1);
  };

  const handlePrevDates = () => {
    if (dateScrollIndex > 0) setDateScrollIndex((prev) => prev - 1);
  };

  const selectedSlotsData = availableSlots.filter((s) =>
    selectedSlots.includes(s.label)
  );
  const totalPrice = selectedSlotsData.reduce((sum, s) => sum + s.price, 0);

  const toggleSlot = (slotLabel: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotLabel)
        ? prev.filter((s) => s !== slotLabel)
        : [...prev, slotLabel].sort((a, b) => {
            const aStart = parseFloat(a.split(" - ")[0].replace(".", "."));
            const bStart = parseFloat(b.split(" - ")[0].replace(".", "."));
            return aStart - bStart;
          })
    );
  };

  const isSlotTimePassed = (slotLabel: string): boolean => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (!isToday) return false;

    const startTimeStr = slotLabel.split(" - ")[0];
    const startHour = parseInt(startTimeStr.split(".")[0]);
    const startMinute = parseInt(startTimeStr.split(".")[1] || "0");

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    if (startHour < currentHour) return true;
    if (startHour === currentHour && startMinute <= currentMinute) return true;

    return false;
  };

const getBookingForSlot = (slotLabel: string): PublicBooking | undefined => {
    return bookings.find(
      (b) =>
        b.bookingDate === formattedDate &&
        b.timeSlot.split(", ").some((ts) => hasTimeOverlap(ts, slotLabel)) &&
        (b.status === "confirmed" || b.status === "pending")
    );
  };

  const handleSlotClick = (slot: { label: string; price: number }) => {
    const booking = getBookingForSlot(slot.label);
    if (booking) {
      setSelectedBooking(booking);
    } else if (!isSlotTimePassed(slot.label)) {
      toggleSlot(slot.label);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !phone || selectedSlots.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const priceFormatted = formatPrice(totalPrice);
    const formattedDateVal = formattedDate;
    const timeSlotStr = selectedSlots.join(", ");

    try {
      // Re-fetch bookings to get latest data before submitting
      try {
        const freshRes = await fetch(
          `/api/bookings?date=${encodeURIComponent(formattedDateVal)}`,
          { cache: "no-store" },
        );
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          if (freshData.bookings) {
            setBookings(freshData.bookings);
            const conflictSlot = selectedSlots.find(slot =>
              freshData.bookings.some((b: PublicBooking) =>
                b.bookingDate === formattedDateVal &&
                b.timeSlot.split(", ").some((ts: string) => hasTimeOverlap(ts, slot)) &&
                (b.status === "confirmed" || b.status === "pending")
              )
            );
            if (conflictSlot) {
              setError(`Slot ${conflictSlot} sudah dipesan oleh tim lain. Silakan pilih waktu lain.`);
              setIsSubmitting(false);
              return;
            }
          }
        }
      } catch {
        // Continue — server will catch duplicates
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          phone,
          bookingDate: formattedDateVal,
          timeSlot: timeSlotStr,
          price: priceFormatted,
          dokumentasi: addDokumentasi,
          wasit: addWasit,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || errorData.error || "Gagal membuat pemesanan";
        // If conflict (409), refresh bookings to update UI
        if (response.status === 409) {
          try {
            const refreshRes = await fetch(
              `/api/bookings?date=${encodeURIComponent(formattedDateVal)}`,
              { cache: "no-store" },
            );
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.bookings) setBookings(refreshData.bookings);
            }
          } catch { /* ignore */ }
          setSelectedSlots([]);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const bookingId = data.booking?.bookingId || "N/A";

      try {
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "62" + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith("62")) {
          formattedPhone = "62" + formattedPhone;
        }

        const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Bank Mandiri";
        const bankAccount =
          process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "1610016475977";
        const bankAccountName =
          process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "CV BATAS KOTA POINT";
        const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6282339598858";

        const bookingText = `✅ *PEMESANAN BERHASIL!*
Terima kasih telah memesan lapangan di Batas Kota

📋 *Detail Pemesanan:*
• Booking ID: ${bookingId}
• Nama Tim: ${teamName}
• Tanggal: ${formattedDate}
• Waktu: ${timeSlotStr} (${selectedSlots.length * 2} jam)
• Nomor WhatsApp: ${phone}${
          addDokumentasi ? "\n• 📸 Add-on: Dokumentasi" : ""
        }${addWasit ? "\n• 🏁 Add-on: Wasit" : ""}
• Total Pembayaran: ${priceFormatted}

💳 *Instruksi Pembayaran:*
Silakan transfer ke rekening berikut:
• Nama Penerima: ${bankAccountName}
• Bank: ${bankName.toUpperCase()}
• Nomor Rekening: ${bankAccount}

⚠️ *Penting:*
Mohon segera lakukan *Transfer* setelah pesan ini terkirim. Kirimkan bukti transfer Anda ke nomor WhatsApp admin ini untuk memproses konfirmasi booking Anda.

Terima kasih! ⚽`;

        const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
          bookingText
        )}`;

        // Redirect to success page and open WA silently
        const successParams = new URLSearchParams({
          teamName: teamName,
          bookingDate: formattedDate,
          timeSlot: timeSlotStr,
          price: priceFormatted,
          bookingId: bookingId,
          waUrl: waUrl,
        });

        if (addDokumentasi) successParams.append("dokumentasi", "true");
        if (addWasit) successParams.append("wasit", "true");

        router.push(`/booking-success?${successParams.toString()}`);
      } catch (waError) {
        console.error("Error creating WhatsApp link:", waError);
        router.push("/booking-success");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terdapat kesalahan sistem. Silakan coba lagi."
      );
      setIsSubmitting(false);
    }
  };

  if (loadingBookings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Side: Schedule Calendar */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neon-green/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display tracking-widest uppercase text-white">Kalender Jadwal</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDates}
                  disabled={dateScrollIndex === 0}
                  className="p-2 hover:bg-zinc-800 text-neon-green rounded-full disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextDates}
                  disabled={dateScrollIndex + 7 >= dates.length}
                  className="p-2 hover:bg-zinc-800 text-neon-green rounded-full disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dates Scroller */}
            <div className="grid grid-cols-7 gap-2 mb-8">
              {visibleDates.map((date, idx) => {
                const isSelected =
                  date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlots([]);
                    }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-neon-green border-neon-green text-black shadow-[0_0_15px_rgba(20,124,96,0.4)] scale-105 z-10"
                        : "bg-zinc-900/50 border-zinc-800 text-gray-400 hover:border-neon-green/50 hover:text-white"
                    }`}
                  >
                    <div className={`text-[10px] md:text-xs font-bold uppercase ${isSelected ? 'text-black' : 'text-gray-500'}`}>
                      {date.toLocaleDateString("id-ID", { weekday: "short" })}
                    </div>
                    <div className="text-lg md:text-2xl font-display font-bold">
                      {date.getDate()}
                    </div>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-black rounded-full mx-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <h3 className="font-display font-bold text-sm tracking-widest text-gray-400 uppercase">Pilih Jam Main</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-fade-in">
              {availableSlots.map((slot, idx) => {
                const isSelected = selectedSlots.includes(slot.label);

const isBooked = bookings.some(
                  (b) =>
                    b.bookingDate === formattedDate &&
                    b.timeSlot.split(", ").some((ts) => hasTimeOverlap(ts, slot.label)) &&
                    b.status === "confirmed"
                );

                const isPending = bookings.some(
                  (b) =>
                    b.bookingDate === formattedDate &&
                    b.timeSlot.split(", ").some((ts) => hasTimeOverlap(ts, slot.label)) &&
                    b.status === "pending"
                );

                const isOccupied = isBooked || isPending;
                const timePassed = isSlotTimePassed(slot.label);
                const disabled = isOccupied || timePassed;

                let slotStyle = "bg-zinc-900/30 border-zinc-800 hover:border-neon-green/50 hover:bg-zinc-900 text-gray-400";
                
                if (timePassed) {
                  slotStyle = "bg-zinc-900/50 border-zinc-700/50 opacity-60 cursor-not-allowed";
                } else if (isBooked) {
                  slotStyle = "bg-red-900/20 border-red-900/50 cursor-not-allowed opacity-80 text-red-500";
                } else if (isPending) {
                  slotStyle = "bg-yellow-900/20 border-yellow-700/50 cursor-not-allowed opacity-80 text-yellow-500";
                } else if (isSelected) {
                  slotStyle = "bg-neon-green/10 border-neon-green shadow-[inset_0_0_20px_rgba(20,124,96,0.1)] text-neon-green";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSlotClick(slot)}
                    className={`relative overflow-hidden p-4 rounded-xl border text-left transition-all duration-300 group ${slotStyle}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`font-sans font-bold text-lg ${
                          timePassed
                            ? "text-gray-400 line-through"
                            : isBooked
                            ? "text-red-500"
                            : isPending
                            ? "text-yellow-500"
                            : isSelected
                            ? "text-neon-green"
                            : "text-white"
                        }`}
                      >
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
                    
                    <div
                      className={`text-sm font-sans ${
                        isBooked
                          ? "text-red-400 font-bold uppercase"
                          : isPending
                          ? "text-yellow-400 font-bold uppercase"
                          : isSelected
                          ? "text-white"
: timePassed
                           ? "text-gray-400"
                           : "text-gray-500"
                      }`}
                    >
                      {isBooked
                        ? "BOOKED"
                        : isPending
                        ? "PENDING"
                        : timePassed
                        ? "JAM LEWAT"
                        : formatPrice(slot.price)}
                    </div>
                    
                    {/* Hover effect shimmer */}
                    {!disabled && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-zinc-700"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tersedia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-900/30 border border-yellow-700/50"></div>
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-900/30 border border-red-900/50"></div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Corner Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

            <h3 className="text-2xl font-display font-black text-white mb-6 uppercase tracking-wider">
              Booking <span className="text-neon-green">Summary</span>
            </h3>

            {selectedSlots.length > 0 ? (
              <form onSubmit={handleBooking} className="space-y-6 relative z-10">
                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neon-green transition-colors">
                      Nama Tim <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-neon-green transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-neon-green focus:border-neon-green transition-all"
                        placeholder="Contoh: FC Barcelona"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2 group-focus-within:text-neon-green transition-colors">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-neon-green transition-colors" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-neon-green focus:border-neon-green transition-all"
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                  </div>

                  {/* Add-on Options */}
                  <div className="pt-4 border-t border-zinc-800">
                    <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-3">
                      Layanan Tambahan
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={addDokumentasi}
                          onChange={(e) => setAddDokumentasi(e.target.checked)}
                          className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-neon-green focus:ring-neon-green focus:ring-offset-zinc-900"
                        />
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-gray-300">📸 Dokumentasi (Foto/Video)</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={addWasit}
                          onChange={(e) => setAddWasit(e.target.checked)}
                          className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-neon-green focus:ring-neon-green focus:ring-offset-zinc-900"
                        />
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-gray-300">🏁 Wasit Pertandingan</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800/80">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-400 font-sans uppercase tracking-wider">Durasi</span>
                    <span className="font-display font-bold text-neon-green px-2 py-1 bg-neon-green/10 rounded-md">
                      {selectedSlots.length * 2} Jam
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 pb-4 border-b border-zinc-800">
                    {selectedSlotsData.map((slot, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-mono bg-zinc-900 px-2 py-1 rounded">{slot.label}</span>
                        <span className="font-bold text-white">{formatPrice(slot.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-500 font-sans uppercase tracking-widest">Total Bayar</span>
                    <span className="text-2xl font-black font-display text-white">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/20 text-red-500 rounded-xl border border-red-900/50 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative w-full overflow-hidden group py-4 px-6 bg-neon-green hover:bg-[#10eb71] text-black rounded-xl font-display font-black tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,124,96,0.3)] hover:shadow-[0_0_30px_rgba(20,124,96,0.5)]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <span>Checkout Sekarang</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                  {/* Button shine effect */}
                  {!isSubmitting && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-12 px-4 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-700">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <Clock className="w-6 h-6 text-neon-green/50" />
                </div>
                <h4 className="font-bold font-display text-white mb-2 uppercase tracking-wide">Pilih Waktu Main</h4>
                <p className="text-sm text-gray-500 font-sans">
                  Silakan pilih jadwal yang tersedia di kalender sebelah kiri untuk melihat ringkasan pesanan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                Detail Booking
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                  selectedBooking.status === 'confirmed'
                    ? 'bg-green-900/30 text-green-500 border border-green-700/50'
                    : 'bg-yellow-900/30 text-yellow-500 border border-yellow-700/50'
                }`}>
                  {selectedBooking.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                </span>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4">
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-1">
                  Tanggal
                </label>
                <p className="text-white font-bold">{selectedBooking.bookingDate}</p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4">
                <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-1">
                  Waktu
                </label>
                <p className="text-white font-bold">{selectedBooking.timeSlot}</p>
              </div>

              <p className="text-xs leading-relaxed text-gray-400">
                Detail pelanggan disembunyikan. Gunakan menu cek booking dengan Booking ID untuk melihat reservasi Anda sendiri.
              </p>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-display font-bold uppercase tracking-wider transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
