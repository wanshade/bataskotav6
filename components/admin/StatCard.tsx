import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color: 'emerald' | 'amber' | 'green' | 'blue' | 'purple' | 'rose';
}

const colorStyles = {
  emerald: { iconBg: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20', ring: 'bg-emerald-500/10', accent: 'text-emerald-600' },
  amber: { iconBg: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20', ring: 'bg-amber-500/10', accent: 'text-amber-600' },
  green: { iconBg: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20', ring: 'bg-green-500/10', accent: 'text-green-600' },
  blue: { iconBg: 'from-sky-500 to-blue-500', glow: 'shadow-blue-500/20', ring: 'bg-blue-500/10', accent: 'text-blue-600' },
  purple: { iconBg: 'from-purple-500 to-indigo-500', glow: 'shadow-purple-500/20', ring: 'bg-purple-500/10', accent: 'text-purple-600' },
  rose: { iconBg: 'from-rose-500 to-pink-500', glow: 'shadow-rose-500/20', ring: 'bg-rose-500/10', accent: 'text-rose-600' },
};

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="premium-card premium-card-hover p-5 relative overflow-hidden group">
      {/* Decorative ring */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${styles.ring} blur-xl opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="relative flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${styles.iconBg} shadow-lg ${styles.glow} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1 tabular-nums tracking-tight">{value}</p>
        {trend && <p className="text-xs text-slate-400 mt-1">{trend.label}</p>}
      </div>
    </div>
  );
}
