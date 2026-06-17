"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Copy,
} from "lucide-react";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team") || "-";
  const date = searchParams.get("date") || "-";
  const time = searchParams.get("time") || "-";
  const price = searchParams.get("price") || "-";
  const phone = searchParams.get("phone") || "-";
  const bookingId = searchParams.get("bookingId") || "-";

  // Load from environment variables
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "Bank Mandiri";
  const bankAccount =
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "1610016475977";
  const bankAccountName =
    process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "CV BATAS KOTA POINT";
  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "08123456789";

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-24 pb-16 font-sans">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-green/10 border-2 border-neon-green mb-6 animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-neon-green" />
          </div>
          <h1 className="font-sans font-bold text-4xl md:text-5xl uppercase mb-4">
            Pemesanan <span className="text-neon-green">Berhasil!</span>
          </h1>
          <p className="text-gray-400 text-lg font-sans">
            Terima kasih telah memesan lapangan di Batas Kota
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent" />

          <h2 className="font-sans font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <Calendar className="text-neon-green w-5 h-5" /> Detail Pemesanan
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-gray-400">Booking ID</span>
              <span className="text-neon-green font-mono font-bold">
                {bookingId}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-gray-400">Nama Tim</span>
              <span className="text-white font-medium font-sans">{teamName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-gray-400">Tanggal</span>
              <span className="text-white font-medium font-sans">{date}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-gray-400">Waktu</span>
              <span className="text-white font-medium font-sans">{time}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-gray-400">Nomor WhatsApp</span>
              <span className="text-white font-medium font-sans">{phone}</span>
            </div>
            
            {(searchParams.get("dokumentasi") === '1' || searchParams.get("wasit") === '1') && (
              <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                <span className="text-gray-400">Add-On</span>
                <div className="flex flex-col gap-1 text-right">
                  {searchParams.get("dokumentasi") === '1' && (
                    <span className="text-white font-medium text-sm">📸 Dokumentasi</span>
                  )}
                  {searchParams.get("wasit") === '1' && (
                    <span className="text-white font-medium text-sm">🏁 Wasit</span>
                  )}
                  <span className="text-xs text-yellow-500">(Konfirmasi harga via WhatsApp)</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 text-lg font-sans">Total Pembayaran Lapangan</span>
              <span className="text-neon-green font-sans font-bold text-2xl">
                {price}
              </span>
            </div>
            
            {(searchParams.get("dokumentasi") === '1' || searchParams.get("wasit") === '1') && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-2">                <p className="text-yellow-400 text-sm flex items-start gap-2">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <span><strong>Add-On:</strong> Harga add-on belum termasuk dalam total di atas. Silakan konfirmasi harga via WhatsApp.</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent" />

          <h2 className="font-sans font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <CreditCard className="text-neon-green w-5 h-5" /> Instruksi
            Pembayaran
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-gray-400 text-sm mb-4">
                Silakan transfer ke rekening berikut:
              </p>

              <div className="bg-black/50 rounded-lg p-5 border border-zinc-700">
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-sans">
                      Nama Penerima
                    </p>
                    <p className="text-white font-bold text-lg font-sans">
                      {bankAccountName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-sans">
                      Bank
                    </p>
                    <p className="text-white font-bold text-lg font-sans">
                      {bankName.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-sans">
                      Nomor Rekening
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-neon-green font-mono font-bold text-2xl">
                        {bankAccount}
                      </p>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors group"
                        title="Salin nomor rekening"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-5 h-5 text-neon-green" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400 group-hover:text-neon-green" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>PERINGATAN PENIPUAN:</strong> Transfer hanya ke rekening atas nama <strong className="text-white">CV BATAS KOTA POINT</strong>. 
                  Kami tidak bertanggung jawab atas transfer ke rekening lain atau atas nama pribadi (selain CV BATAS KOTA POINT).
                  Pastikan nama penerima sesuai sebelum melakukan transfer.
                </span>
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-500 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Penting:</strong> Setelah melakukan pembayaran, harap
                  konfirmasi melalui WhatsApp ke <strong>{adminWhatsApp}</strong> dengan
                  melampirkan bukti transfer.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Peraturan Cancel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent" />

          <h2 className="font-sans font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <AlertTriangle className="text-red-500 w-5 h-5" /> Peraturan Cancel
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika melakukan pembatalan pemesanan maka sejumlah uang yang telah masuk dianggap <strong className="text-red-400">HANGUS</strong> dan tidak bisa untuk merubah jadwal
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">2</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika melakukan pembatalan atau perubahan jadwal saat hari yang sudah ditentukan maka pembayaran yang telah dilakukan akan dianggap <strong className="text-red-400">HANGUS</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">3</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika pergantian jadwal dari jam premium ke jam reguler maka kelebihan uang <strong className="text-red-400">tidak bisa di refund</strong> untuk kelebihan biayanya
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center">
                <span className="text-red-500 font-bold">4</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika pergantian jadwal dari jam reguler ke jam premium maka customer dikenakan <strong className="text-yellow-400">biaya tambahan</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Booking Order */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent" />

          <h2 className="font-sans font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <Calendar className="text-neon-green w-5 h-5" /> Booking Order
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Booking bisa melalui <strong className="text-white">website</strong> atau via <strong className="text-white">WhatsApp admin</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">2</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Tanda <strong className="text-white">putih</strong> pada jadwal berarti <strong className="text-white">available</strong> (jam kosong)
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">3</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jam kosong yang telah dibooking akan berubah menjadi <strong className="text-yellow-400">kuning</strong>, berarti sudah dibooking dan customer diberikan kesempatan <strong className="text-white">15 menit</strong> untuk melakukan pelunasan
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">4</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Jika dalam <strong className="text-white">15 menit</strong> belum melakukan pelunasan maka secara otomatis tanda booking order pada website kembali menjadi <strong className="text-white">putih</strong> (available) dan bisa kembali dibooking oleh siapa saja
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green flex items-center justify-center">
                <span className="text-neon-green font-bold">5</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Tanda <strong className="text-red-400">merah</strong> pada booking order berarti customer sudah melakukan pembayaran dan siap untuk bermain pada jadwal tersebut
              </p>
            </div>
          </div>
        </div>

        {/* Periode Booking Order */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-transparent" />

          <h2 className="font-sans font-bold text-xl mb-6 flex items-center gap-2 text-white">
            <Clock className="text-yellow-500 w-5 h-5" /> Periode Booking Order
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">1</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Minimum order <strong className="text-white">1 jam sebelumnya</strong>. 1 jam sebelum jam bermain pada jadwal booking hanya bisa dibooking via <strong className="text-white">WhatsApp</strong> melalui admin
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">2</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Silahkan menghubungi <strong className="text-white">admin</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500 flex items-center justify-center">
                <span className="text-yellow-500 font-bold">3</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed pt-1">
                Untuk booking <strong className="text-white">wajib melakukan pelunasan</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/#booking"
            className="flex-1 text-center px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-sans font-bold uppercase transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <a
            href={`https://wa.me/${adminWhatsApp
              .replace(/^0/, "62")
              .replace(/\D/g, "")}?text=${encodeURIComponent(
                `Halo, saya ingin konfirmasi pembayaran untuk booking lapangan atas nama ${teamName}, nomor HP: ${phone}, Booking ID: ${bookingId}`
              )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-6 py-4 bg-neon-green hover:bg-neon-green/90 text-black rounded-xl font-sans font-bold uppercase transition-colors"
          >
            Konfirmasi via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="text-neon-green text-2xl font-sans animate-pulse">
            Loading...
          </div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
