import React, { useEffect, useRef, useState } from 'react';

const images = [
  {
    src: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop",
    title: "Pertandingan Malam",
    category: "Atmosfer"
  },
  {
    src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070&auto=format&fit=crop",
    title: "Rumput Pro",
    category: "Fasilitas"
  },
  {
    src: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071&auto=format&fit=crop",
    title: "Loker Tim",
    category: "Amenitas"
  },
  {
    src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop",
    title: "Permainan Strategis",
    category: "Aksi"
  }
];

const Gallery: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            // Card is entering viewport - add hover effects
            setVisibleCards((prev) => new Set(prev).add(index));
          } else {
            // Card is leaving viewport - remove hover effects
            setVisibleCards((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
          }
        });
      },
      {
        threshold: [0, 0.3], // Trigger when 0% and 30% of the card is visible
        rootMargin: '-50px 0px -50px 0px' // Start animation slightly before fully visible
      }
    );

    const currentRefs = cardRefs.current;
    // Observe all cards
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="gallery" className="py-24 bg-dark-bg">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase mb-2">Arena <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-500 drop-shadow-[0_0_10px_rgba(20,124,96,0.5)]">Kami</span></h2>
            <p className="text-gray-400">Sekilas pengalaman di Batas Kota.</p>
          </div>
          <button className="hidden md:block text-neon-green font-display text-sm uppercase tracking-widest hover:text-white transition-colors">
            Lihat Semua Foto &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((img, idx) => {
            const isVisible = visibleCards.has(idx);
            return (
              <div
                key={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                data-index={idx}
                className={`group relative overflow-hidden rounded-xl h-64 md:h-80 ${idx === 0 || idx === 3 ? 'md:col-span-2' : ''}`}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className={`w-full h-full object-cover transition-all duration-1000 ${
                    isVisible ? 'grayscale-0 scale-105' : 'grayscale scale-100'
                  } md:group-hover:grayscale-0 md:group-hover:scale-110`}
                />

                {/* Overlay */}
                <div className={`absolute inset-0 transition-colors duration-700 ${
                  isVisible ? 'bg-black/30' : 'bg-black/60'
                } md:group-hover:bg-black/30`} />

                {/* Border overlay */}
                <div className={`absolute inset-0 border-2 transition-colors duration-700 m-4 rounded-lg ${
                  isVisible ? 'border-neon-green/50' : 'border-transparent'
                } md:group-hover:border-neon-green/50`} />

                <div className={`absolute bottom-0 left-0 p-8 transition-all duration-700 ${
                  isVisible ? 'translate-y-0' : 'translate-y-4'
                } md:group-hover:translate-y-0`}>
                  <span className={`text-neon-green font-sans text-xs font-bold uppercase tracking-widest mb-1 block transition-all duration-700 delay-100 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  } md:opacity-0 md:group-hover:opacity-100`}>
                    {img.category}
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white transition-opacity duration-700">
                    {img.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Gallery;