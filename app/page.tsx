import type { Metadata } from 'next';
import { HomePageClient } from '@/components/HomePageClient';

const title = 'Batas Kota Point | The Social House';
const description = 'Batas Kota is all about passion, happiness & togetherness. We bring sport, coffee, and community through the new lifestyle & trends. This year, we are introducing Pora Cafe where people gather & share love';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: 'Batas Kota Point',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
  keywords: ['Batas Kota Point', 'Pora Social House', 'Batas Kota Arena', 'mini soccer East Lombok', 'Social House Selong'],
  authors: [{ name: 'Batas Kota Team' }],
};

export default function HomePage() {
  return <HomePageClient />;
}
