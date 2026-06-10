import React, { useEffect, useRef, useState } from 'react';
import { Play, Volume2 } from 'lucide-react';

const Video: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0] || url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=1&autoplay=0&fs=1&cc_load_policy=1&hl=en&enablejsapi=1`;
  };

  const getYouTubeWatchUrl = (url: string) => {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0] || url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  return (
    <section
      id="video"
      ref={sectionRef}
      className="py-24 bg-dark-bg relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2339FF14' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="font-display font-bold text-4xl md:text-5xl uppercase mb-4">
            Experience <span className="text-neon-green">Batas Kota</span>
          </h2>
          <div className="h-1 w-24 bg-neon-green mx-auto rounded-full shadow-[0_0_10px_#147c60]" />
          <p className="mt-6 text-gray-400 max-w-2xl mx-auto font-sans">
            Step into the arena where legends are made. Watch the action unfold on our world-class pitch.
          </p>
        </div>

        {/* Video Container */}
        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="relative bg-dark-surface rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-zinc-800">

            {/* Neon Border Frame */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-green via-neon-green to-neon-green opacity-0 hover:opacity-100 transition-opacity duration-700 -z-10 blur-sm" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-green via-neon-green to-neon-green opacity-0 hover:opacity-100 transition-opacity duration-700 z-10 p-[2px] -z-10">
              <div className="w-full h-full bg-dark-surface rounded-2xl" />
            </div>

            {/* Video Wrapper */}
            <div className="relative aspect-video overflow-hidden">
              {hasError ? (
                // Fallback: Direct YouTube link
                <div className="w-full h-full bg-dark-surface flex items-center justify-center">
                  <a
                    href={getYouTubeWatchUrl('https://youtu.be/cz5sCPi4kr4')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-4 text-center p-8"
                  >
                    <div className="w-20 h-20 rounded-full bg-neon-green flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-black ml-1" />
                    </div>
                    <span className="text-neon-green font-display text-lg">Watch on YouTube</span>
                    <span className="text-gray-400 text-sm">Video couldn't be embedded. Click to watch directly.</span>
                  </a>
                </div>
              ) : (
                <iframe
                  src={getYouTubeEmbedUrl('https://youtu.be/cz5sCPi4kr4')}
                  title="Batas Kota - The Town Space"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="w-full h-full border-0"
                  loading="lazy"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms"
                  onError={() => setHasError(true)}
                />
              )}

              {/* Decorative Corner Elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neon-green opacity-60" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neon-green opacity-60" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neon-green opacity-60" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neon-green opacity-60" />
            </div>

            {/* Video Info Bar */}
            <div className="bg-dark-card px-6 py-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                  <span className="text-neon-green font-sans text-sm font-medium uppercase tracking-wider">
                    Now Playing
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1 text-xs">
                    <Volume2 className="w-3 h-3" />
                    <span>HD Quality</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Play className="w-3 h-3" />
                    <span>Official Video</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-gray-400 mb-6 font-sans">
              Ready to write your own story? Book your match today.
            </p>
            <a
              href="#booking"
              className="inline-flex items-center gap-2 px-8 py-3 bg-dark-surface border border-neon-green text-neon-green font-display text-sm uppercase tracking-widest rounded-lg hover:bg-neon-green hover:text-dark-bg transition-all duration-300 shadow-[0_0_20px_rgba(20,124,96,0.3)] hover:shadow-[0_0_30px_rgba(20,124,96,0.5)]"
            >
              Book Your Match
              <Play className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Video;