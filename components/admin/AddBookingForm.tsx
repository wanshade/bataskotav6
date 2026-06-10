import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  Users,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import {
  type ScheduleData,
  DEFAULT_SCHEDULE,
  formatPrice,
  getDayKey,
  getExpandedSlots,
  hasTimeOverlap,
} from '@/lib/schedule';

interface AddBookingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddBookingForm({ onSuccess, onCancel }: AddBookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateScrollIndex, setDateScrollIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'dp' | 'paid'>('pending');
  const [dpAmount, setDpAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addDokumentasi, setAddDokumentasi] = useState(false);
  const [addWasit, setAddWasit] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);
  const [dayBookings, setDayBookings] = useState<Array<{ bookingDate: string; timeSlot: string; status: string }>>([]);

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

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
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

  const formattedDate = selectedDate.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

  // Fetch existing bookings for the selected date to check conflicts
  useEffect(() => {
    const fetchByDate = async () => {
      try {
        const res = await fetch(`/api/admin/bookings/by-date?date=${encodeURIComponent(formattedDate)}`);
        if (res.ok) {
          const data = await res.json();
          setDayBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to fetch bookings by date:', err);
      }
    };
    fetchByDate();
  }, [formattedDate]);

const isSlotBooked = (slotLabel: string) => {
    return dayBookings.some(b => 
      b.bookingDate === formattedDate && 
      b.timeSlot.split(', ').some(ts => hasTimeOverlap(ts, slotLabel)) && 
      (b.status === 'confirmed' || b.status === 'pending')
    );
  };

  const isSlotTimePassed = (slotLabel: string): boolean => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (!isToday) return false;
    
    const startTimeStr = slotLabel.split(' - ')[0];
    const startHour = parseInt(startTimeStr.split('.')[0]);
    const startMinute = parseInt(startTimeStr.split('.')[1] || '0');
    
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    if (startHour < currentHour) return true;
    if (startHour === currentHour && startMinute <= currentMinute) return true;
    
    return false;
  };

  const selectedSlotsData = availableSlots.filter(s => selectedSlots.includes(s.label));
  const totalPrice = selectedSlotsData.reduce((sum, s) => sum + s.price, 0);

  const toggleSlot = (slotLabel: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotLabel)
        ? prev.filter(s => s !== slotLabel)
        : [...prev, slotLabel].sort((a, b) => {
            const aStart = parseFloat(a.split(' - ')[0]);
            const bStart = parseFloat(b.split(' - ')[0]);
            return aStart - bStart;
          })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!teamName.trim()) {
      setError('Nama tim wajib diisi');
      return;
    }
    if (!phone.trim()) {
      setError('Nomor HP wajib diisi');
      return;
    }
    if (selectedSlots.length === 0) {
      setError('Pilih jadwal booking terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const timeSlotStr = selectedSlots.join(', ');
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          phone,
          bookingDate: formattedDate,
          timeSlot: timeSlotStr,
          price: totalPrice,
          paymentStatus,
          dpAmount: paymentStatus === 'dp' ? dpAmount : undefined,
          dokumentasi: addDokumentasi,
          wasit: addWasit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Booking berhasil dibuat!');
        setTeamName('');
        setPhone('');
        setSelectedSlots([]);
        onSuccess();
      } else {
        setError(data.error || 'Gagal membuat booking');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="premium-card overflow-hidden relative">
        <div className="brand-gradient absolute inset-0 opacity-[0.97]" />
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3 p-6">
          <button
            onClick={onCancel}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Tambah Booking Baru</h2>
            <p className="text-sm text-emerald-50/80">Buat booking manual untuk customer</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-pop-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-start gap-3 animate-pop-in">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Pilih Tanggal</h3>
              <p className="text-sm text-slate-500">Tanggal dipilih: <span className="font-semibold text-[#147c60]">{formattedDate}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDateScrollIndex(prev => Math.max(0, prev - 1))}
              disabled={dateScrollIndex === 0}
              className="p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#147c60]" />
            </button>
            <div className="flex-1 grid grid-cols-7 gap-2">
              {visibleDates.map((date, idx) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlots([]);
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'bg-[#147c60] border-[#147c60] text-white shadow-lg shadow-emerald-200'
                        : isToday
                          ? 'bg-emerald-50 border-[#147c60] text-[#147c60] hover:bg-emerald-100'
                          : 'border-emerald-100 hover:border-[#147c60]/40 hover:bg-emerald-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                      {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </div>
                    <div className="text-xl font-bold">{date.getDate()}</div>
                    {isToday && <div className="text-[10px] font-medium mt-1 opacity-80">Hari Ini</div>}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setDateScrollIndex(prev => Math.min(dates.length - 7, prev + 1))}
              disabled={dateScrollIndex + 7 >= dates.length}
              className="p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#147c60]" />
            </button>
          </div>
        </section>

        {/* Time Slot Selection */}
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Pilih Jadwal</h3>
              <p className="text-sm text-slate-500">Pilih slot waktu yang tersedia</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableSlots.map((slot) => {
              const booked = isSlotBooked(slot.label);
              const timePassed = isSlotTimePassed(slot.label);
              const isSelected = selectedSlots.includes(slot.label);
              
              return (
                <button
                  key={slot.label}
                  type="button"
                  disabled={booked || timePassed}
                  onClick={() => toggleSlot(slot.label)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    booked
                      ? 'bg-red-50 border-red-200 cursor-not-allowed opacity-70'
                      : timePassed
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                        : isSelected
                          ? 'bg-[#147c60] border-[#147c60] text-white shadow-lg shadow-emerald-200 transform scale-[1.02]'
                          : 'bg-white border-emerald-100 hover:border-[#147c60]/40 hover:bg-emerald-50 hover:shadow-md'
                  }`}
                >
                  <div className={`font-bold text-lg ${
                    isSelected ? 'text-white' : booked ? 'text-red-700' : timePassed ? 'text-gray-500 line-through' : 'text-slate-800'
                  }`}>
                    {slot.label}
                  </div>
                  <div className={`text-sm mt-1 font-medium ${
                    isSelected ? 'text-emerald-100' : booked ? 'text-red-500' : timePassed ? 'text-gray-400' : 'text-emerald-600'
                  }`}>
                    {booked ? '❌ Sudah Dibooking' : timePassed ? '⏰ Jam Lewat' : formatPrice(slot.price)}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedSlots.length > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">{selectedSlots.length} slot dipilih:</span>
              </div>
              {selectedSlots.map(s => {
                const slotData = availableSlots.find(as => as.label === s);
                return (
                  <div key={s} className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700">{s}</span>
                    <span className="font-medium text-emerald-800">{slotData ? formatPrice(slotData.price) : '-'}</span>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-800">Total:</span>
                <span className="text-lg font-bold text-[#147c60]">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Customer Information */}
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Informasi Customer</h3>
              <p className="text-sm text-slate-500">Masukkan detail tim dan kontak</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nama Tim <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Contoh: Tim Bola Keren"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Masukkan nama tim yang akan bermain</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Nomor HP aktif untuk konfirmasi</p>
            </div>
          </div>
        </section>

        {/* Payment Information */}
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Status Pembayaran</h3>
              <p className="text-sm text-slate-500">Pilih status pembayaran booking</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentStatus('pending')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  paymentStatus === 'pending'
                    ? 'bg-gray-100 border-gray-400 text-gray-700'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Belum Bayar</div>
                <div className="text-xs text-slate-500 mt-1">Menunggu pembayaran</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('dp')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  paymentStatus === 'dp'
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold">DP</div>
                <div className="text-xs text-slate-500 mt-1">Bayar sebagian</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('paid')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  paymentStatus === 'paid'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-green-200 hover:border-green-300'
                }`}
              >
                <div className="font-semibold">Lunas</div>
                <div className="text-xs text-slate-500 mt-1">Pembayaran lunas</div>
              </button>
            </div>

            {paymentStatus === 'dp' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Jumlah DP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400">Rp</span>
                  </div>
                  <input
                    type="text"
                    value={dpAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDpAmount(value);
                    }}
                    placeholder="500000"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                    required={paymentStatus === 'dp'}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Masukkan jumlah DP yang sudah dibayar
                </p>
              </div>
            )}

            {paymentStatus === 'paid' && selectedSlots.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Total pembayaran: {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Add-On Options */}
        <section className="premium-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Add-On (Opsional)</h3>
              <p className="text-sm text-slate-500">Layanan tambahan untuk booking</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              addDokumentasi
                ? 'bg-emerald-50 border-[#147c60] shadow-md'
                : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}>
              <input
                type="checkbox"
                checked={addDokumentasi}
                onChange={(e) => setAddDokumentasi(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                addDokumentasi ? 'bg-[#147c60] border-[#147c60]' : 'border-slate-300 bg-white'
              }`}>
                {addDokumentasi && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">📸 Dokumentasi</span>
                <p className="text-xs text-slate-500 mt-0.5">Dokumentasi foto & video selama bermain</p>
                <p className="text-xs text-amber-600 font-medium mt-0.5">⚠️ Harga: Konfirmasi via WhatsApp</p>
              </div>
            </label>
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              addWasit
                ? 'bg-emerald-50 border-[#147c60] shadow-md'
                : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}>
              <input
                type="checkbox"
                checked={addWasit}
                onChange={(e) => setAddWasit(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                addWasit ? 'bg-[#147c60] border-[#147c60]' : 'border-slate-300 bg-white'
              }`}>
                {addWasit && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">🏁 Wasit</span>
                <p className="text-xs text-slate-500 mt-0.5">Wasit profesional untuk pertandingan</p>
                <p className="text-xs text-amber-600 font-medium mt-0.5">⚠️ Harga: Konfirmasi via WhatsApp</p>
              </div>
            </label>
          </div>

          {(addDokumentasi || addWasit) && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mt-4">
              <p className="text-amber-700 text-sm flex items-start gap-2">
                <span className="text-lg flex-shrink-0">📋</span>
                <span>Harga add-on <strong>tidak termasuk</strong> dalam total harga lapangan. Konfirmasi harga via WhatsApp atau sesuaikan saat approve booking.</span>
              </p>
            </div>
          )}
        </section>

        {/* Summary & Actions */}
        <section className="bg-emerald-50/30 rounded-2xl border border-emerald-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Booking</h3>
          
          <div className="bg-white rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Tanggal</span>
              <span className="font-medium text-slate-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Jadwal</span>
              <span className="font-medium text-slate-900 text-right max-w-[250px]">
                {selectedSlots.length > 0 ? `${selectedSlots.length} slot (${selectedSlots.join(', ')})` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Nama Tim</span>
              <span className="font-medium text-slate-900">{teamName || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Nomor HP</span>
              <span className="font-medium text-slate-900">{phone || '-'}</span>
            </div>
            {(addDokumentasi || addWasit) && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Add-On</span>
                <div className="text-right">
                  {addDokumentasi && <span className="block text-sm font-medium text-slate-900">📸 Dokumentasi</span>}
                  {addWasit && <span className="block text-sm font-medium text-slate-900">🏁 Wasit</span>}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Total Harga ({selectedSlots.length * 2} jam)</span>
              <span className="text-xl font-bold text-[#147c60]">
                {totalPrice > 0 ? formatPrice(totalPrice) : '-'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:border-slate-300 font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || selectedSlots.length === 0 || !teamName || !phone}
              className="flex-1 px-6 py-3 bg-[#147c60] text-white rounded-xl hover:bg-[#106b52] font-semibold transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Buat Booking
                </>
              )}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
