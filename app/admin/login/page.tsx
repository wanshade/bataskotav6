'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Mail, Eye, EyeOff, ShieldCheck, Sparkles, Trophy } from 'lucide-react';

const LOADING_MESSAGES = [
  'Memverifikasi kredensial...',
  'Mengamankan sesi...',
  'Menyiapkan dasbor...',
];

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState('');
  const router = useRouter();

  // Rotate loading messages while authenticating for a premium feel.
  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[i]);
    }, 1100);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (result?.ok) {
        setLoadingMessage('Mengarahkan ke dasbor...');
        router.push('/admin/dashboard');
      }
    } catch {
      setError('Login gagal. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-shell min-h-screen flex font-sans text-slate-800">
      {/* ===== Left: Brand Showcase ===== */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden brand-gradient">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

        {/* Grid overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full text-white">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center font-display font-black text-xl shadow-lg">
              B
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight tracking-wide">BATAS KOTA</p>
              <p className="text-[11px] text-white/70 font-medium tracking-[0.2em] uppercase">Town Space</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Login Admin
            </span>
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              Masuk ke panel<br />
              <span className="text-emerald-100">admin Batas Kota.</span>
            </h1>
            <p className="text-emerald-50/80 text-base max-w-md leading-relaxed">
              Halaman ini khusus untuk admin. Silakan masuk dengan akun Anda untuk mengelola booking, jadwal lapangan, dan pembayaran.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                { icon: ShieldCheck, label: 'Akses Terbatas' },
                { icon: Trophy, label: 'Khusus Admin' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-sm font-medium"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Batas Kota — The Town Space. Setiap permainan punya cerita. ⚽
          </p>
        </div>
      </aside>

      {/* ===== Right: Login Form ===== */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="brand-gradient h-11 w-11 rounded-2xl flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-emerald-500/25">
              B
            </div>
            <div>
              <p className="font-display font-bold text-slate-800 leading-tight tracking-wide">BATAS KOTA</p>
              <p className="text-[11px] text-slate-400 font-medium tracking-[0.2em] uppercase">Town Space</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex p-3 brand-gradient-soft border border-emerald-100 rounded-2xl mb-5">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Selamat datang kembali
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Masuk untuk mengakses dasbor admin Batas Kota.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
              <div className="flex-shrink-0 p-1 rounded-lg bg-rose-100 text-rose-600">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-rose-700 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="admin@bataskotapoint.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white brand-gradient shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Masuk...
                </>
              ) : (
                <>
                  Masuk ke Dasbor
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Back to home */}
          <div className="text-center pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>

      {/* ===== Loading Overlay ===== */}
      {isLoading && (
        <div className="login-overlay fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 px-6">
            {/* Animated brand mark with expanding rings */}
            <div className="relative flex items-center justify-center">
              {/* Expanding rings */}
              <span className="login-ring absolute inline-flex h-20 w-20 rounded-full bg-emerald-400/30" />
              <span
                className="login-ring absolute inline-flex h-20 w-20 rounded-full bg-emerald-400/20"
                style={{ animationDelay: '1s' }}
              />
              {/* Floating brand logo */}
              <div className="login-brand-float relative brand-gradient h-20 w-20 rounded-3xl flex items-center justify-center text-white font-display font-black text-3xl shadow-2xl shadow-emerald-500/40">
                B
              </div>
            </div>

            {/* Status text + animated dots */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-white font-semibold text-base tracking-wide">
                {loadingMessage}
              </p>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="login-status-dot w-2 h-2 rounded-full bg-emerald-400"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
