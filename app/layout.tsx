import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap', fallback: ['system-ui', 'sans-serif'] });
export const metadata: Metadata = {
  title: "Batas Kota Point | Pora.sch, Batas Kota Arena & Padel",
  description:
    "Booking mini soccer di Batas Kota Arena, Kota Selong. Kenali Pora.sch dan padel (Coming Soon).",
  keywords: [
    "arena olahraga",
    "pemesanan",
    "gaming",
    "fasilitas",
    "lapangan futsal",
  ],
  authors: [{ name: "Tim Batas Kota" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={inter.className}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
