'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Arena', href: '/#hero' },
    { name: 'Fitur', href: '/#features' },
    { name: 'Galeri', href: '/#gallery' },
    { name: 'Video', href: '/#video' },
    { name: 'Lokasi', href: '/#location' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-bg/80 backdrop-blur-md border-b border-neon-green/20 py-4' : 'bg-transparent py-6'
      }`}
    >
<div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12">
            <Image 
              src="/logo1.png" 
              alt="Batas Kota Logo"
              width={48}
              height={48}
              className="transition-transform group-hover:scale-110 duration-300"
            />
            <div className="absolute inset-0 blur-md bg-neon-green/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-wider leading-none text-white">
              BATAS<span className="text-neon-green">KOTA</span>
            </span>
            <span className="font-sans text-[10px] tracking-[0.2em] text-gray-400">ARENA</span>
          </div>
        </Link>

{/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="font-sans text-sm uppercase tracking-widest text-gray-300 hover:text-neon-green transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-green transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {/* Show admin options when logged in */}
          {session?.user?.role === 'admin' && (
            <>
              <Link 
                href="/admin/dashboard"
                className="px-4 py-2 border border-cyan-400 text-cyan-400 font-display font-bold text-sm uppercase hover:bg-cyan-400 hover:text-black transition-all duration-300"
              >
                Admin
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 border border-red-400 text-red-400 font-display font-bold text-sm uppercase hover:bg-red-400 hover:text-black transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
          <Link 
            href="/#booking"
            className="px-6 py-2 border border-neon-green text-neon-green font-display font-bold text-sm uppercase hover:bg-neon-green hover:text-black transition-all duration-300 skew-x-[-10deg]"
          >
            <span className="block skew-x-[10deg]">Pesan Sekarang</span>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white hover:text-neon-green transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

{/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-dark-surface border-b border-neon-green/20 backdrop-blur-xl">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-lg text-gray-300 hover:text-neon-green"
              >
                {link.name}
              </Link>
            ))}
            {/* Show admin options in mobile menu when logged in */}
            {session?.user?.role === 'admin' && (
              <>
                <Link 
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-display text-lg text-cyan-400 hover:text-cyan-300"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left font-display text-lg text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            )}
            <Link 
              href="/#booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 text-center w-full py-3 bg-neon-green text-black font-bold font-display uppercase"
            >
              Pesan Sekarang
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
