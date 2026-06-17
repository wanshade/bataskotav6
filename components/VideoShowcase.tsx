import React from 'react';
import { Zap } from 'lucide-react';

const VideoShowcase: React.FC = () => {
  return (
    <section id="video" className="py-20 bg-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent" />
      <div className="absolute -left-20 top-1/2 w-60 h-60 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-0 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-neon-green fill-neon-green animate-pulse" />
            <span className="font-display text-neon-green tracking-[0.2em] text-xs uppercase font-bold">Showcase Resmi</span>
            <Zap className="w-4 h-4 text-neon-green fill-neon-green animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase mb-4">
            Rasakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-500 drop-shadow-[0_0_10px_rgba(20,124,96,0.5)]">Aksinya</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Tonton highlightnya. Rasakan atmosfernya. Di sinilah permainan berevolusi.
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative group">
          {/* Neon Glow Underlay */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green via-emerald-500 to-neon-green rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
          
          {/* Video Container */}
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl aspect-video z-10">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/cz5sCPi4kr4?rel=0&modestbranding=1&controls=1" 
              title="Batas Kota Video Showcase"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Cyberpunk Corners */}
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-neon-green/50 rounded-tl-lg z-20 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-neon-green/50 rounded-br-lg z-20 group-hover:scale-110 transition-transform duration-300"></div>
          
          {/* Side Accents */}
          <div className="absolute top-1/2 -left-6 w-1 h-16 bg-neon-green/20 rounded-full transform -translate-y-1/2 hidden md:block"></div>
          <div className="absolute top-1/2 -right-6 w-1 h-16 bg-neon-green/20 rounded-full transform -translate-y-1/2 hidden md:block"></div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;