import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Gallery from './components/Gallery';
import VideoShowcase from './components/VideoShowcase';
import BookingSection from './components/BookingSection';
import LocationSection from './components/LocationSection';
import ClosingCTA from './components/ClosingCTA';
import Footer from './components/Footer';
import FloatingBookingButton from './components/FloatingBookingButton';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-neon-green selection:text-black overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <VideoShowcase />
        <Features />
        <Gallery />
        <BookingSection />
        <LocationSection />
        <ClosingCTA />
      </main>
      <Footer />
      <FloatingBookingButton />
    </div>
  );
};

export default App;