import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { adminWhatsAppNumber, adminWhatsAppUrl } from '@/lib/contact';

const rules = [
  {
    id: 'cancellation-rules',
    title: 'Peraturan Cancel',
    icon: AlertTriangle,
    accent: 'text-rose-700 dark:text-rose-400',
    items: [
      <>Jika melakukan pembatalan pemesanan maka sejumlah uang yang telah masuk dianggap <strong className="text-rose-700 dark:text-rose-400">HANGUS</strong> dan tidak bisa untuk merubah jadwal</>,
      <>Jika melakukan pembatalan atau perubahan jadwal saat hari yang sudah ditentukan maka pembayaran yang telah dilakukan akan dianggap <strong className="text-rose-700 dark:text-rose-400">HANGUS</strong></>,
      <>Jika pergantian jadwal dari jam premium ke jam reguler maka kelebihan uang <strong>tidak bisa di refund</strong> untuk kelebihan biayanya</>,
      <>Jika pergantian jadwal dari jam reguler ke jam premium maka customer dikenakan <strong>biaya tambahan</strong></>,
    ],
  },
  {
    id: 'booking-order-rules',
    title: 'Booking Order',
    icon: Calendar,
    accent: 'text-emerald-700 dark:text-emerald-400',
    items: [
      <>Booking bisa melalui <strong>website</strong> atau via <strong>WhatsApp admin</strong></>,
      <>Tanda <strong>putih</strong> pada jadwal berarti <strong>available</strong> (jam kosong)</>,
      <>Jam kosong yang telah dibooking akan berubah menjadi <strong className="text-amber-700 dark:text-amber-400">kuning</strong>, berarti sudah dibooking dan customer diberikan kesempatan <strong>15 menit</strong> untuk melakukan pelunasan</>,
      <>Jika dalam <strong>15 menit</strong> belum melakukan pelunasan maka secara otomatis tanda booking order pada website kembali menjadi <strong>putih</strong> (available) dan bisa kembali dibooking oleh siapa saja</>,
      <>Tanda <strong className="text-rose-700 dark:text-rose-400">merah</strong> pada booking order berarti customer sudah melakukan pembayaran dan siap untuk bermain pada jadwal tersebut</>,
    ],
  },
  {
    id: 'booking-period-rules',
    title: 'Periode Booking Order',
    icon: Clock,
    accent: 'text-amber-700 dark:text-amber-400',
    items: [
      <>Minimum order <strong>1 jam sebelumnya</strong>. 1 jam sebelum jam bermain pada jadwal booking hanya bisa dibooking via <strong>WhatsApp</strong> melalui admin</>,
      <>Silahkan menghubungi {adminWhatsAppNumber ? <a href={adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 hover:text-neutral-950 dark:hover:text-white">admin</a> : <strong>admin</strong>}</>,
      <>Untuk booking <strong>wajib melakukan pelunasan</strong></>,
    ],
  },
];

export function BookingRules() {
  return (
    <section id="booking-rules" aria-label="Peraturan booking Batas Kota Arena" className="bg-neutral-50 pb-16 dark:bg-black md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {rules.map(({ id, title, icon: Icon, accent, items }) => (
            <section key={id} aria-labelledby={id} className="grid gap-6 py-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10 md:py-10">
              <h2 id={id} className="flex items-start gap-3 text-lg font-semibold text-neutral-900 dark:text-white">
                <Icon aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
                {title}
              </h2>
              <ol className="space-y-5">
                {items.map((item, index) => (
                  <li key={`${id}-${index}`} className="flex items-start gap-3 sm:gap-4">
                    <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold tabular-nums ${accent}`}>{index + 1}</span>
                    <p className="min-w-0 pt-0.5 text-sm leading-6 text-neutral-600 dark:text-neutral-400 [&_strong]:font-semibold [&_strong:not([class])]:text-neutral-900 dark:[&_strong:not([class])]:text-neutral-100">{item}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
