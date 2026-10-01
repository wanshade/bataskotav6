import venueOverview from '@/assets/hero batas kota point.jpeg';
import venueEntrance from '@/assets/hero batas kota point2.jpeg';
import poraFriends from '@/assets/pora-social-1.jpg';
import poraWelcome from '@/assets/pora-social-2.jpg';
import poraCoffee from '@/assets/pora-social-3.jpg';
import poraConversation from '@/assets/pora-social-4.jpg';
import poraGathering from '@/assets/pora-social-5.jpg';
import logo from '@/assets/logo.jpeg';

export const VENUE_IMAGES = { venueOverview, venueEntrance, logo };
export const HERO_GALLERY = [
  { image: poraCoffee, alt: 'A quiet moment with coffee and a book', position: '42% 45%' },
  { image: poraConversation, alt: 'Friends sharing a conversation over coffee', position: '60% 45%' },
  { image: poraFriends, alt: 'Friends enjoying coffee together', position: '50% 50%' },
];
export const CAFE_GALLERY = [
  { image: poraFriends, alt: 'Friends enjoying coffee together', position: '50% 50%' },
  { image: poraWelcome, alt: 'A welcoming cafe setting', position: '50% 40%' },
  { image: poraCoffee, alt: 'A quiet moment with coffee and a book', position: '50% 45%' },
  { image: poraConversation, alt: 'Friends sharing a conversation over coffee', position: '60% 45%' },
  { image: poraGathering, alt: 'A group gathering around a cafe table', position: '50% 45%' },
];
