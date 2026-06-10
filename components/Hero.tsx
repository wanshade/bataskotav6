import React from 'react';
import dynamic from 'next/dynamic';
import NeonButton from './ui/NeonButton';
import { ChevronRight } from 'lucide-react';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

// Custom animation styles
const heroAnimations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  @keyframes neonPulse {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(132, 204, 22, 0.4)) drop-shadow(0 0 40px rgba(132, 204, 22, 0.2));
    }
    50% {
      filter: drop-shadow(0 0 30px rgba(132, 204, 22, 0.8)) drop-shadow(0 0 60px rgba(132, 204, 22, 0.4));
    }
  }

  @keyframes textReveal {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
      filter: blur(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes glowSweep {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  .logo-animate {
    animation: 
      fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards,
      float 4s ease-in-out infinite 0.8s,
      neonPulse 3s ease-in-out infinite 0.8s;
    opacity: 0;
  }

  .logo-animate:hover {
    transform: scale(1.08);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .heading-reveal {
    animation: textReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  .heading-reveal-delay-1 {
    animation: textReveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
    opacity: 0;
  }

  .heading-reveal-delay-2 {
    animation: textReveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    opacity: 0;
  }
`;

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Overlay & Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg z-10 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg z-10 opacity-40" />
        <div className="absolute inset-0 bg-[url('/herobg.png')] bg-cover bg-center opacity-90" />
        
        {/* Grid Effect */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(20, 124, 96, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 124, 96, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)'
          }}
        />
      </div>

      {/* 3D Scene Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-80">
        <Scene3D />
      </div>

      <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-8 backdrop-blur-sm animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-neon-green font-sans text-xs font-bold uppercase tracking-widest">
            MINI SOCCER TERBAIK DI LOMBOK
          </span>
        </div>
         {/* Logo for mobile version */}
        <img
          src="/logo1.png"
          alt="Batas Kota Logo"
          className="md:hidden w-48 h-auto mb-6 logo-animate cursor-pointer"
        />

         {/* Heading for tablet/desktop version */}
        <h1 className="hidden md:block font-display font-black text-5xl md:text-6xl lg:text-7xl leading-tight uppercase mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <span className="heading-reveal-delay-1 inline-block">Batas Kota</span> <br />
          <span className="text-neon-green drop-shadow-[0_0_20px_rgba(20,124,96,0.4)] heading-reveal-delay-2 inline-block">The Town Space</span>
        </h1>

        <p className="font-sans text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Lapangan mini soccer terbaik di Lombok. 
          Rumput standar FIFA, suasana malam keren, yang bikin main makin seru.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <a href="#booking">
            <NeonButton className="flex items-center gap-2">
              Pesan Lapangan <ChevronRight className="w-5 h-5" />
            </NeonButton>
          </a>
          <a href="#features" className="text-white font-display text-sm uppercase tracking-widest hover:text-neon-green transition-colors border-b border-transparent hover:border-neon-green pb-1">
            Jelajahi Fitur
          </a>
        </div>
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-neon-green/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Animation Styles */}
      <style jsx>{heroAnimations}</style>
    </section>
  );
};

export default Hero;
