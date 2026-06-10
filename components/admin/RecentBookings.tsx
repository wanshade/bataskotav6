import { Booking } from '@/lib/schema';
import { Calendar, Clock, ArrowRight, CheckCircle2, Clock3, XCircle } from 'lucide-react';

interface AdminBooking extends Booking {
  id: number;
}

interface RecentBookingsProps {
  bookings: AdminBooking[];
  onViewAll: () => void;
}

export default function RecentBookings({ bookings, onViewAll }: RecentBookingsProps) {
  // Get 5 most recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock3 className="w-4 h-4 text-amber-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock3 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Recent Bookings</h3>
            <p className="text-sm text-slate-400">Aktivitas booking terbaru</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:gap-2 transition-all"
        >
          Lihat Semua
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {recentBookings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl w-fit mx-auto mb-3">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">Belum ada booking</p>
          </div>
        ) : (
          recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 hover:bg-emerald-50/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl brand-gradient-soft flex items-center justify-center font-bold text-emerald-700 text-sm">
                    {booking.teamName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{booking.teamName}</p>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.bookingDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.timeSlot}
                        </span>
                      </div>

                      {(booking.addDokumentasi || booking.addWasit) && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {booking.addDokumentasi && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                              📸 Dok
                            </span>
                          )}
                          {booking.addWasit && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              🏁 Wasit
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 tabular-nums">{formatPrice(Number(booking.price))}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mt-1 ${getStatusStyle(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
