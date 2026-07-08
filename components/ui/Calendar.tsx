'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import type { DayPickerProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalendarProps = DayPickerProps;

function Calendar({ className, classNames, components, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn('p-4', className)}
      classNames={{
        root: 'relative w-[19rem] font-sans text-slate-800',
        months: 'relative flex flex-col',
        month: 'space-y-4 pt-0',
        month_caption: 'relative flex h-11 items-center justify-center rounded-xl bg-slate-50 px-12',
        caption_label: 'text-[15px] font-black capitalize text-slate-900',
        nav: 'pointer-events-none absolute left-1 right-1 top-1 z-20 flex h-9 items-center justify-between',
        button_previous:
          'pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#147c60] disabled:pointer-events-none disabled:opacity-35',
        button_next:
          'pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#147c60] disabled:pointer-events-none disabled:opacity-35',
        month_grid: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7 gap-1 border-b border-slate-100 pb-2',
        weekday: 'flex h-8 items-center justify-center rounded-md text-center text-[11px] font-black uppercase tracking-wide text-slate-500',
        weeks: 'mt-2 grid gap-1',
        week: 'grid grid-cols-7 gap-1',
        day: 'relative flex h-10 w-10 items-center justify-center text-center text-sm',
        day_button:
          'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-[#147c60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147c60]/25',
        today: '[&>button]:border [&>button]:border-emerald-200 [&>button]:text-[#147c60]',
        selected:
          '[&>button]:bg-[#147c60] [&>button]:font-black [&>button]:text-white [&>button]:shadow-lg [&>button]:shadow-emerald-500/25 [&>button]:hover:bg-[#106b52] [&>button]:hover:text-white',
        outside: '[&>button]:text-slate-300 opacity-50',
        disabled: 'pointer-events-none [&>button]:text-slate-300 opacity-40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className={cn('h-4 w-4', chevronClassName)} {...chevronProps} />;
        },
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
