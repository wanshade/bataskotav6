'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import DashboardOverview from '@/components/admin/DashboardOverview';
import BookingTable from '@/components/admin/BookingTable';
import ScheduleGrid from '@/components/admin/ScheduleGrid';
import AddBookingForm from '@/components/admin/AddBookingForm';
import PricingManager from '@/components/admin/PricingManager';
import { useToast } from '@/components/ui/Toast';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'schedule' | 'add-booking' | 'pricing'>('overview');
  // Bumping this signals child components to refetch their own data
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Close mobile drawer on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Compute today's date label for the topbar
  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const userRole = session?.user?.role || 'admin';
  const isAdminOrSuperadmin = userRole === 'admin' || userRole === 'superadmin';

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !isAdminOrSuperadmin) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  const triggerRefresh = () => setRefreshSignal((v) => v + 1);

  const updateBookingStatus = async (bookingId: string, action: 'approve' | 'reject'): Promise<boolean> => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        triggerRefresh();
        if (action === 'approve') {
          toast.success('Booking disetujui', `${bookingId} berhasil dikonfirmasi.`);
        } else {
          toast.warning('Booking ditolak', `${bookingId} telah dibatalkan.`);
        }
        return true;
      }
      toast.error('Gagal memproses', 'Terjadi kesalahan saat memproses booking.');
      return false;
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
      toast.error('Gagal memproses', 'Periksa koneksi lalu coba lagi.');
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddBookingSuccess = () => {
    triggerRefresh();
    toast.success('Booking dibuat', 'Booking baru berhasil ditambahkan.');
    // Switch to bookings tab after successful creation
    setTimeout(() => setActiveTab('bookings'), 1500);
  };

  const updatePaymentStatus = async (bookingId: string, paymentStatus: 'pending' | 'dp' | 'paid', dpAmount?: number) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, dpAmount }),
      });

      if (response.ok) {
        triggerRefresh();
        const label = paymentStatus === 'paid' ? 'Lunas' : paymentStatus === 'dp' ? 'DP' : 'Belum Bayar';
        toast.success('Pembayaran diperbarui', `Status pembayaran ${bookingId} → ${label}.`);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error('Gagal memperbarui pembayaran', data.error || 'Coba lagi.');
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error('Gagal memperbarui pembayaran', 'Periksa koneksi lalu coba lagi.');
    } finally {
      setActionLoading(null);
    }
  };

  const updatePrice = async (bookingId: string, price: number) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (response.ok) {
        triggerRefresh();
        toast.success('Harga diperbarui', `Harga ${bookingId} berhasil diubah.`);
      } else {
        const data = await response.json();
        toast.error('Gagal mengubah harga', data.error || 'Coba lagi.');
      }
    } catch (error) {
      console.error('Failed to update price:', error);
      toast.error('Gagal mengubah harga', 'Periksa koneksi lalu coba lagi.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/delete`, {
        method: 'DELETE'
      });

      if (response.ok) {
        triggerRefresh();
        toast.success('Booking dihapus', `${bookingId} telah dihapus permanen.`);
      } else {
        const data = await response.json();
        toast.error('Gagal menghapus', data.error || 'Coba lagi.');
      }
    } catch (error) {
      console.error('Failed to delete booking:', error);
      toast.error('Gagal menghapus', 'Periksa koneksi lalu coba lagi.');
    } finally {
      setActionLoading(null);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'bookings': return 'Booking Management';
      case 'schedule': return 'Arena Schedule';
      case 'add-booking': return 'Tambah Booking Baru';
      case 'pricing': return 'Kelola Harga';
      default: return 'Dashboard';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center admin-shell">
        <div className="flex flex-col items-center gap-4">
          <div className="brand-gradient h-14 w-14 rounded-2xl flex items-center justify-center text-white font-display font-black text-xl shadow-lg shadow-emerald-500/30 animate-pulse">
            B
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-100 border-t-[#147c60]"></div>
        </div>
      </div>
    );
  }

  if (!session || !isAdminOrSuperadmin) return null;

  return (
    <div className="admin-layout admin-shell min-h-screen font-sans text-slate-800">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => signOut()}
        userRole={userRole}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <main
        className={`transition-all duration-300 min-h-screen lg:ml-64 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
      >
        {/* Top Bar */}
        <header className="glass-surface h-20 border-b border-emerald-900/10 sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600/70 hidden sm:block">Admin Panel</p>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight truncate">
                {getPageTitle()}
              </h1>
              {/* Today's date — visible on md+ */}
              <p className="hidden md:block text-xs text-slate-400 mt-0.5">{todayLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {userRole === 'superadmin' && (
              <span className="hidden sm:inline-flex px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[11px] font-bold rounded-full shadow-md shadow-purple-500/25 tracking-wide">
                SUPER ADMIN
              </span>
            )}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">{session.user?.name}</span>
              <span className="text-xs text-slate-400">{session.user?.email}</span>
            </div>
            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${userRole === 'superadmin'
              ? 'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/25'
              : 'brand-gradient shadow-emerald-500/25'}`}>
              {session.user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div key={activeTab} className="p-4 sm:p-6 lg:p-8 animate-pop-in">
          {activeTab === 'overview' && (
            <DashboardOverview
              onViewAllBookings={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingTable
              refreshSignal={refreshSignal}
              actionLoading={actionLoading}
              onApprove={(id) => updateBookingStatus(id, 'approve')}
              onReject={(id) => updateBookingStatus(id, 'reject')}
              onUpdatePayment={updatePaymentStatus}
              onUpdatePrice={updatePrice}
              userRole={userRole}
              onDelete={deleteBooking}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleGrid
              refreshSignal={refreshSignal}
              onRefresh={triggerRefresh}
            />
          )}

          {activeTab === 'add-booking' && (
            <AddBookingForm
              onSuccess={handleAddBookingSuccess}
              onCancel={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'pricing' && <PricingManager />}
        </div>
      </main>
    </div>
  );
}
