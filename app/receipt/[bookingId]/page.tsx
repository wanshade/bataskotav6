'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Download, ArrowLeft, Calendar, Clock, User, Phone, Hash } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: number;
  bookingId: string;
  teamName: string;
  phone: string;
  bookingDate: string;
  timeSlot: string;
  price: number;
  status: string;
  createdAt: string;
  approvedAt?: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Booking not found');
        }
        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleDownload = async () => {
    if (!receiptRef.current || !booking) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        backgroundColor: '#050505',
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `kwitansi-${booking.bookingId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-red-500 mb-4">{error || 'Booking not found'}</p>
        <Link href="/" className="text-neon-green hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-6 px-3 sm:py-8 sm:px-4">
      {/* Action Buttons */}
      <div className="max-w-lg mx-auto mb-4 sm:mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Kembali</span>
        </Link>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-neon-green text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(20,124,96,0.5)] transition-all text-sm sm:text-base"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Download</span>
        </button>
      </div>

      {/* Receipt Card */}
      <div
        ref={receiptRef}
        className="max-w-lg mx-auto bg-[#050505] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
      >
        {/* Grid Background */}
        <div className="relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(20, 124, 96, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 124, 96, 0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-4 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-zinc-800">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider mb-1">
                BATAS KOTA
              </h1>
              <p className="text-neon-green text-xs sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                The Town Space
              </p>
              <div className="mt-3 sm:mt-4 inline-block px-3 sm:px-4 py-1 bg-neon-green/10 border border-neon-green/30 rounded-full">
                <span className="text-neon-green text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest">
                  KWITANSI PEMBAYARAN
                </span>
              </div>
            </div>

            {/* Status Badge */}
            {booking.status === 'confirmed' && (
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-500/10 border-2 border-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  <span className="text-green-500 font-black text-base sm:text-lg tracking-wider sm:tracking-widest uppercase">
                    LUNAS
                  </span>
                </div>
              </div>
            )}

            {/* Booking ID */}
            <div className="bg-zinc-900/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs uppercase tracking-wider">Booking ID</span>
                </div>
                <span className="font-mono text-neon-green font-bold text-sm sm:text-lg break-all">
                  {booking.bookingId}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neon-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Nama Tim</p>
                  <p className="text-white font-bold text-base sm:text-lg truncate">{booking.teamName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neon-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">No. WhatsApp</p>
                  <p className="text-white font-bold text-base sm:text-lg">{booking.phone}</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-zinc-900 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-neon-green/20 relative overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-neon-green" />
              <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-neon-green" />
              <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-neon-green" />
              <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-neon-green" />

              <h3 className="text-white font-bold mb-3 sm:mb-4 text-center uppercase tracking-wider text-xs sm:text-sm">
                Detail Pemesanan
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-zinc-800 gap-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Tanggal</span>
                  </div>
                  <span className="text-white font-medium text-sm sm:text-base">{booking.bookingDate}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Waktu</span>
                  </div>
                  <span className="text-neon-green font-bold text-sm sm:text-base">{booking.timeSlot}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
                  <span className="text-gray-400 text-xs sm:text-sm">Layanan</span>
                  <span className="text-white font-medium text-sm sm:text-base">Sewa Lapangan Mini Soccer</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-r from-red-500/10 to-transparent rounded-xl p-4 sm:p-5 border border-red-500/30 mb-4 sm:mb-6">
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-red-400 text-xs sm:text-sm font-bold mb-1">PERINGATAN PENIPUAN:</p>
                  <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed">
                    Pembayaran hanya transfer ke rekening atas nama <strong className="text-white">CV BATAS KOTA POINT</strong>. 
                    Kami tidak bertanggung jawab atas transfer ke rekening lain atau atas nama pribadi.
                  </p>
                </div>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-gradient-to-r from-neon-green/10 to-transparent rounded-xl p-4 sm:p-6 border border-neon-green/30 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">Total Pembayaran</span>
                <span className="text-2xl sm:text-3xl font-black text-neon-green drop-shadow-[0_0_10px_rgba(20,124,96,0.5)]">
                  {formatPrice(booking.price)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 sm:pt-6 border-t border-zinc-800">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">
                Terima kasih atas kepercayaan Anda!
              </p>
              <p className="text-gray-600 text-[10px] sm:text-xs font-mono">
                bataskotapoint.com
              </p>
              {booking.approvedAt && (
                <p className="text-gray-600 text-[10px] sm:text-xs mt-3 sm:mt-4">
                  Dikonfirmasi pada: {formatDate(booking.approvedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
