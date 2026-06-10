import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';

const LocationSection: React.FC = () => {
  return (
    <section id="location" className="py-24 bg-dark-surface relative overflow-hidden">
       {/* Decorative Line */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-zinc-800 to-transparent hidden md:block" />

       {/* Background Glow */}
       <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase mb-4">
            Lokasi <span className="text-neon-green">Kami</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Mudah dijangkau, parkir luas, suasana nyaman
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Container */}
          <div className="lg:col-span-2 relative">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[16/10] group shadow-2xl">
              {/* Google Maps Embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.509623912215!2d116.537138674778!3d-8.653335991398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4f1c5b4e9c5f%3A0x3e0e5f1c5b4e9c5f!2sSelong%2C%20Lombok%20Timur%2C%20NTB!5e0!3m2!1sid!2sid!4v1708000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
              
              {/* Tech Overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 border-l-2 border-t-2 border-neon-green w-12 h-12 opacity-80" />
                <div className="absolute top-4 right-4 border-r-2 border-t-2 border-neon-green w-12 h-12 opacity-80" />
                <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-neon-green w-12 h-12 opacity-80" />
                <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-neon-green w-12 h-12 opacity-80" />
                
                {/* Scan line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green/50 to-transparent animate-scan" />
              </div>

              {/* Location Pin overlay */}
              <div className="absolute bottom-6 left-6 bg-black/90 backdrop-blur-md p-4 rounded-lg border border-neon-green/30 flex items-center gap-3">
                 <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                 <span className="font-display text-white text-sm">Batas Kota Arena</span>
              </div>
            </div>

            {/* Open Maps Button */}
            <a 
              href="https://maps.google.com/?q=-8.653335991398,116.537138674778" 
              target="_blank" 
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-neon-green font-display text-sm tracking-widest hover:text-white transition-colors group"
            >
              <Navigation className="w-4 h-4 group-hover:animate-bounce" />
              BUKA DI GOOGLE MAPS
            </a>
          </div>

          {/* Info Cards */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-neon-green/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center border border-neon-green/30 group-hover:bg-neon-green/20 transition-colors">
                  <MapPin className="text-neon-green w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-lg text-white mb-2">Batas Kota Arena</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Jalan Gajah Mada No. 45<br/>
                    Selong, Lombok Timur, NTB<br/>
                    <span className="text-neon-green">Indonesia 83612</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-neon-green/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center border border-neon-green/30 group-hover:bg-neon-green/20 transition-colors">
                  <Clock className="text-neon-green w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-lg text-white mb-2">Jam Operasional</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Senin - Jumat</span>
                      <span className="text-white">08:00 - 23:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sabtu - Minggu</span>
                      <span className="text-white">07:00 - 23:00</span>
                    </div>
                    <p className="text-neon-green text-xs mt-2">Pertandingan malam tersedia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 hover:border-neon-green/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-green/10 rounded-xl flex items-center justify-center border border-neon-green/30 group-hover:bg-neon-green/20 transition-colors">
                  <Phone className="text-neon-green w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-lg text-white mb-2">Kontak</h4>
                  <div className="space-y-2 text-sm">
                    <a href="tel:+6281234567890" className="block text-gray-400 hover:text-neon-green transition-colors">
                      +62 812-3456-7890
                    </a>
                    <a href="mailto:booking@bataskota.com" className="block text-gray-400 hover:text-neon-green transition-colors">
                      booking@bataskota.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LocationSection;