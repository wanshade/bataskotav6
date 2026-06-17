import React from 'react';
import NeonButton from './ui/NeonButton';
import { ChevronRight } from 'lucide-react';

const ClosingCTA: React.FC = () => {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg opacity-90" />
        
        {/* Football Pattern - Hexagons */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32V51.96L30 69.28L0 51.96V17.32L30 0Z' fill='none' stroke='%2339ff14' stroke-width='1'/%3E%3Cpath d='M30 52L60 69.32V103.96L30 121.28L0 103.96V69.32L30 52Z' fill='none' stroke='%2339ff14' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 104px',
          }}
        />

        {/* Football Field Abstract Lines - Center Circle & Midline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-2 border-neon-green/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-neon-green/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-neon-green/5 rounded-full pointer-events-none" />
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Geometric Soccer Art - Minimalist Style */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Geometric Element 1 - Large Left */}
        <div className="absolute left-[8%] top-[20%] animate-geo-orbit">
          <svg viewBox="0 0 120 120" className="w-28 h-28 md:w-40 md:h-40 opacity-50">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.2"/>
          </svg>
        </div>

        {/* Geometric Element 2 - Medium Right */}
        <div className="absolute right-[10%] top-[30%] animate-geo-orbit-reverse">
          <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-36 md:h-36 opacity-40">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.15"/>
          </svg>
        </div>

        {/* Geometric Element 3 - Bottom Left (Original Style) */}
        <div className="absolute left-[15%] bottom-[18%] animate-geo-float">
          <svg viewBox="0 0 120 120" className="w-20 h-20 md:w-28 md:h-28 opacity-45">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.25"/>
          </svg>
        </div>

        {/* Geometric Element 4 - Top Right Small */}
        <div className="absolute right-[20%] top-[12%] animate-geo-pulse">
          <svg viewBox="0 0 120 120" className="w-16 h-16 md:w-24 md:h-24 opacity-35">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.2"/>
          </svg>
        </div>

        {/* Geometric Element 5 - Bottom Right */}
        <div className="absolute right-[15%] bottom-[22%] animate-geo-float-gentle">
          <svg viewBox="0 0 120 120" className="w-16 h-16 md:w-20 md:h-20 opacity-30">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.15"/>
          </svg>
        </div>

        {/* Geometric Element 6 - Center Left */}
        <div className="absolute left-[5%] top-[50%] animate-geo-rotate-slow">
          <svg viewBox="0 0 120 120" className="w-14 h-14 md:w-20 md:h-20 opacity-25">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.1"/>
          </svg>
        </div>

        {/* Geometric Element 7 - Center Right */}
        <div className="absolute right-[8%] top-[55%] animate-geo-float-slow">
          <svg viewBox="0 0 120 120" className="w-12 h-12 md:w-16 md:h-16 opacity-30">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#147c60" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" fill="none" stroke="#147c60" strokeWidth="0.5" strokeDasharray="5,5"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="#147c60" strokeWidth="2"/>
            <path d="M60 35 L80 47 L80 73 L60 85 L40 73 L40 47 Z" fill="#147c60" opacity="0.15"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-20 text-center">
        <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase mb-6">
          Setiap Permainan <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-500 drop-shadow-[0_0_10px_rgba(20,124,96,0.5)]">Punya Cerita</span>.
        </h2>

        <p className="font-sans text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-4 leading-relaxed">
          Biarkan Batas Kota menjadi tempat bermain mini soccermu
        </p>

        <p className="font-sans text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Saatnya kamu merasakan kualitas permainan yang sebenarnya mulai sekarang.
        </p>

        <a href="#booking">
          <NeonButton className="flex items-center gap-2 mx-auto">
            Pesan Lapangan <ChevronRight className="w-5 h-5" />
          </NeonButton>
        </a>
      </div>
    </section>
  );
};

export default ClosingCTA;
