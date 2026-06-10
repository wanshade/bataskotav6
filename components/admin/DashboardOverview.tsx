import { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Booking } from '@/lib/schema';
import StatCard from './StatCard';
import RecentBookings from './RecentBookings';
import { exportToCSV, exportToExcel, exportFullReport } from '@/lib/export';

interface AdminBooking extends Booking {
  id: number;
}

interface DashboardOverviewProps {
  onViewAllBookings: () => void;
}

interface OverviewStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  revenue: number;
  revenueByDate: { date: string; revenue: number }[];
  weeklyTrend: { day: string; bookings: number }[];
  recent: AdminBooking[];
}

const COLORS = {
  confirmed: '#22c55e',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  available: '#94a3b8'
};

export default function DashboardOverview({ onViewAllBookings }: DashboardOverviewProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<OverviewStats>({
    total: 0, pending: 0, confirmed: 0, cancelled: 0, revenue: 0,
    revenueByDate: [], weeklyTrend: [], recent: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/bookings/stats');
        if (res.ok) {
          const json = await res.json();
          if (json.stats) setData(json.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = {
    total: data.total,
    pending: data.pending,
    confirmed: data.confirmed,
    cancelled: data.cancelled,
    revenue: data.revenue,
  };

  const revenueByDate = data.revenueByDate;

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => [
    { name: 'Confirmed', value: stats.confirmed, color: COLORS.confirmed },
    { name: 'Pending', value: stats.pending, color: COLORS.pending },
    { name: 'Cancelled', value: stats.cancelled, color: COLORS.cancelled }
  ].filter(item => item.value > 0), [stats.confirmed, stats.pending, stats.cancelled]);

  const weeklyTrend = data.weeklyTrend;

  // Export fetches all rows from the server
  const handleExport = async (format: 'csv' | 'excel' | 'full') => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/bookings/list?status=all&export=1');
      if (res.ok) {
        const json = await res.json();
        const rows = json.bookings || [];
        if (format === 'csv') exportToCSV(rows);
        else if (format === 'excel') exportToExcel(rows);
        else exportFullReport(rows);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data');
    } finally {
      setExporting(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="premium-card p-5">
              <div className="h-12 w-12 skeleton rounded-2xl mb-4"></div>
              <div className="h-3 w-24 skeleton rounded mb-3"></div>
              <div className="h-7 w-20 skeleton rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 premium-card p-6 h-80 skeleton rounded-3xl"></div>
          <div className="premium-card p-6 h-80 skeleton rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="premium-card overflow-hidden relative">
        <div className="brand-gradient absolute inset-0 opacity-[0.97]" />
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-6 lg:p-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Selamat datang kembali</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">Dashboard Overview</h2>
            <p className="text-emerald-50/80 mt-1.5 text-sm">Pantau performa arena Anda secara real-time.</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold transition-all disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Menyiapkan...' : 'Export Data'}
            </button>
            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-52 premium-card z-20 overflow-hidden p-1.5">
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
                  <button
                    onClick={() => { handleExport('full'); setExportMenuOpen(false); }}
                    disabled={exporting}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors border-t border-slate-100 mt-1 pt-2.5 disabled:opacity-50 text-sm font-medium"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Full Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.revenue)}
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Revenue Trend</h3>
                <p className="text-sm text-slate-400">Pendapatan booking terkonfirmasi</p>
              </div>
            </div>
          </div>
          <div className="h-64">
            {revenueByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDate}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1fbf8f" />
                      <stop offset="100%" stopColor="#147c60" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f1" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(20,124,96,0.05)' }}
                    formatter={(value) => [formatPrice(Number(value)), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      boxShadow: '0 10px 30px -8px rgba(16,24,40,0.18)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-slate-50 rounded-full"><TrendingUp className="w-6 h-6 text-slate-300" /></div>
                <p className="text-slate-400 text-sm">Belum ada data pendapatan</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Booking Status</h3>
              <p className="text-sm text-slate-400">Distribusi status</p>
            </div>
          </div>
          <div className="h-48">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      boxShadow: '0 10px 30px -8px rgba(16,24,40,0.18)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400 text-sm">Belum ada data</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-slate-600">{item.name} <span className="font-bold text-slate-800">{item.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Trend & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Booking Trend */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Weekly Trend</h3>
                <p className="text-sm text-slate-400">Booking 7 hari terakhir</p>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#147c60" />
                    <stop offset="100%" stopColor="#1fbf8f" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f1" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px -8px rgba(16,24,40,0.18)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="url(#trendLine)"
                  strokeWidth={3}
                  dot={{ fill: '#147c60', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#147c60', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings */}
        <RecentBookings bookings={data.recent} onViewAll={onViewAllBookings} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          onClick={onViewAllBookings}
          className="premium-card premium-card-hover flex items-center justify-between p-5 group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Kelola Booking</h4>
              <p className="text-sm text-slate-400">Lihat & approve booking</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </button>

        <div className="premium-card flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Menunggu Aksi</h4>
              <p className="text-sm text-slate-400">{stats.pending} booking perlu approval</p>
            </div>
          </div>
          {stats.pending > 0 && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full tabular-nums">
              {stats.pending}
            </span>
          )}
        </div>

        <div className="premium-card flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg shadow-rose-500/20">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Dibatalkan</h4>
              <p className="text-sm text-slate-400">{stats.cancelled} booking dibatalkan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
