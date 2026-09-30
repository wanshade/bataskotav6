import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap', fallback: ['system-ui', 'sans-serif'] });
export const metadata: Metadata = {
  title: "Batas Kota Point | Pora.sch, Batas Kota Arena & Padel",
  description:
    "Batas Kota Point, kawasan olahraga dan ruang sosial di Pancor, Lombok Timur. Kenali Batas Kota Arena, Pora Social House, dan pengembangan padel.",
  keywords: [
    "arena olahraga",
    "pemesanan",
    "Batas Kota Point",
    "Pora Social House",
    "mini soccer Lombok Timur",
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
