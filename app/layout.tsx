import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap', fallback: ['system-ui', 'sans-serif'] });
const orbitron = Orbitron({
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Batas Kota | The Town Space",
  description:
    "Batas Kota – The Town Space hadir dengan lapangan mini soccer premium yang dirancang untuk memberikan pengalaman bermain terbaik.",
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.className} ${orbitron.className}`}
        style={{ backgroundColor: "#050505", color: "#ffffff" }}
        suppressHydrationWarning
      >
        <Providers>
          <div id="root">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
