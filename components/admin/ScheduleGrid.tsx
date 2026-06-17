import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, Clock, XCircle, Phone, User, Calendar, CreditCard, X, MessageCircle } from 'lucide-react';
import type { Booking } from '@/lib/schema';
import {
  type ScheduleData,
  DEFAULT_SCHEDULE,
  formatPrice,
  getDayKey,
  getExpandedSlots,
  hasTimeOverlap,
} from '@/lib/schedule';

const generateWhatsAppMessage = (booking: Booking): string => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const statusText = booking.status === 'confirmed'
    ? '✅ *DIKONFIRMASI*'
    : booking.status === 'cancelled'
    ? '❌ *DIBATALKAN*'
    : '⏳ *PENDING*';

  const paymentText = booking.paymentStatus === 'paid'
    ? '✅ *LUNAS*'
    : booking.paymentStatus === 'dp'
    ? `💳 *DP* (Rp ${Number(booking.dpAmount || 0).toLocaleString('id-ID')})`
    : '⏳ *Belum Bayar*';

  const addOns = [];
  if (booking.addDokumentasi) addOns.push('📸 Dokumentasi');
  if (booking.addWasit) addOns.push('🏁 Wasit');

  const message = `
👋 *KONFIRMASI BOOKING*
━━━━━━━━━━━━━━━━━━━━

📋 *DETAIL PEMESANAN*
━━━━━━━━━━━━━━━━━━━━
🆔 ID Booking: *${booking.bookingId}*
👥 Nama Tim: *${booking.teamName}*
📅 Tanggal: *${formatDate(booking.bookingDate)}*
⏰ Waktu: *${booking.timeSlot}*
${addOns.length > 0 ? `📌 Add-On: *${addOns.join(' & ')}*\n` : ''}💰 Total: *Rp ${Number(booking.totalPrice || booking.price).toLocaleString('id-ID')}*

📊 *STATUS PEMESANAN*
${statusText}

💳 *STATUS PEMBAYARAN*
${paymentText}

${booking.status === 'confirmed' ? `
✨ *Booking Anda telah dikonfirmasi!*

Silakan datang 15 menit sebelum waktu bermain.

📍 Lokasi: Selong, Lombok Timur

🚨 *PERINGATAN PENIPUAN*
━━━━━━━━━━━━━━━━━━━━
⚠️ Transfer HANYA ke rekening atas nama *CV BATAS KOTA POINT*
⚠️ Kami TIDAK bertanggung jawab atas transfer ke rekening lain

🚫 *PERATURAN*
━━━━━━━━━━━━━━━━━━━━
• Pembatalan = uang HANGUS
• Perubahan jadwal hari-H = uang HANGUS
` : booking.status === 'pending' ? `
⏳ *Menunggu Konfirmasi*

Pemesanan Anda sedang kami proses.
` : `
❌ *Pemesanan dibatalkan*
`}

━━━━━━━━━━━━━━━━━━━━
_Terima kasih telah memilih Batas Kota!_
⚽ Setiap permainan punya cerita. ✨
  `.trim();

  return encodeURIComponent(message);
};

const sendWhatsAppConfirmation = (booking: Booking) => {
  const message = generateWhatsAppMessage(booking);
  const phone = booking.phone.replace(/\D/g, '');
  const waUrl = `https://wa.me/${phone}?text=${message}`;
  window.open(waUrl, '_blank');
};

interface ScheduleGridProps {
  refreshSignal?: number;
  onRefresh?: () => void;
}

