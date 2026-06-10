import {
  LayoutDashboard,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PlusCircle,
  Home,
  Shield,
  Tag
} from 'lucide-react';

type TabId = 'overview' | 'bookings' | 'schedule' | 'add-booking' | 'pricing';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onLogout: () => void;
  userRole?: string;
}

const navItems: { id: TabId; label: string; icon: typeof Home; group: string }[] = [
  { id: 'overview', label: 'Overview', icon: Home, group: 'Utama' },
  { id: 'bookings', label: 'Bookings', icon: LayoutDashboard, group: 'Utama' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, group: 'Utama' },
  { id: 'add-booking', label: 'Tambah Booking', icon: PlusCircle, group: 'Aksi' },
  { id: 'pricing', label: 'Kelola Harga', icon: Tag, group: 'Aksi' },
];

export default function Sidebar({ isOpen, toggleSidebar, activeTab, setActiveTab, onLogout, userRole = 'admin' }: SidebarProps) {
  const groups = ['Utama', 'Aksi'];

  return (
    <aside
      className={`glass-surface h-screen fixed left-0 top-0 transition-all duration-300 z-30 flex flex-col border-r border-emerald-900/10 ${isOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-emerald-900/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="brand-gradient h-11 w-11 min-w-[44px] rounded-2xl flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-emerald-500/25">
            B
          </div>
          <div className={`transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <p className="font-display font-bold text-slate-800 leading-tight tracking-wide">BATAS KOTA</p>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Town Space</p>
          </div>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 h-7 w-7 rounded-full bg-white border border-emerald-900/10 shadow-md flex items-center justify-center text-emerald-700 hover:bg-emerald-50 hover:scale-110 transition-all z-40"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Role badge */}
      <div className="px-3 pt-5 pb-2">
        <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${userRole === 'superadmin'
          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100'
          : 'brand-gradient-soft border border-emerald-100'} ${isOpen ? '' : 'justify-center'}`}>
          <Shield className={`w-4 h-4 min-w-[16px] ${userRole === 'superadmin' ? 'text-purple-600' : 'text-emerald-600'}`} />
          {isOpen && (
            <span className={`text-xs font-bold ${userRole === 'superadmin' ? 'text-purple-700' : 'text-emerald-700'}`}>
              {userRole === 'superadmin' ? 'Super Admin' : 'Administrator'}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group}>
            {isOpen && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group}</p>
            )}
            <div className="space-y-1">
              {navItems.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={!isOpen ? item.label : undefined}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${active
                      ? 'brand-gradient text-white nav-active-glow'
                      : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-700'} ${isOpen ? '' : 'justify-center'}`}
                  >
                    <Icon className={`w-[18px] h-[18px] min-w-[18px] transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                    {isOpen && <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-emerald-900/10">
        <button
          onClick={onLogout}
          title={!isOpen ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all ${isOpen ? '' : 'justify-center'}`}
        >
          <LogOut className="w-[18px] h-[18px] min-w-[18px]" />
          {isOpen && <span className="text-sm font-semibold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
