'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Tag } from 'lucide-react';
import {
  type ScheduleData,
  DEFAULT_SCHEDULE,
  DAY_GROUPS,
  DAY_GROUP_LABELS,
  TIME_SLOTS,
} from '@/lib/schedule';
import { useToast } from '@/components/ui/Toast';

export default function PricingManager() {
  const toast = useToast();
  const [schedule, setSchedule] = useState<ScheduleData>(DEFAULT_SCHEDULE);
  const [original, setOriginal] = useState<ScheduleData>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/pricing');
        if (res.ok) {
          const data = await res.json();
          if (data.schedule) {
            setSchedule(data.schedule);
            setOriginal(data.schedule);
          }
        }
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const getPrice = (dayGroup: string, slot: string): number => {
    const item = schedule[dayGroup]?.find((i) => i.jam === slot);
    return item ? item.harga : 0;
  };

  const setPrice = (dayGroup: string, slot: string, value: number) => {
    setSchedule((prev) => {
      const next: ScheduleData = { ...prev };
      const items = (next[dayGroup] || []).map((i) =>
        i.jam === slot ? { ...i, harga: value } : i
      );
      // ensure slot exists
      if (!items.find((i) => i.jam === slot)) {
        items.push({ jam: slot, harga: value });
      }
      next[dayGroup] = items;
      return next;
    });
  };

  const hasChanges = JSON.stringify(schedule) !== JSON.stringify(original);

  const handleReset = () => {
    setSchedule(original);
  };

  const handleSave = async () => {
    setSaving(true);

    // Build flat list of updates (only changed ones)
    const updates: { dayGroup: string; timeSlot: string; price: number }[] = [];
    for (const group of DAY_GROUPS) {
      for (const slot of TIME_SLOTS) {
        const current = getPrice(group, slot);
        const orig = original[group]?.find((i) => i.jam === slot)?.harga;
        if (current !== orig) {
          updates.push({ dayGroup: group, timeSlot: slot, price: current });
        }
      }
    }

    if (updates.length === 0) {
      setSaving(false);
      toast.info('Tidak ada perubahan', 'Belum ada harga yang diubah.');
      return;
    }

    // Validate
    const invalid = updates.find((u) => !u.price || u.price <= 0);
    if (invalid) {
      setSaving(false);
      toast.error('Harga tidak valid', `${DAY_GROUP_LABELS[invalid.dayGroup]} ${invalid.timeSlot}`);
      return;
    }

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (res.ok) {
        setOriginal(schedule);
        toast.success('Harga tersimpan', `${updates.length} perubahan berhasil disimpan.`);
      } else {
        toast.error('Gagal menyimpan', data.error || 'Coba lagi.');
      }
    } catch {
      toast.error('Gagal menyimpan', 'Periksa koneksi lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="premium-card h-24 skeleton rounded-3xl" />
        <div className="premium-card h-96 skeleton rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="premium-card overflow-hidden relative">
        <div className="brand-gradient absolute inset-0 opacity-[0.97]" />
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4 p-6 lg:p-7">
          <div className="p-3 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white">Kelola Harga per Hari & Jam</h2>
            <p className="text-emerald-50/80 mt-1 text-sm max-w-2xl">
              Ubah harga sewa untuk tiap kelompok hari dan slot jam. Perubahan langsung berlaku di halaman booking publik setelah disimpan.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50/80">
                  Jam
                </th>
                {DAY_GROUPS.map((group) => (
                  <th
                    key={group}
                    className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {DAY_GROUP_LABELS[group]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TIME_SLOTS.map((slot) => (
                <tr key={slot} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap sticky left-0 bg-white">
                    <span className="font-mono text-sm font-semibold text-slate-600">{slot}</span>
                  </td>
                  {DAY_GROUPS.map((group) => {
                    const value = getPrice(group, slot);
                    const orig = original[group]?.find((i) => i.jam === slot)?.harga;
                    const changed = value !== orig;
                    return (
                      <td key={group} className="px-5 py-3">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-medium">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={value ? value.toLocaleString('id-ID') : ''}
                            onChange={(e) => {
                              const raw = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                              setPrice(group, slot, raw);
                            }}
                            className={`w-32 text-sm font-medium tabular-nums pl-8 pr-2 py-2 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#147c60]/20 focus:border-[#147c60] transition-all ${
                              changed
                                ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200'
                                : 'border-slate-200'
                            }`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <div className="premium-card flex items-center gap-3 px-4 py-3 w-full sm:w-auto sm:ml-auto">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-semibold mr-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Ada perubahan belum disimpan
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-5 py-2.5 brand-gradient text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 disabled:opacity-40 active:scale-95"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Harga
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
