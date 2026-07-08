import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Lock,
  AlertCircle,
  FileText,
  MessageCircle,
  Download,
  FileSpreadsheet,
  Wallet,
  CreditCard,
  Trash2,
  Pencil,
  FilterX
} from 'lucide-react';
import { Booking } from '@/lib/schema';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReceiptGenerator from './ReceiptGenerator';
import { exportToCSV, exportToExcel } from '@/lib/export';

interface AdminBooking extends Booking {
  id: number;
}

interface BookingTableProps {
  refreshSignal?: number;
  actionLoading: string | null;
  onApprove: (id: string) => Promise<boolean | void> | void;
  onReject: (id: string) => void;
  onUpdatePayment?: (id: string, paymentStatus: 'pending' | 'dp' | 'paid', dpAmount?: number) => Promise<void>;
  onUpdatePrice?: (id: string, price: number) => Promise<void>;
  userRole?: string;
  onDelete?: (id: string) => Promise<void>;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  revenue: number;
  pendingRevenue: number;
  dpCount: number;
}

const PAGE_SIZE = 20;

const toDateInputValue = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const parseDateInputValue = (value: string): Date | null => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatBookingDateLabel = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// Compact rupiah: shows JT for millions, RB for thousands.
const formatCompactRupiah = (amount: number): string => {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    // Up to 1 decimal, trim trailing .0
    return `Rp ${jt.toFixed(jt % 1 === 0 ? 0 : 1).replace('.', ',')} JT`;
  }
  if (amount >= 1_000) {
    return `Rp ${Math.round(amount / 1000)} RB`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default function BookingTable({
  refreshSignal = 0,
  actionLoading,
  onApprove,
  onReject,
  onUpdatePayment,
  onUpdatePrice,
  userRole = 'admin',
  onDelete
}: BookingTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Server-driven data
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [dateBookings, setDateBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateBookingsLoading, setDateBookingsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<BookingStats>({
    total: 0, pending: 0, confirmed: 0, revenue: 0, pendingRevenue: 0, dpCount: 0,
  });
  const [exporting, setExporting] = useState(false);

  const [receiptBooking, setReceiptBooking] = useState<AdminBooking | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | null;
    booking: AdminBooking | null;
  }>({ type: null, booking: null });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [dpInputValue, setDpInputValue] = useState<string>('');

  // Approval modal payment state
  const [approvalPaymentType, setApprovalPaymentType] = useState<'dp' | 'paid' | null>(null);
  const [approvalDpAmount, setApprovalDpAmount] = useState<string>('');

  // Lunasi modal state
  const [lunasiBooking, setLunasiBooking] = useState<AdminBooking | null>(null);
  const [lunasiLoading, setLunasiLoading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminBooking | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit price modal state
  const [editPriceBooking, setEditPriceBooking] = useState<AdminBooking | null>(null);
  const [priceInputValue, setPriceInputValue] = useState<string>('');
  const [priceLoading, setPriceLoading] = useState(false);

  // Generate WhatsApp confirmation message
  const generateWhatsAppMessage = (booking: AdminBooking) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const statusText = booking.status === 'confirmed'
      ? '✅ *DIKONFIRMASI*'
      : booking.status === 'cancelled'
        ? '❌ *DIBATALKAN*'
        : '⏳ *MENUNGGU KONFIRMASI*';

    const message = `
🏟️ *BATAS KOTA - THE TOWN SPACE*
━━━━━━━━━━━━━━━━━━━━

Halo *${booking.teamName}*! 👋

Terima kasih telah mempercayai kami untuk kebutuhan minisoccer Anda.

📋 *DETAIL PEMESANAN*
━━━━━━━━━━━━━━━━━━━━
🆔 ID Booking: *${booking.bookingId}*
📅 Tanggal: *${formatDate(booking.bookingDate)}*
⏰ Waktu: *${booking.timeSlot}*${booking.addDokumentasi || booking.addWasit ? `\n📌 Add-On: ${(booking.addDokumentasi ? '*📸 Dokumentasi*' : '')}${(booking.addDokumentasi && booking.addWasit ? ' & ' : '')}${(booking.addWasit ? '*🏁 Wasit*' : '')}` : ''}
💰 Total: *Rp ${booking.price.toLocaleString('id-ID')}*${booking.addDokumentasi || booking.addWasit ? '\n\n⚠️ *ADD-ON:* Harga add-on belum termasuk. Silakan konfirmasi harga via WhatsApp.' : ''}

📊 *STATUS PEMESANAN*
${statusText}

${booking.status === 'confirmed' ? `
✨ *Booking Anda telah dikonfirmasi!*

Silakan datang 15 menit sebelum waktu bermain untuk persiapan. Tim kami siap menyambut Anda di lapangan.

📍 Lokasi: Selong, Lombok Timur
📞 Info: 08xx-xxxx-xxxx

🚨 *PERINGATAN PENIPUAN*
━━━━━━━━━━━━━━━━━━━━
⚠️ Transfer HANYA ke rekening atas nama *CV BATAS KOTA POINT*
⚠️ Kami TIDAK bertanggung jawab atas transfer ke rekening lain
⚠️ Pastikan nama penerima sesuai sebelum transfer

🚫 *PERATURAN CANCEL*
━━━━━━━━━━━━━━━━━━━━

1️⃣ Jika melakukan pembatalan pemesanan maka sejumlah uang yang telah masuk dianggap *HANGUS* dan tidak bisa untuk merubah jadwal

2️⃣ Jika melakukan pembatalan atau perubahan jadwal saat hari yang sudah ditentukan maka pembayaran yang telah dilakukan akan dianggap *HANGUS*

3️⃣ Jika pergantian jadwal dari jam premium ke jam reguler maka kelebihan uang *tidak bisa di refund* untuk kelebihan biayanya

4️⃣ Jika pergantian jadwal dari jam reguler ke jam premium maka customer dikenakan *biaya tambahan*

📋 *BOOKING ORDER*
━━━━━━━━━━━━━━━━━━━━

1️⃣ Booking bisa melalui website atau via whatsapp admin
2️⃣ Tanda putih pada jadwal berarti available (jam kosong)
3️⃣ Jam kosong yang telah dibooking akan berubah menjadi kuning, berarti sudah dibooking dan customer diberikan kesempatan *15 menit* untuk melakukan pelunasan
4️⃣ Jika dalam 15 menit belum melakukan pelunasan maka secara otomatis tanda booking order pada website kembali menjadi putih (available) dan bisa kembali dibooking oleh siapa saja
5️⃣ Tanda merah pada booking order berarti customer sudah melakukan pembayaran dan siap untuk bermain pada jadwal tersebut

⏰ *PERIODE BOOKING ORDER*
━━━━━━━━━━━━━━━━━━━━

1️⃣ Minimum order *1 jam sebelumnya*. 1 jam sebelum jam bermain pada jadwal booking hanya bisa dibooking via whatsapp melalui admin
2️⃣ Silahkan menghubungi admin
3️⃣ Untuk booking *wajib melakukan pelunasan*

_Jangan lupa bawa air minum dan semangat juara!_ ⚽🔥
` : booking.status === 'cancelled' ? `
❌ *Pemesanan dibatalkan*

Maaf, pemesanan Anda tidak dapat diproses. Silakan hubungi kami untuk informasi lebih lanjut atau booking ulang.

📞 Hubungi: 08xx-xxxx-xxxx
` : `
⏳ *Menunggu Konfirmasi*

Pemesanan Anda sedang kami proses. Kami akan segera menghubungi Anda untuk konfirmasi.
`}

━━━━━━━━━━━━━━━━━━━━
_Terima kasih telah memilih Batas Kota!_
_Setiap permainan punya cerita._ ⚽✨
    `.trim();

    return encodeURIComponent(message);
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = (booking: AdminBooking) => {
    const message = generateWhatsAppMessage(booking);
    const whatsappUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const selectedDate = useMemo(() => (
    dateFilter ? parseDateInputValue(dateFilter) : null
  ), [dateFilter]);

  const selectedDateLabel = useMemo(() => (
    selectedDate ? formatBookingDateLabel(selectedDate) : ''
  ), [selectedDate]);

  const setDateFromOffset = useCallback((offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    setDateFilter(toDateInputValue(date));
  }, []);

  const dateScopedStats = useMemo<BookingStats>(() => {
    return dateBookings.reduce<BookingStats>((acc, booking) => {
      acc.total += 1;
      if (booking.status === 'pending') acc.pending += 1;
      if (booking.status === 'confirmed') {
        acc.confirmed += 1;
        const totalPrice = Number(booking.totalPrice || booking.price || 0);
        const dpAmount = Number(booking.dpAmount || 0);

        if (booking.paymentStatus === 'paid') {
          acc.revenue += totalPrice;
        } else if (booking.paymentStatus === 'dp') {
          acc.revenue += dpAmount;
          acc.pendingRevenue += Math.max(totalPrice - dpAmount, 0);
          acc.dpCount += 1;
        } else {
          acc.pendingRevenue += totalPrice;
        }
      }
      return acc;
    }, { total: 0, pending: 0, confirmed: 0, revenue: 0, pendingRevenue: 0, dpCount: 0 });
  }, [dateBookings]);

  const displayedStats = dateFilter ? dateScopedStats : stats;

  useEffect(() => {
    if (!dateFilter || !selectedDateLabel) {
      setDateBookings([]);
      return;
    }

    const controller = new AbortController();
    const fetchDateBookings = async () => {
      setDateBookingsLoading(true);
      try {
        const res = await fetch(
          `/api/admin/bookings/by-date?date=${encodeURIComponent(selectedDateLabel)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setDateBookings(data.bookings || []);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Failed to fetch date bookings:', error);
      } finally {
        if (!controller.signal.aborted) setDateBookingsLoading(false);
      }
    };

    fetchDateBookings();
    return () => controller.abort();
  }, [dateFilter, selectedDateLabel, refreshSignal]);

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, dateFilter]);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        status: statusFilter,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (dateFilter && selectedDateLabel) params.set('date', selectedDateLabel);

      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/admin/bookings/list?${params.toString()}`),
        fetch('/api/admin/bookings/stats'),
      ]);

      if (listRes.ok) {
        const data = await listRes.json();
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) {
          setStats({
            total: data.stats.total,
            pending: data.stats.pending,
            confirmed: data.stats.confirmed,
            revenue: data.stats.revenue,
            pendingRevenue: data.stats.pendingRevenue,
            dpCount: data.stats.dpCount,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, dateFilter, selectedDateLabel]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage, refreshSignal]);

  // Bookings come already filtered/sorted from the server
  const filteredBookings = bookings;

  // Export: fetch ALL matching rows from the server, then generate the file
  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, export: '1' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (dateFilter && selectedDateLabel) params.set('date', selectedDateLabel);
      const res = await fetch(`/api/admin/bookings/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const rows = data.bookings || [];
        if (format === 'csv') exportToCSV(rows);
        else exportToExcel(rows);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="premium-card p-5 h-28 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="premium-card h-96 skeleton rounded-3xl" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Bookings', value: String(displayedStats.total), icon: Calendar, grad: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
    { label: 'Pending', value: String(displayedStats.pending), icon: Clock, grad: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
    { label: 'Confirmed', value: String(displayedStats.confirmed), icon: CheckCircle, grad: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20' },
    { label: 'Status DP', value: String(displayedStats.dpCount), icon: CreditCard, grad: 'from-sky-500 to-blue-500', glow: 'shadow-blue-500/20' },
    { label: 'Diterima', value: formatCompactRupiah(displayedStats.revenue), icon: Wallet, grad: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/20' },
    { label: 'Belum Dibayar', value: formatCompactRupiah(displayedStats.pendingRevenue), icon: CreditCard, grad: 'from-orange-500 to-rose-500', glow: 'shadow-orange-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="premium-card premium-card-hover p-4 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.grad} shadow-lg ${c.glow} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-400">{c.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5 tabular-nums tracking-tight">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="premium-card p-4 space-y-3">
        <div className="flex flex-col xl:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tim, ID booking, atau telepon..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] text-slate-700 bg-slate-50/50 focus:bg-white placeholder:text-slate-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'cancelled')}
              className="w-full sm:w-44 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] text-slate-700 bg-slate-50/50 font-medium transition-all cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={exporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 bg-white transition-all font-medium disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {exporting ? '...' : 'Export'}
              </button>
              {exportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 premium-card z-20 overflow-hidden p-1.5">
                    <button
                      onClick={() => { handleExport('csv'); setExportMenuOpen(false); }}
                      disabled={exporting}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => { handleExport('excel'); setExportMenuOpen(false); }}
                      disabled={exporting}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      Export as Excel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:mr-1">Periode</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    dateFilter
                      ? 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                      : 'border-[#147c60] bg-emerald-50 text-[#147c60] shadow-sm shadow-emerald-100'
                  }`}
                >
                  <FilterX className="w-4 h-4" />
                  Semua tanggal
                </button>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`w-full sm:w-48 pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] text-slate-700 font-semibold transition-all ${
                      dateFilter
                        ? 'bg-white border-[#147c60]/40'
                        : 'bg-slate-50/60 border-slate-200 text-slate-500'
                    }`}
                    aria-label="Filter tanggal booking"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDateFromOffset(0)}
                  className="px-3 py-2 rounded-lg border border-emerald-100 text-sm font-semibold text-[#147c60] bg-white hover:bg-emerald-50 transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setDateFromOffset(1)}
                  className="px-3 py-2 rounded-lg border border-emerald-100 text-sm font-semibold text-[#147c60] bg-white hover:bg-emerald-50 transition-colors"
                >
                  Besok
                </button>
              </div>
            </div>
            <div className="min-h-8 flex items-center">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                dateFilter
                  ? 'bg-emerald-50 text-[#147c60] border border-emerald-100'
                  : 'bg-slate-100 text-slate-500 border border-slate-100'
              }`}>
                {dateFilter && selectedDateLabel ? selectedDateLabel : 'Semua tanggal aktif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {dateFilter ? 'Tabel Booking Per Tanggal' : 'Tabel Semua Booking'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {dateFilter && selectedDateLabel
                ? selectedDateLabel
                : 'Menampilkan booking dari semua tanggal'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(dateBookingsLoading || loading) && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-[#147c60] text-xs font-bold">
                <span className="w-3 h-3 border-2 border-emerald-200 border-t-[#147c60] rounded-full animate-spin" />
                Memuat
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              {total} Hasil
            </span>
            {dateFilter && (
              <>
                <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                  {dateScopedStats.pending} Pending
                </span>
                <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                  {dateScopedStats.confirmed} Confirmed
                </span>
              </>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pembayaran</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{booking.bookingId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{booking.teamName}</span>
                      <span className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3" /> {booking.phone}
                      </span>
                      {(booking.addDokumentasi || booking.addWasit) && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {booking.addDokumentasi && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                              📸 Dokumentasi
                            </span>
                          )}
                          {booking.addWasit && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              🏁 Wasit
                            </span>
                          )}
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            Harga konfirmasi
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{booking.bookingDate}</span>
                      <span className="text-xs text-slate-500">{booking.timeSlot}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs font-semibold text-[#147c60]">
                          Rp {Number(booking.totalPrice || booking.price).toLocaleString('id-ID')}
                        </span>
                        {onUpdatePrice && (
                          <button
                            onClick={() => {
                              setEditPriceBooking(booking);
                              setPriceInputValue(String(booking.totalPrice || booking.price));
                            }}
                            className="p-0.5 text-slate-400 hover:text-[#147c60] rounded transition-colors"
                            title="Ubah Harga"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingPayment === booking.bookingId ? (
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <select
                          value={booking.paymentStatus || 'pending'}
                          onChange={async (e) => {
                            const newStatus = e.target.value as 'pending' | 'dp' | 'paid';
                            if (newStatus === 'dp') {
                              // Keep editing mode for DP input
                              return;
                            }
                            if (onUpdatePayment) {
                              await onUpdatePayment(booking.bookingId, newStatus);
                            }
                            setEditingPayment(null);
                          }}
                          className="text-sm text-slate-800 px-3 py-2 border border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#147c60]/20"
                        >
                          <option value="pending">Belum Bayar</option>
                          <option value="dp">DP</option>
                          <option value="paid">Lunas</option>
                        </select>
                        {booking.paymentStatus === 'dp' && (
                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs">Rp</span>
                              <input
                                type="text"
                                placeholder="500000"
                                value={dpInputValue}
                                onChange={(e) => setDpInputValue(e.target.value.replace(/\D/g, ''))}
                                className="text-sm text-slate-800 pl-7 pr-2 py-2 border border-emerald-200 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 placeholder:text-slate-400"
                              />
                            </div>
                            <button
                              onClick={async () => {
                                const dpValue = parseInt(dpInputValue.replace(/\D/g, ''));
                                if (dpValue && onUpdatePayment) {
                                  await onUpdatePayment(booking.bookingId, 'dp', dpValue);
                                }
                                setEditingPayment(null);
                                setDpInputValue('');
                              }}
                              className="px-3 py-2 bg-[#147c60] text-white text-xs font-semibold rounded-lg hover:bg-[#106b52] transition-colors whitespace-nowrap"
                            >
                              Simpan
                            </button>
                          </div>
                        )}
                        {dpInputValue && (
                          <p className="text-xs text-emerald-600 font-medium">
                            Rp {parseInt(dpInputValue).toLocaleString('id-ID')}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setEditingPayment(null);
                            setDpInputValue('');
                          }}
                          className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                        >
                          ✕ Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                            booking.paymentStatus === 'dp' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'}`}
                        >
                          {booking.paymentStatus === 'paid' ? 'Lunas' :
                            booking.paymentStatus === 'dp' ? `DP ${booking.dpAmount ? formatCompactRupiah(booking.dpAmount) : ''}` :
                              'Belum Bayar'}
                        </span>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              setEditingPayment(booking.bookingId);
                              setDpInputValue(booking.dpAmount ? booking.dpAmount.toString() : '');
                            }}
                            className="p-1 text-slate-400 hover:text-[#147c60] rounded transition-colors"
                            title="Edit Pembayaran"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {booking.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setConfirmAction({ type: 'approve', booking });
                            // Default to full payment for approval
                            setApprovalPaymentType('paid');
                          }}
                          disabled={actionLoading === booking.bookingId}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: 'reject', booking })}
                          disabled={actionLoading === booking.bookingId}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        {/* Delete button - admin & superadmin */}
                        {(userRole === 'admin' || userRole === 'superadmin') && onDelete && (
                          <button
                            onClick={() => setDeleteTarget(booking)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {booking.status === 'confirmed' && (
                          <>
                            {/* Show Lunasi button for DP bookings */}
                            {booking.paymentStatus === 'dp' && onUpdatePayment && (
                              <button
                                onClick={() => setLunasiBooking(booking)}
                                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 rounded-lg transition-all text-sm font-semibold shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 hover:scale-[1.02] active:scale-95"
                                title="Lunasi Booking"
                              >
                                💰 Lunasi
                              </button>
                            )}
                            <button
                              onClick={() => sendWhatsAppMessage(booking)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Send WhatsApp Confirmation"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => window.open(`/receipt/${booking.bookingId}`, '_blank')}
                              className="p-2 text-[#147c60] hover:bg-emerald-50 rounded-lg transition-colors"
                              title="View Receipt"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <span className={`inline-flex items-center gap-1 text-sm ${booking.status === 'cancelled' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                          <Lock className="w-4 h-4" /> {booking.status === 'cancelled' ? 'Cancelled' : 'Processed'}
                        </span>
                        {/* Delete button - admin & superadmin */}
                        {(userRole === 'admin' || userRole === 'superadmin') && onDelete && (
                          <button
                            onClick={() => setDeleteTarget(booking)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-emerald-50 rounded-full">
                        <Calendar className="w-8 h-8 text-[#147c60]" />
                      </div>
                      <p className="text-slate-500">
                        {dateFilter && selectedDateLabel
                          ? `Tidak ada booking pada ${selectedDateLabel} untuk filter ini.`
                          : 'No bookings found matching your criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/30">
            <p className="text-sm text-slate-500">
              Menampilkan{' '}
              <span className="font-semibold text-slate-700">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </span>{' '}
              dari <span className="font-semibold text-slate-700">{total}</span> booking
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-emerald-100 text-slate-600 hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-emerald-100 text-slate-600 hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm font-semibold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-emerald-100 text-slate-600 hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 text-sm rounded-lg border border-emerald-100 text-slate-600 hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction.type && confirmAction.booking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-50">
              <AlertCircle className="w-7 h-7 text-[#147c60]" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
              {confirmAction.type === 'approve' ? 'Approve Booking' : 'Reject Booking'}
            </h3>
            <p className="text-center text-slate-500 mb-4">
              {confirmAction.type === 'approve'
                ? 'Pilih status pembayaran untuk booking ini:'
                : 'Are you sure you want to reject this booking?'}
              <br />
              <span className="font-semibold text-[#147c60]">
                {confirmAction.booking.teamName} - {confirmAction.booking.bookingId}
              </span>
            </p>

            {/* Payment Options for Approval */}
            {confirmAction.type === 'approve' && (
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApprovalPaymentType('dp')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${approvalPaymentType === 'dp'
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <div className="font-semibold text-sm">DP (Bayar Sebagian)</div>
                    <div className="text-xs text-slate-500 mt-1">Customer bayar DP</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalPaymentType('paid')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${approvalPaymentType === 'paid'
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                  >
                    <div className="font-semibold text-sm">Lunas</div>
                    <div className="text-xs text-slate-500 mt-1">Pembayaran penuh</div>
                  </button>
                </div>

                {approvalPaymentType === 'dp' && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <label className="block text-sm font-semibold text-slate-700">
                      💰 Jumlah DP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-medium">Rp</span>
                      <input
                        type="text"
                        value={approvalDpAmount}
                        onChange={(e) => setApprovalDpAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder="500000"
                        className="w-full pl-12 pr-4 py-3 text-lg font-semibold text-slate-800 bg-white border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-slate-300 transition-all"
                      />
                    </div>
                    {approvalDpAmount && (
                      <p className="text-sm font-semibold text-blue-700">
                        DP: Rp {parseInt(approvalDpAmount).toLocaleString('id-ID')}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Total harga: <span className="font-semibold">Rp {Number(confirmAction.booking.totalPrice || confirmAction.booking.price).toLocaleString('id-ID')}</span>
                    </p>
                  </div>
                )}

                {approvalPaymentType === 'paid' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Total pembayaran: <span className="font-bold">
                        Rp {Number(confirmAction.booking.totalPrice || confirmAction.booking.price).toLocaleString('id-ID')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const bookingIdToProcess = confirmAction.booking!.bookingId;
                  if (confirmAction.type === 'approve') {
                    // Update payment status first if needed
                    if (onUpdatePayment && approvalPaymentType) {
                      const dpValue = approvalPaymentType === 'dp' && approvalDpAmount
                        ? parseInt(approvalDpAmount)
                        : undefined;
                      await onUpdatePayment(bookingIdToProcess, approvalPaymentType, dpValue);
                    }
                    await onApprove(bookingIdToProcess);
                    window.open(`/receipt/${bookingIdToProcess}`, '_blank');
                  } else {
                    onReject(bookingIdToProcess);
                  }
                  setConfirmAction({ type: null, booking: null });
                  setApprovalPaymentType(null);
                  setApprovalDpAmount('');
                }}
                disabled={
                  actionLoading === confirmAction.booking.bookingId ||
                  (confirmAction.type === 'approve' && !approvalPaymentType) ||
                  (confirmAction.type === 'approve' && approvalPaymentType === 'dp' && !approvalDpAmount)
                }
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${confirmAction.type === 'approve'
                  ? 'bg-[#147c60] hover:bg-[#106b52] text-white disabled:bg-emerald-300 shadow-lg shadow-emerald-200'
                  : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300 shadow-lg shadow-red-200'
                  }`}
              >
                {actionLoading === confirmAction.booking.bookingId ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Yes, ${confirmAction.type === 'approve' ? 'Approve' : 'Reject'}`
                )}
              </button>
              <button
                onClick={() => {
                  setConfirmAction({ type: null, booking: null });
                  setApprovalPaymentType(null);
                  setApprovalDpAmount('');
                }}
                disabled={actionLoading === confirmAction.booking.bookingId}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors disabled:bg-slate-50 disabled:text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lunasi Confirmation Modal */}
      {lunasiBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-0 max-w-md w-full mx-4 shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -right-2 bottom-0 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-3xl">
                  💰
                </div>
                <h3 className="text-xl font-bold">Konfirmasi Pelunasan</h3>
                <p className="text-emerald-100 text-sm mt-1">Pastikan pembayaran sudah diterima</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tim</span>
                  <span className="font-bold text-slate-800">{lunasiBooking.teamName}</span>
                </div>
                <div className="border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Booking ID</span>
                  <span className="font-mono text-sm text-slate-600 bg-slate-200 px-2 py-0.5 rounded">{lunasiBooking.bookingId}</span>
                </div>
                <div className="border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tanggal</span>
                  <span className="text-sm font-semibold text-slate-700">{lunasiBooking.bookingDate}</span>
                </div>
                <div className="border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Jadwal</span>
                  <span className="text-sm font-semibold text-slate-700">{lunasiBooking.timeSlot}</span>
                </div>
                <div className="border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">DP Dibayar</span>
                  <span className="text-sm font-bold text-blue-600">
                    Rp {lunasiBooking.dpAmount ? Number(lunasiBooking.dpAmount).toLocaleString('id-ID') : '0'}
                  </span>
                </div>
                <div className="border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Sisa Pembayaran</span>
                  <span className="text-lg font-bold text-emerald-600">
                    Rp {(Number(lunasiBooking.totalPrice || lunasiBooking.price) - Number(lunasiBooking.dpAmount || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Total highlight */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Total Pembayaran Penuh</p>
                <p className="text-2xl font-bold text-emerald-700">
                  Rp {Number(lunasiBooking.totalPrice || lunasiBooking.price).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setLunasiBooking(null)}
                  disabled={lunasiLoading}
                  className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    if (onUpdatePayment) {
                      setLunasiLoading(true);
                      try {
                        await onUpdatePayment(lunasiBooking.bookingId, 'paid');
                      } finally {
                        setLunasiLoading(false);
                        setLunasiBooking(null);
                      }
                    }
                  }}
                  disabled={lunasiLoading}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 disabled:opacity-70 active:scale-95"
                >
                  {lunasiLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <span>✅ Ya, Lunasi</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Generator Modal */}
      {receiptBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Generate Receipt</h3>
              <button
                onClick={() => setReceiptBooking(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-slate-600">
                Generate receipt for <span className="font-semibold text-[#147c60]">{receiptBooking.teamName}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1 font-mono">
                Booking ID: {receiptBooking.bookingId}
              </p>
            </div>
            <ReceiptGenerator
              booking={receiptBooking}
              onGenerate={() => setReceiptBooking(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-0 max-w-md w-full mx-4 shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            {/* Header with danger gradient */}
            <div className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -right-2 bottom-0 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold">Hapus Booking</h3>
                <p className="text-red-100 text-sm mt-1">Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tim</span>
                  <span className="font-bold text-slate-800">{deleteTarget.teamName}</span>
                </div>
                <div className="border-t border-red-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Booking ID</span>
                  <span className="font-mono text-sm text-slate-600 bg-red-100 px-2 py-0.5 rounded">{deleteTarget.bookingId}</span>
                </div>
                <div className="border-t border-red-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tanggal</span>
                  <span className="text-sm font-semibold text-slate-700">{deleteTarget.bookingDate}</span>
                </div>
                <div className="border-t border-red-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Jadwal</span>
                  <span className="text-sm font-semibold text-slate-700">{deleteTarget.timeSlot}</span>
                </div>
                <div className="border-t border-red-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                    ${deleteTarget.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      deleteTarget.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'}`}>
                    {deleteTarget.status}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Data booking akan <span className="font-bold">dihapus permanen</span> dari database dan tidak bisa dikembalikan.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    if (onDelete) {
                      setDeleteLoading(true);
                      try {
                        await onDelete(deleteTarget.bookingId);
                      } finally {
                        setDeleteLoading(false);
                        setDeleteTarget(null);
                      }
                    }
                  }}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 disabled:opacity-70 active:scale-95"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menghapus...</span>
                    </div>
                  ) : (
                    <span>🗑️ Ya, Hapus</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {editPriceBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="bg-gradient-to-r from-[#147c60] to-emerald-500 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <Pencil className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Ubah Harga Booking</h3>
                  <p className="text-sm text-emerald-50">{editPriceBooking.bookingId}</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm text-slate-600">{editPriceBooking.teamName}</p>
                <p className="text-xs text-slate-500">{editPriceBooking.bookingDate} • {editPriceBooking.timeSlot}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Harga saat ini: <span className="font-semibold text-slate-700">Rp {Number(editPriceBooking.totalPrice || editPriceBooking.price).toLocaleString('id-ID')}</span>
                </p>
              </div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">Harga Baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">Rp</span>
                <input
                  type="text"
                  autoFocus
                  value={priceInputValue}
                  onChange={(e) => setPriceInputValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="500000"
                  className="w-full pl-11 pr-4 py-3 border border-emerald-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] placeholder:text-slate-400"
                />
              </div>
              {priceInputValue && (
                <p className="text-sm text-emerald-600 font-medium mt-2">
                  Rp {parseInt(priceInputValue).toLocaleString('id-ID')}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditPriceBooking(null);
                    setPriceInputValue('');
                  }}
                  disabled={priceLoading}
                  className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-70"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const value = parseInt(priceInputValue.replace(/\D/g, ''));
                    if (!value || value <= 0 || !onUpdatePrice) return;
                    setPriceLoading(true);
                    try {
                      await onUpdatePrice(editPriceBooking.bookingId, value);
                    } finally {
                      setPriceLoading(false);
                      setEditPriceBooking(null);
                      setPriceInputValue('');
                    }
                  }}
                  disabled={priceLoading || !priceInputValue || parseInt(priceInputValue) <= 0}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-[#147c60] to-emerald-500 hover:from-[#106b52] hover:to-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-70 active:scale-95"
                >
                  {priceLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    <span>Simpan Harga</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