export default function ScheduleGrid({ refreshSignal = 0 }: ScheduleGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateScrollIndex, setDateScrollIndex] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const hasLoadedRef = useRef(false);

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

  // Fetch only the bookings for the selected date
  useEffect(() => {
    const fetchByDate = async () => {
      const dateStr = selectedDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      // Only show the full skeleton on the very first load; subsequent
      // date changes just dim the grid to avoid a jarring refresh.
      if (!hasLoadedRef.current) {
        setInitialLoading(true);
      } else {
        setFetching(true);
      }
      try {
        const res = await fetch(`/api/admin/bookings/by-date?date=${encodeURIComponent(dateStr)}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to fetch bookings by date:', err);
      } finally {
        hasLoadedRef.current = true;
        setInitialLoading(false);
        setFetching(false);
      }
    };
    fetchByDate();
  }, [selectedDate, refreshSignal]);

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  const visibleDates = dates.slice(dateScrollIndex, dateScrollIndex + 7); // Show 7 for admin

  const availableSlots = useMemo(() => {
    const key = getDayKey(selectedDate);
    return getExpandedSlots(key, schedule);
  }, [selectedDate, schedule]);

  const handleNextDates = () => {
    if (dateScrollIndex + 7 < dates.length) setDateScrollIndex(prev => prev + 1);
  };

  const handlePrevDates = () => {
    if (dateScrollIndex > 0) setDateScrollIndex(prev => prev - 1);
  };

  // Check if slot time has passed for today
  const isSlotTimePassed = (slotLabel: string): boolean => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (!isToday) return false;
    
    // Extract start time from slot label (e.g., "14.00 - 16.00" -> 14)
    const startTimeStr = slotLabel.split(' - ')[0];
    const startHour = parseInt(startTimeStr.split('.')[0]);
    const startMinute = parseInt(startTimeStr.split('.')[1] || '0');
    
    // Get current time
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    // Compare times
    if (startHour < currentHour) return true;
    if (startHour === currentHour && startMinute <= currentMinute) return true;
    
return false;
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="premium-card h-32 skeleton rounded-3xl" />
        <div className="premium-card h-96 skeleton rounded-3xl" />
      </div>
    );
  }

  const formattedDate = selectedDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Schedule Overview</h2>
              <p className="text-sm text-slate-400">Pantau ketersediaan lapangan per hari</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-emerald-700 font-semibold px-3.5 py-1.5 brand-gradient-soft rounded-full border border-emerald-100 flex items-center gap-2">
              {fetching && <span className="w-3 h-3 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />}
              {formattedDate}
            </p>
            <div className="flex gap-1">
              <button onClick={handlePrevDates} disabled={dateScrollIndex === 0} className="p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#147c60]" />
              </button>
              <button onClick={handleNextDates} disabled={dateScrollIndex + 7 >= dates.length} className="p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-30 transition-colors">
                <ChevronRight className="w-5 h-5 text-[#147c60]" />
              </button>
            </div>
          </div>
        </div>

        {/* Date Scroller */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {visibleDates.map((date, idx) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isTodayDate = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'brand-gradient border-transparent text-white nav-active-glow'
                    : isTodayDate
                      ? 'brand-gradient-soft border-[#147c60]/30 text-[#147c60]'
                      : 'border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 text-slate-600'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wide">{date.toLocaleDateString('id-ID', { weekday: 'short' })}</div>
                <div className="text-lg font-bold tabular-nums">{date.getDate()}</div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-emerald-200"></div>
            <span className="text-sm text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
            <span className="text-sm text-slate-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm text-slate-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-sm text-slate-600">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
            <span className="text-sm text-slate-600">Jam Sudah Lewat</span>
          </div>
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 transition-opacity duration-200 ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {availableSlots.map((slot, idx) => {
            // Find all bookings for this slot (not just confirmed)
const booking = bookings.find(b => 
              b.bookingDate === formattedDate && 
              b.timeSlot.split(', ').some(ts => hasTimeOverlap(ts, slot.label))
            );

            const hasBooking = !!booking;
            const status = booking?.status || 'available';
            const timePassed = isSlotTimePassed(slot.label);

            // Style based on status
            const getSlotStyles = () => {
              if (timePassed) {
                return 'bg-gray-100 border-gray-300 opacity-60';
              }
              switch (status) {
                case 'confirmed':
                  return 'bg-green-50 border-green-300 ring-2 ring-green-200';
                case 'pending':
                  return 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200';
                case 'cancelled':
                  return 'bg-red-50 border-red-300';
                default:
                  return 'bg-white border-emerald-100 hover:border-[#147c60]/40 hover:shadow-md';
              }
            };

            const getStatusIcon = () => {
              if (timePassed) {
                return <Clock className="w-4 h-4 text-gray-400" />;
              }
              switch (status) {
                case 'confirmed':
                  return <Lock className="w-4 h-4 text-green-600" />;
                case 'pending':
                  return <Clock className="w-4 h-4 text-yellow-600" />;
                case 'cancelled':
                  return <XCircle className="w-4 h-4 text-red-500" />;
                default:
                  return <CheckCircle2 className="w-4 h-4 text-slate-300" />;
              }
            };

            const getStatusBadge = () => {
              if (timePassed) {
                return (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
                    <Clock className="w-3 h-3 mr-1" /> JAM LEWAT
                  </span>
                );
              }
              switch (status) {
                case 'confirmed':
                  return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> CONFIRMED
                    </span>
                  );
                case 'pending':
                  return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                      <Clock className="w-3 h-3 mr-1" /> PENDING
                    </span>
                  );
                case 'cancelled':
                  return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <XCircle className="w-3 h-3 mr-1" /> CANCELLED
                    </span>
                  );
                default:
                  return null;
              }
            };

            return (
              <div 
                key={idx}
                onClick={() => hasBooking && booking && setSelectedBooking(booking)}
                className={`relative p-4 rounded-lg border transition-all ${getSlotStyles()} ${hasBooking ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${
                    timePassed ? 'text-gray-500 line-through' :
                    status === 'confirmed' ? 'text-green-700' : 
                    status === 'pending' ? 'text-yellow-700' : 
                    status === 'cancelled' ? 'text-red-700' : 
                    'text-slate-700'
                  }`}>
                    {slot.label}
                  </span>
                  {getStatusIcon()}
                </div>
                
                {hasBooking && booking ? (
                  <div className="mt-2 space-y-2">
                    {getStatusBadge()}
                    
                    {/* Payment Status Badge */}
                    {booking.status === 'confirmed' && (
                      <div>
                        {booking.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            💰 LUNAS
                          </span>
                        ) : booking.paymentStatus === 'dp' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            💳 DP {booking.dpAmount ? `Rp ${Number(booking.dpAmount).toLocaleString('id-ID')}` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            ⏳ Belum Bayar
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-1 mb-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-900 truncate">{booking.teamName}</p>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-600">{booking.phone}</p>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <CreditCard className="w-3 h-3 text-[#147c60]" />
                        <p className="text-xs font-semibold text-[#147c60]">
                          {formatPrice(Number(booking.totalPrice || booking.price))}
                        </p>
                      </div>
                      
                      {/* Add-On Badges */}
                      {(booking.addDokumentasi || booking.addWasit) && (
                        <div className="flex flex-wrap gap-1 mt-1 mb-2">
                          {booking.addDokumentasi && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                              📸 Dok
                            </span>
                          )}
                          {booking.addWasit && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                              🏁 Wasit
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-slate-400">
                        ID: <span className="font-mono">{booking.bookingId}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {timePassed ? (
                      <p className="text-sm text-gray-500">Jam Sudah Lewat</p>
                    ) : (
                      <>
                        <p className="text-sm text-slate-500">Available</p>
                        <p className="text-xs text-[#147c60] font-semibold mt-1">{formatPrice(slot.price)}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats for Selected Date */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const dayBookings = bookings.filter(b => b.bookingDate === formattedDate);
            const pending = dayBookings.filter(b => b.status === 'pending').length;
            const confirmed = dayBookings.filter(b => b.status === 'confirmed').length;
            const cancelled = dayBookings.filter(b => b.status === 'cancelled').length;
            const available = availableSlots.length - dayBookings.filter(b => b.status !== 'cancelled').length;

            return (
              <>
                <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center shadow-sm">
                  <p className="text-2xl font-bold text-slate-700">{available}</p>
                  <p className="text-xs text-slate-500 mt-1">Available</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amber-100 text-center shadow-sm">
                  <p className="text-2xl font-bold text-amber-600">{pending}</p>
                  <p className="text-xs text-amber-500 mt-1">Pending</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-green-100 text-center shadow-sm">
                  <p className="text-2xl font-bold text-green-600">{confirmed}</p>
                  <p className="text-xs text-green-500 mt-1">Confirmed</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-red-100 text-center shadow-sm">
                  <p className="text-2xl font-bold text-red-600">{cancelled}</p>
                  <p className="text-xs text-red-500 mt-1">Cancelled</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

{/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className={`relative px-6 py-5 ${
              selectedBooking.status === 'confirmed' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                : selectedBooking.status === 'pending'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}>
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Booking ID</p>
                  <p className="text-white font-mono font-bold text-lg">{selectedBooking.bookingId}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  selectedBooking.status === 'confirmed' 
                    ? 'bg-white/20 text-white' 
                    : selectedBooking.status === 'pending'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/20 text-white'
                }`}>
                  {selectedBooking.status === 'confirmed' ? '✓ CONFIRMED' : selectedBooking.status === 'pending' ? '⏳ PENDING' : '✕ CANCELLED'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Team Info Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Nama Tim</p>
                    <p className="text-slate-900 font-bold text-lg">{selectedBooking.teamName}</p>
                  </div>
                </div>
              </div>

              {/* Time & Date */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-600 font-medium uppercase">Tanggal</p>
                  </div>
                  <p className="text-slate-900 font-bold">{selectedBooking.bookingDate}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-600 font-medium uppercase">Waktu</p>
                  </div>
                  <p className="text-slate-900 font-bold">{selectedBooking.timeSlot}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase">WhatsApp</p>
                    <p className="text-slate-900 font-bold">{selectedBooking.phone}</p>
                  </div>
                </div>
              </div>

              {/* Price & Payment */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Total Harga</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatPrice(Number(selectedBooking.totalPrice || selectedBooking.price))}</p>
                </div>
                <div className={`rounded-xl p-4 border ${
                  selectedBooking.paymentStatus === 'paid' 
                    ? 'bg-green-50 border-green-100' 
                    : selectedBooking.paymentStatus === 'dp'
                    ? 'bg-blue-50 border-blue-100'
                    : 'bg-orange-50 border-orange-100'
                }`}>
                  <p className={`text-xs font-medium uppercase mb-1 ${
                    selectedBooking.paymentStatus === 'paid' 
                      ? 'text-green-600' 
                      : selectedBooking.paymentStatus === 'dp'
                      ? 'text-blue-600'
                      : 'text-orange-600'
                  }`}>Pembayaran</p>
                  <p className={`text-lg font-bold ${
                    selectedBooking.paymentStatus === 'paid' 
                      ? 'text-green-700' 
                      : selectedBooking.paymentStatus === 'dp'
                      ? 'text-blue-700'
                      : 'text-orange-700'
                  }`}>
                    {selectedBooking.paymentStatus === 'paid' ? '✓ LUNAS' : selectedBooking.paymentStatus === 'dp' ? '💳 DP' : '⏳ BELUM'}
                  </p>
                  {selectedBooking.paymentStatus === 'dp' && selectedBooking.dpAmount && (
                    <p className="text-sm text-blue-600 mt-1">Rp {Number(selectedBooking.dpAmount).toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>

              {/* Add-ons */}
              {(selectedBooking.addDokumentasi || selectedBooking.addWasit) && (
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100 mb-4">
                  <p className="text-xs text-violet-600 font-medium uppercase mb-2">Layanan Tambahan</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.addDokumentasi && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                        📸 Dokumentasi
                      </span>
                    )}
                    {selectedBooking.addWasit && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                        🏁 Wasit
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Created At */}
              <div className="text-center text-sm text-slate-400">
                Dibuat: {new Date(selectedBooking.createdAt).toLocaleString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
              {/* WhatsApp Button */}
              <button
                onClick={() => selectedBooking && sendWhatsAppConfirmation(selectedBooking)}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
              >
                <MessageCircle className="w-5 h-5" />
                Kirim Konfirmasi WhatsApp
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

