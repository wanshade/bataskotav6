import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <Image 
                src="/logo1.png" 
                alt="Batas Kota Logo"
                width={32}
                height={32}
              />
              <span className="font-display font-bold text-lg text-white">BATAS<span className="text-neon-green">KOTA</span></span>
            </div>
            <p className="text-gray-600 text-sm">ARENA</p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <a href="https://www.instagram.com/bataskota.point" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-neon-green transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-neon-green transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-neon-green transition-colors"><Twitter className="w-5 h-5" /></a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-xs font-mono">
              &copy; {new Date().getFullYear()} Batas Kota.<br/>All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;