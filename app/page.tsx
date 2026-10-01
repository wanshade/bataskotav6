import type { Metadata } from 'next';
import { HomePageClient } from '@/components/HomePageClient';

export const metadata: Metadata = {
  title: 'Batas Kota Point | The Social House',
  description: 'Born in Selong, Batas Kota Point brings sport, coffee, and community together. Discover Batas Kota Arena, matchday moments, and the upcoming Pora Social House.',
  keywords: ['Batas Kota Point', 'Pora Social House', 'Batas Kota Arena', 'mini soccer East Lombok', 'Social House Selong'],
  authors: [{ name: 'Batas Kota Team' }],
};

export default function HomePage() {
  return <HomePageClient />;
}
